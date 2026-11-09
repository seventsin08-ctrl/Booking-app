import { toISODate } from './data';
import type { Booking } from './store';

export type TripTab = 'upcoming' | 'past' | 'cancelled';

export function tripStatus(b: Booking): TripTab {
  if (b.status === 'cancelled') return 'cancelled';
  return b.checkOut < toISODate(new Date()) ? 'past' : 'upcoming';
}
