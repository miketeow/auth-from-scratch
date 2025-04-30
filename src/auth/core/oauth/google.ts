import { z } from "zod";

import { env } from "@/data/server";

import { OAuthClient } from "./base";

const googleUserInfoSchema = z.object({
  sub: z.string(),
  name: z.string(),
  email: z.string().email(),
});

export function createGoogleOAuthClient() {
  return new OAuthClient({
    provider: "google",
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    scopes: [
      "openid",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
    urls: {
      auth: "https://accounts.google.com/o/oauth2/v2/auth",
      token: "https://oauth2.googleapis.com/token",
      user: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    userInfo: {
      schema: googleUserInfoSchema,
      parser: async (googleUserData) => ({
        id: googleUserData.sub,
        name: googleUserData.name,
        email: googleUserData.email,
      }),
    },
  });
}
