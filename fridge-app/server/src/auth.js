import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { HttpError } from './fridge.js';
import { read, write } from './store.js';

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const DIETS = new Set(['vegetarian', 'vegan', 'gluten_free', 'lactose_free']);

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

function publicProfile(user) {
  const { id, email, familySize, diet, notificationTime, timezone } = user;
  return {
    id,
    email,
    familySize,
    diet,
    notificationTime,
    timezone,
    notificationsEnabled: Boolean(notificationTime && user.expoPushToken),
  };
}

function makeSession(user) {
  const token = randomBytes(32).toString('base64url');
  user.sessions[hashToken(token)] = Date.now() + SESSION_TTL_MS;
  return token;
}

function validateCredentials(body) {
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    throw new HttpError(400, 'Podaj poprawny adres e-mail');
  }
  if (password.length < 8 || password.length > 128) {
    throw new HttpError(400, 'Hasło musi mieć od 8 do 128 znaków');
  }
  return { email, password };
}

function validateProfile(body, user) {
  const next = { ...user };
  if (Object.hasOwn(body, 'familySize')) {
    const size = Number(body.familySize);
    if (!Number.isInteger(size) || size < 1 || size > 20) {
      throw new HttpError(400, 'familySize: oczekiwana liczba całkowita od 1 do 20');
    }
    next.familySize = size;
  }
  if (Object.hasOwn(body, 'diet')) {
    if (!Array.isArray(body.diet) || body.diet.some((diet) => !DIETS.has(diet))) {
      throw new HttpError(400, 'diet: nieprawidłowa lista preferencji');
    }
    next.diet = [...new Set(body.diet)];
  }
  if (Object.hasOwn(body, 'notificationTime')) {
    const time = body.notificationTime;
    if (time !== null && (typeof time !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time))) {
      throw new HttpError(400, 'notificationTime: oczekiwany format HH:mm lub null');
    }
    next.notificationTime = time;
  }
  if (Object.hasOwn(body, 'timezone')) {
    if (typeof body.timezone !== 'string' || body.timezone.length > 64) {
      throw new HttpError(400, 'timezone: nieprawidłowa strefa czasowa');
    }
    try {
      new Intl.DateTimeFormat('en', { timeZone: body.timezone });
    } catch {
      throw new HttpError(400, 'timezone: nieprawidłowa strefa czasowa');
    }
    next.timezone = body.timezone;
  }
  if (Object.hasOwn(body, 'expoPushToken')) {
    const token = body.expoPushToken;
    if (token !== null && (typeof token !== 'string' || !/^(Exponent|Expo)PushToken\[[^\]]+\]$/.test(token))) {
      throw new HttpError(400, 'expoPushToken: nieprawidłowy token powiadomień');
    }
    next.expoPushToken = token;
  }
  return next;
}

export async function register(body) {
  const { email, password } = validateCredentials(body);
  const salt = randomBytes(16).toString('hex');
  const passwordHash = scryptSync(password, salt, 64).toString('hex');

  return write((state) => {
    state.users ??= {};
    if (Object.values(state.users).some((user) => user.email === email)) {
      throw new HttpError(409, 'Konto z tym adresem e-mail już istnieje');
    }
    const id = randomBytes(16).toString('hex');
    const user = {
      id,
      email,
      salt,
      passwordHash,
      familySize: 1,
      diet: [],
      notificationTime: null,
      timezone: 'UTC',
      expoPushToken: null,
      lastNotificationDate: null,
      sessions: {},
    };
    const token = makeSession(user);
    state.users[id] = user;
    state.userData ??= {};
    state.userData[id] = { fridge: [], custom: [], usage: {} };
    return { token, profile: publicProfile(user) };
  });
}

export async function login(body) {
  const { email, password } = validateCredentials(body);
  return write((state) => {
    state.users ??= {};
    const user = Object.values(state.users).find((candidate) => candidate.email === email);
    if (!user) throw new HttpError(401, 'Nieprawidłowy e-mail lub hasło');
    const actual = Buffer.from(scryptSync(password, user.salt, 64).toString('hex'), 'hex');
    const expected = Buffer.from(user.passwordHash, 'hex');
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
      throw new HttpError(401, 'Nieprawidłowy e-mail lub hasło');
    }
    user.sessions ??= {};
    const now = Date.now();
    for (const [hash, expiresAt] of Object.entries(user.sessions)) {
      if (expiresAt <= now) delete user.sessions[hash];
    }
    return { token: makeSession(user), profile: publicProfile(user) };
  });
}

export function getProfile(userId) {
  return read((state) => {
    const user = state.users?.[userId];
    if (!user) throw new HttpError(401, 'Sesja użytkownika wygasła');
    return publicProfile(user);
  });
}

export function updateProfile(userId, body) {
  return write((state) => {
    const user = state.users?.[userId];
    if (!user) throw new HttpError(401, 'Sesja użytkownika wygasła');
    const updated = validateProfile(body ?? {}, user);
    Object.assign(user, updated);
    return publicProfile(user);
  });
}

export function logout(userId, token) {
  const tokenHash = hashToken(token);
  return write((state) => {
    const user = state.users?.[userId];
    if (user) {
      if (user.sessions) delete user.sessions[tokenHash];
      user.expoPushToken = null;
    }
    return { ok: true };
  });
}

export function authenticate(token) {
  if (!token) return Promise.resolve(null);
  const tokenHash = hashToken(token);
  return read((state) => {
    const now = Date.now();
    for (const user of Object.values(state.users ?? {})) {
      if (user.sessions?.[tokenHash] > now) return user.id;
    }
    throw new HttpError(401, 'Sesja użytkownika wygasła');
  });
}

function localDateTime(timezone, date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return { date: `${values.year}-${values.month}-${values.day}`, time: `${values.hour}:${values.minute}` };
}

export async function sendDueReminders(now = new Date()) {
  const due = await read((state) =>
    Object.values(state.users ?? {})
      .filter((user) => user.notificationTime && user.expoPushToken)
      .map((user) => ({ id: user.id, token: user.expoPushToken, time: user.notificationTime, timezone: user.timezone }))
      .filter((user) => {
        const local = localDateTime(user.timezone, now);
        const stored = state.users[user.id];
        const [targetHour, targetMinute] = user.time.split(':').map(Number);
        const [currentHour, currentMinute] = local.time.split(':').map(Number);
        const minutesLate = currentHour * 60 + currentMinute - (targetHour * 60 + targetMinute);
        return minutesLate >= 0 && minutesLate <= 1 && stored.lastNotificationDate !== local.date;
      })
      .map((user) => ({ ...user, date: localDateTime(user.timezone, now).date })),
  );
  const sent = [];
  for (const reminder of due) {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        to: reminder.token,
        sound: 'default',
        title: 'Pomysł na dzisiejszy obiad',
        body: 'Sprawdź przepisy dopasowane do produktów w Twojej lodówce.',
      }),
    });
    if (!response.ok) throw new Error(`Expo Push API zwróciło HTTP ${response.status}`);
    const result = await response.json();
    if (result.data?.status === 'error') {
      throw new Error(`Expo Push API: ${result.data.message ?? 'nie udało się wysłać powiadomienia'}`);
    }
    await write((state) => {
      const user = state.users?.[reminder.id];
      if (user) user.lastNotificationDate = reminder.date;
    });
    sent.push(reminder.id);
  }
  return sent;
}
