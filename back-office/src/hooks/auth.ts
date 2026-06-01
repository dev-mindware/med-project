import { UserRole } from "@/types";
import { useEffect } from "react";
import { authService } from "@/services/auth-service";
import { useAuthStore } from "@/stores/auth-store";

export interface User {
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  profilePhotoUrl?: string | null;
  lastPasswordChangeAt?: string | null;
}

export function useAuth() {
  const { 
    user, 
    setUser, 
    isLoading, 
    setIsLoading, 
    isFetchingProfile, 
    setIsFetchingProfile,
    logout 
  } = useAuthStore();

  useEffect(() => {
    // Se já houver utilizador ou uma pesquisa em curso, não faz nada.
    if (user || isFetchingProfile) {
      if (user && isLoading) setIsLoading(false);
      return;
    }

    // Tentar recuperar do localStorage primeiro para UX imediata
    const saved = typeof window !== "undefined" ? localStorage.getItem("medproject.user") : null;
    if (saved && !user) {
      setUser(JSON.parse(saved));
    }

    setIsFetchingProfile(true);
    let mounted = true;
    
    authService.getProfile()
      .then((profile) => {
        if (mounted) {
          setUser(profile);
          if (typeof window !== "undefined") {
            localStorage.setItem("medproject.user", JSON.stringify(profile));
          }
        }
      })
      .catch(() => {
        if (mounted) {
          if (typeof window !== "undefined") {
            localStorage.removeItem("medproject.user");
          }
          setUser(null);
          setIsLoading(false);
          setIsFetchingProfile(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [setUser, setIsLoading, setIsFetchingProfile, user, isFetchingProfile, isLoading]);

  return { 
    user, 
    isLoading,
    isAuthenticated: !!user,
    logout
  };
}
