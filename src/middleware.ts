import { type NextRequest, NextResponse } from "next/server";

import {
  getUserFromSession,
  updateUserSessionExpiration,
} from "./auth/core/session";

const privateRoute = ["/private"];
const adminRoute = ["/admin"];

export async function middleware(request: NextRequest) {
  const response = (await middlewareAuth(request)) ?? NextResponse.next();

  //Extend the expiration everytime user interact with the site
  //Instead of logging people off right after seven days since the first login
  await updateUserSessionExpiration({
    set: (key, value, options) => {
      response.cookies.set({ ...options, name: key, value });
    },
    get: (key) => request.cookies.get(key),
  });

  return response;
}

async function middlewareAuth(request: NextRequest) {
  if (privateRoute.includes(request.nextUrl.pathname)) {
    const user = await getUserFromSession(request.cookies);
    if (user == null) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  if (adminRoute.includes(request.nextUrl.pathname)) {
    const user = await getUserFromSession(request.cookies);
    if (user == null) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
    if (user.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }
}

export const config = {
  runtime: "nodejs",
  matcher: [
    // Skip Next js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
