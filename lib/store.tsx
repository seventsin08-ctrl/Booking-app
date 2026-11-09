import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './auth';
import { storage, uid } from './storage';
import {
  LISTINGS, Listing, Review, SEED_REVIEWS, hostBlockedDates, nightsBetween, parseISODate, toISODate, formatRange,
} from './data';
import { cancelScheduled, pushAt, pushNow } from './notify';
import { setHapticsEnabled } from '@/components/ui';

export type Guests = { adults: number; children: number; infants: number; pets: number };

export type Booking = {
  id: string;
  listingId: string;
  userId: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  guests: Guests;
  extras: string[];
  total: number;
  paymentLabel: string;
  message?: string;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
  reviewed?: boolean;
  reminderId?: string | null;
  code: string;
};

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  date: string;
  read: boolean;
  icon: string;
  link?: string;
};

export type Message = { id: string; from: 'me' | 'host'; text: string; date: string };
export type Conversation = {
  id: string;
  listingId?: string;
  name: string;
  avatar?: string;
  subtitle: string;
  messages: Message[];
  unread: number;
};

export type PaymentMethod = { id: string; brand: string; last4: string; exp: string; holder: string; isDefault: boolean };

export type Settings = {
  push: boolean;
  bookingUpdates: boolean;
  messages: boolean;
  reminders: boolean;
  promotions: boolean;
  currency: string;
  language: string;
  hapticFeedback: boolean;
};

type UserData = {
  favorites: string[];
  recentlyViewed: string[];
  notifications: AppNotification[];
  conversations: Conversation[];
  settings: Settings;
  paymentMethods: PaymentMethod[];
  hostMode: boolean;
  seeded: boolean;
};

const DEFAULT_SETTINGS: Settings = {
  push: true, bookingUpdates: true, messages: true, reminders: true, promotions: false,
  currency: 'USD', language: 'English', hapticFeedback: true,
};

const emptyData = (): UserData => ({
  favorites: [], recentlyViewed: [], notifications: [], conversations: [], settings: DEFAULT_SETTINGS,
  paymentMethods: [], hostMode: false, seeded: false,
});

const HOST_REPLIES = [
  'Thanks for your message! I\'ll get back to you with details shortly. 😊',
  'Great question — yes, that works perfectly. Let me know if you need anything else.',
  'Absolutely! I\'ll make sure everything is ready for your arrival.',
  'Happy to help. Check-in instructions will be sent 24 hours before you arrive.',
];

function replyFor(text: string) {
  const t = text.toLowerCase();
  if (/(check.?in|arrive|arrival|early)/.test(t)) return 'Early check-in is usually possible — I\'ll confirm the day before. The smart lock code arrives 24h before check-in.';
  if (/(park|car)/.test(t)) return 'Yes, there\'s free parking on the premises. Just use the spot marked with the bookmark sign.';
  if (/(wifi|wi-fi|internet)/.test(t)) return 'The Wi-Fi is fast (300 Mbps). Network and password are on the welcome card inside.';
  if (/(pet|dog|cat)/.test(t)) return 'Well-behaved pets are welcome! Please let me know their size so I can prepare a bed.';
  if (/(thank|thanks)/.test(t)) return 'You\'re very welcome! Have a wonderful stay. 🙌';
  return HOST_REPLIES[Math.floor(Math.random() * HOST_REPLIES.length)];
}

