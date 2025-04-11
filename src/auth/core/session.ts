import { z } from "zod";

import { userRoles } from "@/drizzle/schema";
import { redisClient } from "@/redis/redis";

//seven days in seconds
const SESSION_EXPIRATION_SECONDS = 60 * 60 * 24 * 7;
const COOKIE_SESSION_KEY = "session-id";
export type Cookies = {
  set: (
    key: string,
    value: string,
    options: {
      secure?: boolean;
      httpOnly?: boolean;
      sameSite?: "strict" | "lax";
      expires?: number;
    }
  ) => void;
  get: (key: string) => { name: string; value: string } | undefined;
  delete: (key: string) => void;
};

const sessionSchema = z.object({
  id: z.string(),
  role: z.enum(userRoles),
});

type UserSession = z.infer<typeof sessionSchema>;

export async function createUserSession(
  user: UserSession,
  cookies: Pick<Cookies, "set">
) {
  const randomBytes = new Uint8Array(32);
  globalThis.crypto.getRandomValues(randomBytes);
  const sessionId = Buffer.from(randomBytes).toString("hex");
  await redisClient.set(`session:${sessionId}`, sessionSchema.parse(user), {
    ex: SESSION_EXPIRATION_SECONDS,
  });

  setCookie(sessionId, cookies);
}

function setCookie(sessionId: string, cookies: Pick<Cookies, "set">) {
  cookies.set(COOKIE_SESSION_KEY, sessionId, {
    secure: true,
    httpOnly: true,
    sameSite: "lax",
    expires: Date.now() + SESSION_EXPIRATION_SECONDS * 1000,
  });
}

export async function getUserFromSession(cookies: Pick<Cookies, "get">) {
  const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value;
  if (sessionId == null) return null;

  return getUserSessionById(sessionId);
}

async function getUserSessionById(sessionId: string) {
  const rawUser = await redisClient.get(`session:${sessionId}`);

  const { success, data: user } = sessionSchema.safeParse(rawUser);

  return success ? user : null;
}

export async function removeUserFromSession(
  cookies: Pick<Cookies, "get" | "delete">
) {
  const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value;
  if (sessionId == null) return null;

  await redisClient.del(`session:${sessionId}`);
  cookies.delete(COOKIE_SESSION_KEY);
}

export async function updateUserSessionData(
  user: UserSession,
  cookies: Pick<Cookies, "get">
) {
  // Get session
  const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value;
  if (sessionId == null) return null;

  // Reset expiration date, update the new user data
  await redisClient.set(`session:${sessionId}`, sessionSchema.parse(user), {
    ex: SESSION_EXPIRATION_SECONDS,
  });
}

export async function updateUserSessionExpiration(
  cookies: Pick<Cookies, "get" | "set">
) {
  // Get session from cookies
  const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value;
  if (sessionId == null) return null;

  // Get user info by session
  const user = await getUserSessionById(sessionId);
  if (user == null) return;

  // Reset the expiration date in redis
  await redisClient.set(`session:${sessionId}`, user, {
    ex: SESSION_EXPIRATION_SECONDS,
  });

  // pass the session into cookie
  setCookie(sessionId, cookies);
}
