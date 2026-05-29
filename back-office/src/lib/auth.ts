"use server";
import { cookies } from "next/headers";
import { SessionPayload } from "./session";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, ROLE_KEY } from "@/constants";
import { UserRole } from "@/types";

export async function getSession(): Promise<SessionPayload | null> {
  const authCookies = await cookies();
  const accessToken = authCookies.get(ACCESS_TOKEN_KEY)?.value;
  const refreshToken = authCookies.get(REFRESH_TOKEN_KEY)?.value;

  if (!refreshToken) return null;

  let userId = "";
  let role: UserRole = "OPERATOR"; // Default role

  try {
    // Attempt to decode userId and role from tokens
    const tokenToDecode = accessToken || refreshToken;
    if (tokenToDecode) {
      const payloadBase64 = tokenToDecode.split(".")[1];
      if (payloadBase64) {
        const decodedPayload = JSON.parse(
          Buffer.from(payloadBase64, "base64").toString()
        );
        userId = decodedPayload.sub || decodedPayload.id || "";
        role = decodedPayload.role || "OPERATOR";
      }
    }
  } catch (e) {
    console.error("Error decoding session tokens:", e);
  }

  return {
    userId,
    accessToken: accessToken ?? "",
    refreshToken,
    role,
  };
}
