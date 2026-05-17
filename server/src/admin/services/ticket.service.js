import { Ticket } from '../models/Ticket.js';
import { PlatformUser } from '../models/PlatformUser.js';
import { Auction } from '../models/Auction.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { ApiError } from '../utils/ApiError.js';
import { formatCurrency } from '../utils/formatters.js';
import * as aiService from './ai.service.js';

function formatTicketListItem(ticket, activeId) {
  const levelMap = { urgent: 'Urgent', medium: 'Medium', low: 'Low' };
  const colorMap = {
    urgent: 'bg-[var(--hotpink)]',
    medium: 'bg-[var(--sunset)]',
    low: 'bg-[var(--muted)]',
  };
  return {
    id: ticket._id,
    ticketId: ticket.ticketId,
    title: ticket.title,
    user: ticket.userId?.username || ticket.userId?.name || 'unknown',
    level: levelMap[ticket.priority] || 'Medium',
    color: colorMap[ticket.priority] || 'bg-[var(--muted)]',
    msg: ticket.status === 'under_ai_review' ? 'Active' : formatRelativeShort(ticket.lastMessageAt),
    active: activeId ? String(ticket._id) === String(activeId) : ticket.status === 'under_ai_review',
    priority: ticket.priority,
    status: ticket.status,
    lastMessageAt: ticket.lastMessageAt,
  };
}

function formatRelativeShort(date) {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

function formatTicketDetail(ticket, user, auction) {
  const statusLabel =
    ticket.status === 'under_ai_review'
      ? 'Under AI Review'
      : ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace('_', ' ');

  return {
    id: ticket._id,
    ticketId: ticket.ticketId,
    title: ticket.title,
    type: ticket.type,
    priority: ticket.priority,
    status: ticket.status,
    statusLabel,
    aiGenuinenessScore: ticket.aiGenuinenessScore,
    aiScoreLabel: ticket.aiGenuinenessScore
      ? `AI SCORE: ${ticket.aiGenuinenessScore}% GENUINE`
      : null,
    auctionRef: auction?.auctionRef || auction?.title || '',
    auctionId: auction?._id,
    messages: ticket.messages.map((m) => ({
      id: m._id,
      senderType: m.senderType,
      body: m.body,
      createdAt: m.createdAt,
      time: formatMessageTime(m.createdAt),
    })),
    user: user
      ? {
          id: user._id,
          username: user.username,
          name: user.name,
          trustScore: user.trustScore,
          verificationTier: user.verificationTier?.toUpperCase(),
          avatarUrl: user.avatarUrl,
        }
      : null,
    auction: auction
      ? {
          id: auction._id,
          title: auction.title,
          imageUrl: auction.imageUrl,
          currentBid: formatCurrency(auction.currentBid, auction.currency),
          status: auction.status,
        }
      : null,
    paymentOverrideRequested: ticket.paymentOverrideRequested,
    paymentOverrideApproved: ticket.paymentOverrideApproved,
    openedAt: ticket.createdAt,
  };
}

function formatMessageTime(date) {
  const d = new Date(date);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export async function listTickets(query) {
  const filter = {};
  if (query.status) filter.status = query.status;
  else filter.status = { $in: ['open', 'under_ai_review', 'escalated'] };

  const tickets = await Ticket.find(filter)
    .populate('userId', 'name username avatarUrl')
    .sort({ priority: 1, lastMessageAt: -1 });

  const activeId = query.activeId;
  return tickets.map((t) => formatTicketListItem(t, activeId));
}

export async function getTicketById(id) {
  const ticket = await Ticket.findById(id).populate('userId');
  if (!ticket) throw ApiError.notFound('Ticket not found');

  const user = ticket.userId;
  const auction = ticket.auctionId ? await Auction.findById(ticket.auctionId) : null;
  return formatTicketDetail(ticket, user, auction);
}

export async function addMessage(id, body, adminId) {
  const ticket = await Ticket.findById(id);
  if (!ticket) throw ApiError.notFound('Ticket not found');

  ticket.messages.push({
    senderType: 'admin',
    senderId: adminId,
    body: body.message,
  });
  ticket.lastMessageAt = new Date();
  await ticket.save();

  return getTicketById(id);
}

export async function resolveTicket(id, note, adminId) {
  const ticket = await Ticket.findById(id);
  if (!ticket) throw ApiError.notFound('Ticket not found');

  ticket.status = 'resolved';
  ticket.resolvedAt = new Date();
  ticket.resolvedBy = adminId;
  ticket.resolutionNote = note || 'Resolved by admin';
  ticket.messages.push({
    senderType: 'system',
    body: `Ticket resolved. ${ticket.resolutionNote}`,
  });
  await ticket.save();

  await ActivityLog.create({
    type: 'ticket_resolve',
    message: `Ticket ${ticket.ticketId} resolved: ${ticket.title}`,
    actorId: adminId,
    metadata: { ticketId: ticket._id },
  });

  return getTicketById(id);
}

export async function escalateTicket(id, note, adminId) {
  const ticket = await Ticket.findById(id);
  if (!ticket) throw ApiError.notFound('Ticket not found');

  ticket.status = 'escalated';
  ticket.messages.push({
    senderType: 'system',
    body: note || 'Ticket escalated to senior admin review.',
  });
  ticket.lastMessageAt = new Date();
  await ticket.save();

  await ActivityLog.create({
    type: 'other',
    message: `Ticket ${ticket.ticketId} escalated`,
    actorId: adminId,
    metadata: { ticketId: ticket._id },
  });

  return getTicketById(id);
}

export async function rejectTicket(id, note, adminId) {
  const ticket = await Ticket.findById(id);
  if (!ticket) throw ApiError.notFound('Ticket not found');

  ticket.status = 'rejected';
  ticket.resolutionNote = note || 'Rejected by admin';
  ticket.resolvedAt = new Date();
  ticket.resolvedBy = adminId;
  ticket.messages.push({
    senderType: 'system',
    body: ticket.resolutionNote,
  });
  await ticket.save();

  return getTicketById(id);
}

export async function paymentOverride(id, adminId) {
  const ticket = await Ticket.findById(id);
  if (!ticket) throw ApiError.notFound('Ticket not found');
  if (ticket.type !== 'payment') {
    throw ApiError.badRequest('Payment override only applies to payment tickets');
  }

  ticket.paymentOverrideRequested = true;
  ticket.paymentOverrideApproved = true;
  ticket.messages.push({
    senderType: 'system',
    body: 'ADMIN DECISION: Manual payment override approved. Stripe automated security checks bypassed.',
  });
  ticket.lastMessageAt = new Date();
  await ticket.save();

  await ActivityLog.create({
    type: 'transaction_alert',
    message: `Payment override executed for ticket ${ticket.ticketId}`,
    actorId: adminId,
    metadata: { ticketId: ticket._id },
  });

  return getTicketById(id);
}

export async function analyzeTicket(id) {
  const ticket = await Ticket.findById(id).populate('userId');
  if (!ticket) throw ApiError.notFound('Ticket not found');

  const analysis = await aiService.analyzeTicket(ticket);
  ticket.aiGenuinenessScore = analysis.score;
  ticket.status = 'under_ai_review';
  ticket.messages.push({
    senderType: 'ai',
    body: analysis.reply,
  });
  ticket.lastMessageAt = new Date();
  await ticket.save();

  return getTicketById(id);
}
