"use server";

import { redirect } from "next/navigation";

import { z } from "zod";

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
  redirect("/");
}
export async function logOut() {
  redirect("/");
}
