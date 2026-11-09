import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as Crypto from 'expo-crypto';
import { storage, uid } from './storage';

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  location?: string;
  createdAt: string;
};

type StoredUser = User & { passwordHash: string; salt: string };

type AuthCtx = {
  user: User | null;
  ready: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (patch: Partial<Omit<User, 'id' | 'createdAt'>>) => Promise<void>;
  changePassword: (current: string, next: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  setNewPassword: (email: string, next: string) => Promise<void>;
};

const Ctx = createContext<AuthCtx>(null as unknown as AuthCtx);

const USERS = 'auth:users';
const SESSION = 'auth:session';

async function hash(password: string, salt: string) {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${password}`);
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function passwordIssues(pw: string) {
  const issues: string[] = [];
  if (pw.length < 8) issues.push('At least 8 characters');
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) issues.push('Contains a letter and a number');
  return issues;
}

const strip = ({ passwordHash, salt, ...u }: StoredUser): User => u;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const id = await storage.get<string | null>(SESSION, null);
      if (id) {
        const users = await storage.get<StoredUser[]>(USERS, []);
        const found = users.find((u) => u.id === id);
        if (found) setUser(strip(found));
      }
      setReady(true);
    })();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const users = await storage.get<StoredUser[]>(USERS, []);
    const found = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!found) throw new Error('No account found with that email.');
    if ((await hash(password, found.salt)) !== found.passwordHash) throw new Error('Incorrect password. Please try again.');
    await storage.set(SESSION, found.id);
    setUser(strip(found));
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const users = await storage.get<StoredUser[]>(USERS, []);
    const e = email.trim().toLowerCase();
    if (!name.trim()) throw new Error('Please enter your name.');
    if (!EMAIL_RE.test(e)) throw new Error('Please enter a valid email address.');
    if (passwordIssues(password).length) throw new Error('Password must be 8+ characters with a letter and a number.');
    if (users.some((u) => u.email.toLowerCase() === e)) throw new Error('An account with this email already exists.');
    const salt = uid('s');
    const nu: StoredUser = {
      id: uid('u'),
      name: name.trim(),
      email: e,
      createdAt: new Date().toISOString(),
      salt,
      passwordHash: await hash(password, salt),
    };
    await storage.set(USERS, [...users, nu]);
    await storage.set(SESSION, nu.id);
    setUser(strip(nu));
  }, []);

  const signOut = useCallback(async () => {
    await storage.remove(SESSION);
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (patch: Partial<Omit<User, 'id' | 'createdAt'>>) => {
      if (!user) return;
      const users = await storage.get<StoredUser[]>(USERS, []);
      if (patch.email) {
        const e = patch.email.trim().toLowerCase();
        if (!EMAIL_RE.test(e)) throw new Error('Please enter a valid email address.');
        if (users.some((u) => u.id !== user.id && u.email.toLowerCase() === e)) throw new Error('That email is already in use.');
        patch.email = e;
      }
      const next = users.map((u) => (u.id === user.id ? { ...u, ...patch } : u));
      await storage.set(USERS, next);
      setUser({ ...user, ...patch });
    },
    [user]
  );

  const changePassword = useCallback(
    async (current: string, nextPw: string) => {
      if (!user) return;
      const users = await storage.get<StoredUser[]>(USERS, []);
      const me = users.find((u) => u.id === user.id)!;
      if ((await hash(current, me.salt)) !== me.passwordHash) throw new Error('Your current password is incorrect.');
      if (passwordIssues(nextPw).length) throw new Error('New password must be 8+ characters with a letter and a number.');
      const salt = uid('s');
      const passwordHash = await hash(nextPw, salt);
      await storage.set(USERS, users.map((u) => (u.id === user.id ? { ...u, salt, passwordHash } : u)));
    },
    [user]
  );

  const deleteAccount = useCallback(
    async (password: string) => {
      if (!user) return;
      const users = await storage.get<StoredUser[]>(USERS, []);
      const me = users.find((u) => u.id === user.id)!;
      if ((await hash(password, me.salt)) !== me.passwordHash) throw new Error('Incorrect password.');
      await storage.set(USERS, users.filter((u) => u.id !== user.id));
      await storage.remove(`user:${user.id}`);
      await storage.remove(SESSION);
      setUser(null);
    },
    [user]
  );

  const resetPassword = useCallback(async (email: string) => {
    const users = await storage.get<StoredUser[]>(USERS, []);
    return users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  }, []);

  const setNewPassword = useCallback(async (email: string, nextPw: string) => {
    if (passwordIssues(nextPw).length) throw new Error('Password must be 8+ characters with a letter and a number.');
    const users = await storage.get<StoredUser[]>(USERS, []);
    const e = email.trim().toLowerCase();
    const salt = uid('s');
    const passwordHash = await hash(nextPw, salt);
    await storage.set(USERS, users.map((u) => (u.email.toLowerCase() === e ? { ...u, salt, passwordHash } : u)));
  }, []);

  const value = useMemo(
    () => ({ user, ready, signIn, signUp, signOut, updateProfile, changePassword, deleteAccount, resetPassword, setNewPassword }),
    [user, ready, signIn, signUp, signOut, updateProfile, changePassword, deleteAccount, resetPassword, setNewPassword]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