type Ctx = UserData & {
  loaded: boolean;
  listings: Listing[];
  bookings: Booking[]; // all bookings (global)
  myBookings: Booking[];
  reviews: Review[];
  getListing: (id: string) => Listing | undefined;
  reviewsFor: (listingId: string) => Review[];
  ratingFor: (l: Listing) => { rating: number; count: number };
  unavailableDates: (listingId: string, excludeBookingId?: string) => Set<string>;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  viewListing: (id: string) => void;
  clearRecentlyViewed: () => void;
  createBooking: (b: Omit<Booking, 'id' | 'userId' | 'guestName' | 'status' | 'createdAt' | 'code'>) => Promise<Booking>;
  cancelBooking: (id: string) => Promise<void>;
  addReview: (bookingId: string, rating: number, text: string) => Promise<void>;
  openConversation: (listingId: string) => string;
  sendMessage: (convId: string, text: string) => void;
  markConversationRead: (convId: string) => void;
  deleteConversation: (convId: string) => void;
  notify: (title: string, body: string, icon?: string, link?: string, push?: keyof Settings) => void;
  markNotificationsRead: () => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  updateSettings: (patch: Partial<Settings>) => void;
  addPaymentMethod: (p: Omit<PaymentMethod, 'id' | 'isDefault'>) => void;
  removePaymentMethod: (id: string) => void;
  setDefaultPayment: (id: string) => void;
  setHostMode: (v: boolean) => void;
  createListing: (l: Omit<Listing, 'id' | 'rating' | 'reviewCount' | 'createdBy'>) => Promise<Listing>;
  deleteListing: (id: string) => Promise<void>;
  unreadMessages: number;
  unreadNotifications: number;
};

