"use server";

import { redirect } from "next/navigation";

import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/drizzle/db";
import { UserTable } from "@/drizzle/schema";

import { generateSalt, hashPassword } from "./core/password-hasher";
import { signInSchema, signUpSchema } from "./schema";

export async function signIn(unsafeData: z.infer<typeof signInSchema>) {
  const { success, data } = signInSchema.safeParse(unsafeData);
  if (!success) {
    console.log(data);

    return "Unable to log you in";
  }
  redirect("/");
}

export async function signUp(unsafeData: z.infer<typeof signUpSchema>) {
  const { success, data } = signUpSchema.safeParse(unsafeData);
  if (!success) {
    console.log(data);
    return "Unable to create account";
  }

  const existingUser = await db.query.UserTable.findFirst({
    where: eq(UserTable.email, data.email),
  });

  if (existingUser != null) return "Account already existed for this email";
  const salt = generateSalt();
  const hashedPassword = await hashPassword(data.password, salt);
  try {
    const [user] = await db
      .insert(UserTable)
      .values({
        name: data.name,
        email: data.email,
        password: hashedPassword,
        salt,
      })
      .returning({ id: UserTable.id, role: UserTable.role });
    if (user == null) return "Unable to create account";
  } catch {
    return "Unable to create account";
  }

  redirect("/");
}
export async function logOut() {
  redirect("/");
}
