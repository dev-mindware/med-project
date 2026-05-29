import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth-service";
import { useAuthStore } from "@/stores/auth-store";
import { User } from "./auth";

function persistUser(user: User) {
  if (typeof window !== "undefined") {
    localStorage.setItem("medproject.user", JSON.stringify(user));
  }
}

export function useUpdateProfile() {
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (user) => {
      setUser(user);
      persistUser(user);
    },
  });
}

export function useUpdateEmail() {
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: authService.updateEmail,
    onSuccess: (user) => {
      setUser(user);
      persistUser(user);
    },
  });
}

export function useUpdatePassword() {
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: authService.updatePassword,
    onSuccess: (user) => {
      setUser(user);
      persistUser(user);
    },
  });
}