const StoreCtx = createContext<Ctx>(null as unknown as Ctx);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [data, setData] = useState<UserData>(emptyData());
  const [loaded, setLoaded] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customListings, setCustomListings] = useState<Listing[]>([]);
  const [customReviews, setCustomReviews] = useState<Review[]>([]);
  const dataRef = useRef(data);
  dataRef.current = data;
  const key = user ? `user:${user.id}` : null;

  // global data
  useEffect(() => {
    (async () => {
      setBookings(await storage.get<Booking[]>('global:bookings', []));
      setCustomListings(await storage.get<Listing[]>('global:listings', []));
      setCustomReviews(await storage.get<Review[]>('global:reviews', []));
    })();
  }, [user?.id]);

  // per-user data
  useEffect(() => {
    if (!key || !user) {
      setData(emptyData());
      setLoaded(false);
      return;
    }
    (async () => {
      let d = { ...emptyData(), ...(await storage.get<Partial<UserData>>(key, {})) } as UserData;
      d.settings = { ...DEFAULT_SETTINGS, ...d.settings };
      if (!d.seeded) {
        const now = new Date().toISOString();
        d = {
          ...d,
          seeded: true,
          paymentMethods: [{ id: uid('pm'), brand: 'Visa', last4: '4242', exp: '08/29', holder: user.name, isDefault: true }],
          notifications: [
            { id: uid('n'), title: `Welcome to Staymark, ${user.name.split(' ')[0]}!`, body: 'Bookmark places you love, book in seconds, and manage every trip in one place.', date: now, read: false, icon: 'bookmark' },
            { id: uid('n'), title: 'Finish your profile', body: 'Add a photo and a phone number so hosts know who\'s coming.', date: now, read: false, icon: 'person-circle-outline', link: '/settings/personal' },
          ],
          conversations: [
            {
              id: uid('c'), name: 'Staymark Support', subtitle: 'Here for you 24/7', unread: 1,
              messages: [{ id: uid('m'), from: 'host', text: 'Hi! 👋 I\'m your Staymark assistant. Ask me anything about bookings, payments or your account.', date: now }],
            },
          ],
        };
        // past trip, so reviews can be written right away
        const ci = new Date(); ci.setDate(ci.getDate() - 40);
        const co = new Date(); co.setDate(co.getDate() - 36);
        const past: Booking = {
          id: uid('b'), listingId: 'l6', userId: user.id, guestName: user.name, checkIn: toISODate(ci), checkOut: toISODate(co),
          guests: { adults: 2, children: 0, infants: 0, pets: 0 }, extras: [], total: 478, paymentLabel: 'Visa •••• 4242',
          status: 'confirmed', createdAt: now, code: 'HMK' + Math.floor(100000 + Math.random() * 899999),
        };
        const all = await storage.get<Booking[]>('global:bookings', []);
        const nextAll = [...all, past];
        await storage.set('global:bookings', nextAll);
        setBookings(nextAll);
        await storage.set(key, d);
      }
      setData(d);
      setLoaded(true);
    })();
  }, [key]);

  const update = useCallback(
    (fn: (d: UserData) => UserData) => {
      setData((prev) => {
        const next = fn(prev);
        if (key) storage.set(key, next);
        return next;
      });
    },
    [key]
  );

  const saveBookings = useCallback((fn: (b: Booking[]) => Booking[]) => {
    setBookings((prev) => {
      const next = fn(prev);
      storage.set('global:bookings', next);
      return next;
    });
  }, []);

  const listings = useMemo(() => [...customListings, ...LISTINGS], [customListings]);
  const reviews = useMemo(() => [...customReviews, ...SEED_REVIEWS], [customReviews]);
  const getListing = useCallback((id: string) => listings.find((l) => l.id === id), [listings]);
  const reviewsFor = useCallback(
    (id: string) => reviews.filter((r) => r.listingId === id).sort((a, b) => b.date.localeCompare(a.date)),
    [reviews]
  );
  const ratingFor = useCallback(
    (l: Listing) => {
      const extra = customReviews.filter((r) => r.listingId === l.id);
      const count = l.reviewCount + extra.length;
      if (!count) return { rating: 0, count: 0 };
      const sum = l.rating * l.reviewCount + extra.reduce((s, r) => s + r.rating, 0);
      return { rating: Math.round((sum / count) * 100) / 100, count };
    },
    [customReviews]
  );

  const unavailableDates = useCallback(
    (listingId: string, excludeBookingId?: string) => {
      const set = new Set(hostBlockedDates(listingId));
      bookings
        .filter((b) => b.listingId === listingId && b.status === 'confirmed' && b.id !== excludeBookingId)
        .forEach((b) => {
          const n = nightsBetween(b.checkIn, b.checkOut);
          for (let i = 0; i < n; i++) {
            const d = parseISODate(b.checkIn);
            d.setDate(d.getDate() + i);
            set.add(toISODate(d));
          }
        });
      return set;
    },
    [bookings]
  );

  const notify = useCallback(
    (title: string, body: string, icon = 'notifications-outline', link?: string, pushKey?: keyof Settings) => {
      update((d) => ({
        ...d,
        notifications: [{ id: uid('n'), title, body, date: new Date().toISOString(), read: false, icon, link }, ...d.notifications],
      }));
      const s = dataRef.current.settings;
      if (s.push && (!pushKey || s[pushKey])) pushNow(title, body, link ? { link } : {});
    },
    [update]
  );

  const toggleFavorite = useCallback(
    (id: string) =>
      update((d) => ({
        ...d,
        favorites: d.favorites.includes(id) ? d.favorites.filter((f) => f !== id) : [id, ...d.favorites],
      })),
    [update]
  );
  const isFavorite = useCallback((id: string) => data.favorites.includes(id), [data.favorites]);
  const viewListing = useCallback(
    (id: string) => update((d) => ({ ...d, recentlyViewed: [id, ...d.recentlyViewed.filter((x) => x !== id)].slice(0, 12) })),
    [update]
  );
  const clearRecentlyViewed = useCallback(() => update((d) => ({ ...d, recentlyViewed: [] })), [update]);

  const createBooking: Ctx['createBooking'] = useCallback(
    async (b) => {
      if (!user) throw new Error('Not signed in');
      const blocked = unavailableDates(b.listingId);
      const n = nightsBetween(b.checkIn, b.checkOut);
      for (let i = 0; i < n; i++) {
        const d = parseISODate(b.checkIn);
        d.setDate(d.getDate() + i);
        if (blocked.has(toISODate(d))) throw new Error('Some of your dates were just booked. Please choose different dates.');
      }
      const l = getListing(b.listingId);
      const reminderDate = parseISODate(b.checkIn);
      reminderDate.setDate(reminderDate.getDate() - 1);
      reminderDate.setHours(10, 0, 0, 0);
      const reminderId = dataRef.current.settings.push && dataRef.current.settings.reminders
        ? await pushAt(reminderDate, 'Your trip is tomorrow ✈️', `Get ready for ${l?.title}. Check-in from ${l?.checkInTime}.`)
        : null;
      const booking: Booking = {
        ...b, id: uid('b'), userId: user.id, guestName: user.name, status: 'confirmed',
        createdAt: new Date().toISOString(), reminderId,
        code: 'HM' + Math.random().toString(36).slice(2, 8).toUpperCase(),
      };
      saveBookings((all) => [...all, booking]);
      notify(
        'Booking confirmed 🎉',
        `${l?.title} · ${formatRange(b.checkIn, b.checkOut)}. Confirmation code ${booking.code}.`,
        'checkmark-circle-outline',
        `/trip/${booking.id}`,
        'bookingUpdates'
      );
      // open a thread with the host
      if (l) {
        const convId = ensureConversation(l);
        const text = b.message?.trim()
          ? b.message.trim()
          : `Hi ${l.host.name}! I just booked ${formatRange(b.checkIn, b.checkOut)}. Looking forward to it!`;
        sendMessageInternal(convId, text);
      }
      return booking;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, unavailableDates, getListing, saveBookings, notify]
  );

  const cancelBooking = useCallback(
    async (id: string) => {
      const b = bookings.find((x) => x.id === id);
      if (!b) return;
      await cancelScheduled(b.reminderId);
      saveBookings((all) => all.map((x) => (x.id === id ? { ...x, status: 'cancelled' } : x)));
      const l = getListing(b.listingId);
      notify('Reservation cancelled', `Your stay at ${l?.title} was cancelled. Any refund will be returned to ${b.paymentLabel}.`, 'close-circle-outline', `/trip/${id}`, 'bookingUpdates');
    },
    [bookings, saveBookings, getListing, notify]
  );

  const addReview = useCallback(
    async (bookingId: string, rating: number, text: string) => {
      if (!user) return;
      const b = bookings.find((x) => x.id === bookingId);
      if (!b) return;
      const r: Review = {
        id: uid('r'), listingId: b.listingId, author: user.name, avatar: user.avatar, rating, text: text.trim(),
        date: new Date().toISOString(),
      };
      const next = [r, ...customReviews];
      setCustomReviews(next);
      await storage.set('global:reviews', next);
      saveBookings((all) => all.map((x) => (x.id === bookingId ? { ...x, reviewed: true } : x)));
      notify('Thanks for your review!', 'Your feedback helps hosts and other guests.', 'star-outline');
    },
    [user, bookings, customReviews, saveBookings, notify]
  );

  // conversations
  const ensureConversation = (l: Listing) => {
    const existing = dataRef.current.conversations.find((c) => c.listingId === l.id);
    if (existing) return existing.id;
    const conv: Conversation = {
      id: uid('c'), listingId: l.id, name: l.host.name, avatar: l.host.avatar,
      subtitle: `${l.title} · ${l.city}`, messages: [], unread: 0,
    };
    dataRef.current = { ...dataRef.current, conversations: [conv, ...dataRef.current.conversations] };
    update((d) => ({ ...d, conversations: [conv, ...d.conversations.filter((c) => c.id !== conv.id)] }));
    return conv.id;
  };

  const openConversation = useCallback(
    (listingId: string) => {
      const l = getListing(listingId);
      if (!l) return '';
      return ensureConversation(l);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getListing, update]
  );

  const sendMessageInternal = (convId: string, text: string) => {
    const msg: Message = { id: uid('m'), from: 'me', text, date: new Date().toISOString() };
    update((d) => ({
      ...d,
      conversations: d.conversations.map((c) => (c.id === convId ? { ...c, messages: [...c.messages, msg] } : c)),
    }));
    setTimeout(() => {
      const conv = dataRef.current.conversations.find((c) => c.id === convId);
      if (!conv) return;
      const reply: Message = { id: uid('m'), from: 'host', text: replyFor(text), date: new Date().toISOString() };
      update((d) => ({
        ...d,
        conversations: d.conversations.map((c) =>
          c.id === convId ? { ...c, messages: [...c.messages, reply], unread: c.unread + 1 } : c
        ),
      }));
      const s = dataRef.current.settings;
      if (s.push && s.messages) pushNow(`New message from ${conv.name}`, reply.text, { link: `/chat/${convId}` });
    }, 1600);
  };

  const sendMessage = useCallback((convId: string, text: string) => {
    if (text.trim()) sendMessageInternal(convId, text.trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [update]);

  const markConversationRead = useCallback(
    (convId: string) =>
      update((d) => ({ ...d, conversations: d.conversations.map((c) => (c.id === convId ? { ...c, unread: 0 } : c)) })),
    [update]
  );
  const deleteConversation = useCallback(
    (convId: string) => update((d) => ({ ...d, conversations: d.conversations.filter((c) => c.id !== convId) })),
    [update]
  );

  const markNotificationsRead = useCallback(
    () => update((d) => ({ ...d, notifications: d.notifications.map((n) => ({ ...n, read: true })) })),
    [update]
  );
  const removeNotification = useCallback(
    (id: string) => update((d) => ({ ...d, notifications: d.notifications.filter((n) => n.id !== id) })),
    [update]
  );
  const clearNotifications = useCallback(() => update((d) => ({ ...d, notifications: [] })), [update]);
  const updateSettings = useCallback(
    (patch: Partial<Settings>) => update((d) => ({ ...d, settings: { ...d.settings, ...patch } })),
    [update]
  );

  const addPaymentMethod = useCallback(
    (p: Omit<PaymentMethod, 'id' | 'isDefault'>) =>
      update((d) => ({
        ...d,
        paymentMethods: [...d.paymentMethods, { ...p, id: uid('pm'), isDefault: d.paymentMethods.length === 0 }],
      })),
    [update]
  );
  const removePaymentMethod = useCallback(
    (id: string) =>
      update((d) => {
        const rest = d.paymentMethods.filter((p) => p.id !== id);
        if (rest.length && !rest.some((p) => p.isDefault)) rest[0] = { ...rest[0], isDefault: true };
        return { ...d, paymentMethods: rest };
      }),
    [update]
  );
  const setDefaultPayment = useCallback(
    (id: string) =>
      update((d) => ({ ...d, paymentMethods: d.paymentMethods.map((p) => ({ ...p, isDefault: p.id === id })) })),
    [update]
  );
  const setHostMode = useCallback((v: boolean) => update((d) => ({ ...d, hostMode: v })), [update]);

  const createListing: Ctx['createListing'] = useCallback(
    async (l) => {
      if (!user) throw new Error('Not signed in');
      const nl: Listing = { ...l, id: uid('l'), rating: 0, reviewCount: 0, createdBy: user.id };
      const next = [nl, ...customListings];
      setCustomListings(next);
      await storage.set('global:listings', next);
      notify('Your listing is live! 🏡', `${nl.title} is now visible to guests on Staymark.`, 'home-outline', `/listing/${nl.id}`);
      return nl;
    },
    [user, customListings, notify]
  );

  const deleteListing = useCallback(
    async (id: string) => {
      const next = customListings.filter((l) => l.id !== id);
      setCustomListings(next);
      await storage.set('global:listings', next);
    },
    [customListings]
  );

  useEffect(() => {
    setHapticsEnabled(data.settings.hapticFeedback);
  }, [data.settings.hapticFeedback]);

  const myBookings = useMemo(() => (user ? bookings.filter((b) => b.userId === user.id) : []), [bookings, user]);
  const unreadMessages = data.conversations.reduce((s, c) => s + c.unread, 0);
  const unreadNotifications = data.notifications.filter((n) => !n.read).length;

  const value: Ctx = {
    ...data, loaded, listings, bookings, myBookings, reviews, getListing, reviewsFor, ratingFor, unavailableDates,
    toggleFavorite, isFavorite, viewListing, clearRecentlyViewed, createBooking, cancelBooking, addReview,
    openConversation, sendMessage, markConversationRead, deleteConversation, notify, markNotificationsRead,
    removeNotification, clearNotifications, updateSettings, addPaymentMethod, removePaymentMethod, setDefaultPayment,
    setHostMode, createListing, deleteListing, unreadMessages, unreadNotifications,
  };
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export const useStore = () => useContext(StoreCtx);

export function useMoney() {
  const { settings } = useStore();
  return settings.currency;
}
