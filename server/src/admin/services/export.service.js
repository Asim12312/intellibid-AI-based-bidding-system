import { PlatformUser } from '../models/PlatformUser.js';
import { Auction } from '../models/Auction.js';
import { Ticket } from '../models/Ticket.js';

function toCsv(rows, headers) {
  const escape = (val) => {
    const str = val == null ? '' : String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(','));
  }
  return lines.join('\n');
}

export async function exportUsers() {
  const users = await PlatformUser.find().lean();
  const headers = ['platformId', 'name', 'email', 'status', 'isFlagged', 'riskScore', 'trustScore', 'createdAt'];
  const rows = users.map((u) => ({
    platformId: u.platformId,
    name: u.name,
    email: u.email,
    status: u.status,
    isFlagged: u.isFlagged,
    riskScore: u.riskScore,
    trustScore: u.trustScore,
    createdAt: u.createdAt?.toISOString(),
  }));
  return toCsv(rows, headers);
}

export async function exportAuctions() {
  const auctions = await Auction.find().lean();
  const headers = ['lotId', 'title', 'category', 'status', 'currentBid', 'currency', 'bidCount', 'endsAt'];
  const rows = auctions.map((a) => ({
    lotId: a.lotId,
    title: a.title,
    category: a.category,
    status: a.status,
    currentBid: a.currentBid,
    currency: a.currency,
    bidCount: a.bidCount,
    endsAt: a.endsAt?.toISOString(),
  }));
  return toCsv(rows, headers);
}

export async function exportTickets() {
  const tickets = await Ticket.find().lean();
  const headers = ['ticketId', 'title', 'type', 'priority', 'status', 'createdAt'];
  const rows = tickets.map((t) => ({
    ticketId: t.ticketId,
    title: t.title,
    type: t.type,
    priority: t.priority,
    status: t.status,
    createdAt: t.createdAt?.toISOString(),
  }));
  return toCsv(rows, headers);
}
