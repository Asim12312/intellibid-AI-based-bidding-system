import * as ticketService from '../services/ticket.service.js';
import * as analyticsService from '../services/analytics.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const list = asyncHandler(async (req, res) => {
  const data = await ticketService.listTickets(req.query);
  res.json({ success: true, data });
});

export const summary = asyncHandler(async (_req, res) => {
  const data = await analyticsService.getTicketSummary();
  res.json({ success: true, data });
});

export const getById = asyncHandler(async (req, res) => {
  const data = await ticketService.getTicketById(req.params.id);
  res.json({ success: true, data });
});

export const addMessage = asyncHandler(async (req, res) => {
  const data = await ticketService.addMessage(req.params.id, req.body, req.admin._id);
  res.json({ success: true, data });
});

export const resolve = asyncHandler(async (req, res) => {
  const data = await ticketService.resolveTicket(req.params.id, req.body.note, req.admin._id);
  res.json({ success: true, data });
});

export const escalate = asyncHandler(async (req, res) => {
  const data = await ticketService.escalateTicket(req.params.id, req.body.note, req.admin._id);
  res.json({ success: true, data });
});

export const reject = asyncHandler(async (req, res) => {
  const data = await ticketService.rejectTicket(req.params.id, req.body.note, req.admin._id);
  res.json({ success: true, data });
});

export const paymentOverride = asyncHandler(async (req, res) => {
  const data = await ticketService.paymentOverride(req.params.id, req.admin._id);
  res.json({ success: true, data });
});

export const analyze = asyncHandler(async (req, res) => {
  const data = await ticketService.analyzeTicket(req.params.id);
  res.json({ success: true, data });
});
