import { useQuery } from "@tanstack/react-query";
import { statsService } from "@/services/stats-service";
import { useAuth } from "./auth";

export function useDashboardStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["dashboard-stats", user?.id, user?.role],
    queryFn: () => statsService.getMeStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useMeStats() {
  return useQuery({
    queryKey: ["me-stats"],
    queryFn: () => statsService.getMeStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
