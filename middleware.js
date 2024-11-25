// import { NextResponse } from "next/server";

import { auth } from "./app/_lib/auth";

// //middleware in next js is a function that takes a request object and returns a response object
// export function middleware(request) {
//   console.log(request);

//   // What this does, redirects every matches
//   return NextResponse.redirect(new URL("/about", request.nextUrl));
// }

//Middlware provided by next-auth
export const middleware = auth;

//Protect the account page
export const config = {
  matcher: ["/account"],
};
