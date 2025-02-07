// lib/session.js
import { withIronSession } from "next-iron-session";

export function withSession(handler) {
  return withIronSession(handler, {
    password: process.env.SESSION_PASSWORD,
    cookieName: "myapp_session",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
    },
  });
}
