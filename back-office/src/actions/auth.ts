"use server";

import { LoginFormData } from "@/schemas/auth";
import { createSession, destroySession } from "@/lib/session";
import { getAccessToken, getRefreshToken } from "./token";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function loginAction(data: LoginFormData) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { success: false, message: errorData.message || "Email ou palavra-passe inválidos." };
    }

    const responseData = await response.json();
    const { access_token, refresh_token, user } = responseData;

    await createSession({
      userId: user.id,
      accessToken: access_token,
      refreshToken: refresh_token,
      role: user.role,
    });

    return { success: true, user };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: "Erro de conexão com o servidor." };
  }
}

export async function logoutAction() {
  try {
    const token = await getAccessToken();
    if (token) {
      // Call backend logout
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).catch(() => {});
    }
  } finally {
    // Always clear local session
    await destroySession();
    revalidatePath("/", "layout");
    redirect("/auth/login");
  }
}
