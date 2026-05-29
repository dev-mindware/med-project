import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSession, destroySession } from "@/lib/session";
import { REFRESH_TOKEN_KEY } from "@/constants";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function POST(req: NextRequest) {
  try {
    const authCookies = await cookies();
    const refreshToken = authCookies.get(REFRESH_TOKEN_KEY)?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { message: "Refresh token não encontrado na sessão" },
        { status: 401 }
      );
    }

    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      // Refresh token is invalid or expired — force logout
      await destroySession();
      return NextResponse.json(
        { message: "Refresh token inválido ou expirado" },
        { status: 401 }
      );
    }

    const data = await response.json();

    // API returns snake_case: access_token, refresh_token
    const newAccessToken = data.access_token;
    const newRefreshToken = data.refresh_token || refreshToken;
    const user = data.user;

    if (!newAccessToken) {
      return NextResponse.json(
        { message: "Access token não retornado pela API" },
        { status: 500 }
      );
    }

    // Persist updated tokens in httpOnly cookies
    await createSession({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });

    // Return the new access token and user data to the client
    return NextResponse.json({
      accessToken: newAccessToken,
      user: user ?? null,
    });
  } catch (error: any) {
    console.error("[/api/auth/refresh] Critical error:", error);
    await destroySession();
    return NextResponse.json(
      { message: "Erro interno ao renovar sessão" },
      { status: 500 }
    );
  }
}
