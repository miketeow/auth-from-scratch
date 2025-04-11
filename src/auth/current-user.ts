import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { eq } from "drizzle-orm";

import { db } from "@/drizzle/db";
import { UserTable } from "@/drizzle/schema";

import { getUserFromSession } from "./core/session";

// Type definition
// Define FullUser type based on the return type of getUserFromDb, excluding null and undefined
type FullUser = Exclude<
  Awaited<ReturnType<typeof getUserFromDb>>,
  undefined | null
>;

// Define User type based on the return type of getUserFromDb, excluding null and undefined
// Use in data store in session
type User = Exclude<
  Awaited<ReturnType<typeof getUserFromSession>>,
  undefined | null
>;

// Function overloads
// Define the function's possible call signature and corresponding return type
// based on the options provided

// Get full user details, redirect if not logged in
function _getCurrentUser(options: {
  withFullUser: true;
  redirectIfNotFound: true;
}): Promise<FullUser>;

// Get full user details, return null if not logged in
function _getCurrentUser(options: {
  withFullUser: true;
  redirectIfNotFound?: false;
}): Promise<FullUser | null>;

// Get basic session user data, redirect if not logged in
function _getCurrentUser(options: {
  withFullUser?: false;
  redirectIfNotFound: true;
}): Promise<User>;

// Get basic session user, return null if not logged in (default)
function _getCurrentUser(options: {
  withFullUser?: false;
  redirectIfNotFound?: false;
}): Promise<User | null>;

// This function implements the logic for all the overload signatures
async function _getCurrentUser({
  withFullUser = false,
  redirectIfNotFound = false,
} = {}) {
  // Get basic user info from session cookies
  const user = await getUserFromSession(await cookies());

  // If no user found in session, redirect back to sign in page
  if (user == null) {
    if (redirectIfNotFound) return redirect("/sign-in");
    return null;
  }

  // Handle case where full user detail is requested
  if (withFullUser) {
    const fullUser = await getUserFromDb(user.id);
    // Handle potential data inconsistency, (session existed, but user delete from DB)
    if (fullUser == null) throw new Error("User not found in database");
    return fullUser;
  }

  return user;
}

// Memoizes the result, if getCurrenUser called multiple time in different components
// The underlying logic will only run once, essential for performance
export const getCurrentUser = cache(_getCurrentUser);

async function getUserFromDb(id: string) {
  return await db.query.UserTable.findFirst({
    columns: { id: true, email: true, role: true, name: true },
    where: eq(UserTable.id, id),
  });
}
