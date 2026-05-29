import { UserRole } from "@/types";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, ROLE_KEY } from "@/constants";

export interface SessionPayload {
  accessToken: string;
  refreshToken: string;
  userId?: string;
  role?: UserRole;
}

export async function createSession(payload: SessionPayload) {
  const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const accessExpiresAt = refreshExpiresAt; // Match refresh expiration for long-lived session cookie

  const authCookies = await cookies();

  authCookies.set(ACCESS_TOKEN_KEY, payload.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: accessExpiresAt,
    sameSite: "strict",
    path: "/",
  });

  authCookies.set(REFRESH_TOKEN_KEY, payload.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: refreshExpiresAt,
    sameSite: "strict",
    path: "/",
  });
}

export async function destroySession() {
  const authCookies = await cookies();

  authCookies.delete(ACCESS_TOKEN_KEY);
  authCookies.delete(REFRESH_TOKEN_KEY);
}
