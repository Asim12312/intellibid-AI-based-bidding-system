import { PlatformUser } from '../models/PlatformUser.js';
import { Auction } from '../models/Auction.js';
import { Ticket } from '../models/Ticket.js';

export async function globalSearch(q, limit = 10) {
  const search = q.trim();
  if (!search) return { users: [], auctions: [], tickets: [] };

  const regex = { $regex: search, $options: 'i' };
  const [users, auctions, tickets] = await Promise.all([
    PlatformUser.find({
      $or: [{ name: regex }, { email: regex }, { platformId: regex }],
    })
      .limit(limit)
      .select('platformId name email status avatarUrl'),
    Auction.find({
      $or: [{ title: regex }, { lotId: regex }, { category: regex }],
    })
      .limit(limit)
      .select('lotId title category status currentBid imageUrl'),
    Ticket.find({
      $or: [{ title: regex }, { ticketId: regex }],
    })
      .limit(limit)
      .select('ticketId title status priority'),
  ]);

  return { users, auctions, tickets };
}
