import * as exportService from '../services/export.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const users = asyncHandler(async (_req, res) => {
  const csv = await exportService.exportUsers();
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
  res.send(csv);
});

export const auctions = asyncHandler(async (_req, res) => {
  const csv = await exportService.exportAuctions();
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=auctions.csv');
  res.send(csv);
});

export const tickets = asyncHandler(async (_req, res) => {
  const csv = await exportService.exportTickets();
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=tickets.csv');
  res.send(csv);
});
