import { z } from "zod";

import { env } from "@/data/server";

import { OAuthClient } from "./base";

const githubBaseUserSchema = z.object({
  id: z.number(),
  name: z.string().nullable(),
  login: z.string(),
  email: z.string().email().nullable(),
});

const githubEmailSchema = z.array(
  z.object({
    email: z.string().email(),
    primary: z.boolean(),
    verified: z.boolean(),
  })
);

export function createGithubOAuthClient() {
  return new OAuthClient({
    provider: "github",
    clientId: env.GITHUB_CLIENT_ID,
    clientSecret: env.GITHUB_CLIENT_SECRET,
    scopes: ["user:email", "read:user"],
    urls: {
      auth: "https://github.com/login/oauth/authorize",
      token: "https://github.com/login/oauth/access_token",
      user: "https://api.github.com/user",
    },
    userInfo: {
      schema: githubBaseUserSchema,
      parser: async (baseUserData, { accessToken, tokenType }) => {
        let finalEmail = baseUserData.email;

        if (finalEmail === null) {
          console.log("Github primary email null, fetching /user/emails...");
          const emailUrls = "https://api.github.com/user/emails";
          try {
            const emailResponse = await fetch(emailUrls, {
              headers: {
                Authorization: `${tokenType} ${accessToken}`,
                Accept: "application/vnd.github.v3+json",
              },
            });

            if (!emailResponse.ok) {
              throw new Error(
                `Github email API Error: ${emailResponse.status} ${emailResponse.statusText}`
              );
            }
            const emailData = await emailResponse.json();
            const parsedEmailResult = githubEmailSchema.safeParse(emailData);

            if (!parsedEmailResult.success) {
              console.log(
                "Failed to parsed Github email response: ",
                parsedEmailResult.error
              );
              throw new Error("Could not parse emails from Github");
            }

            const primaryEmail = parsedEmailResult.data.find(
              (e) => e.primary && e.verified
            );

            if (primaryEmail) {
              finalEmail = primaryEmail.email;
              console.log(
                "Found primary verified email via user/emails:",
                finalEmail
              );
            } else {
              console.warn(
                "Primary verified email not found in user/emails response"
              );
              throw new Error("Primary verified Github email not found");
            }

            if (finalEmail === null) {
              throw new Error(
                "Unable to determine a email for the Github user"
              );
            }
          } catch (error) {
            console.error(
              "Error fetching or processing Github emails: ",
              error
            );
          }
        }

        return {
          id: baseUserData.id.toString(),
          email: finalEmail as string,
          name: baseUserData.name ?? baseUserData.login,
        };
      },
    },
  });
}
