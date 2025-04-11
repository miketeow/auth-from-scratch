import { type NextRequest, NextResponse } from "next/server";

import {
  getUserFromSession,
  updateUserSessionExpiration,
} from "./auth/core/session";

const privateRoute = ["/private"];
const adminRoute = ["/admin"];

export async function middleware(request: NextRequest) {
  // Default response
  const response = NextResponse.next();
  // Flag to avoid double checking session
  let sessionChecked = false;
  let user = null;

  // By setting it this way, we make sure every request is only checked once, because
  // there might be overlapping route in the future, where it belongs to both private and admin route
  const pathname = request.nextUrl.pathname;
  const isPrivateRoute = privateRoute.some((route) =>
    pathname.startsWith(route)
  );
  const isAdminRoute = adminRoute.some((route) => pathname.startsWith(route));

  if (isPrivateRoute || isAdminRoute) {
    try {
      user = await getUserFromSession(request.cookies);
      sessionChecked = true;
    } catch (error) {
      console.log("Middleware: Error fetching user session", error);
      return NextResponse.redirect(
        new URL("/sign-in?error=session_error", request.url)
      );
    }
    if (user == null) {
      const redirectUrl = new URL("/sign-in", request.url);
      return NextResponse.redirect(redirectUrl);
    }

    if (isAdminRoute && user.role !== "admin") {
      // User logged in, but role is not admin
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  //Extend the expiration everytime user interact with the site
  //Instead of logging people off right after seven days since the first login
  if (sessionChecked && user !== null) {
    try {
      await updateUserSessionExpiration({
        set: (key, value, options) => {
          response.cookies.set({ ...options, name: key, value });
        },
        get: (key) => request.cookies.get(key),
      });
    } catch (error) {
      console.log("Middleware: Error updating session expiration", error);
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Skip Next js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
