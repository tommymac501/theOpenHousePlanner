import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { SafeUser, LoginData, RegisterData } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<{ user: SafeUser }>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  return {
    user: user?.user,
    isLoading,
    isAuthenticated: !!user?.user,
    error: error?.message
  };
}

export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: LoginData) => {
      return apiRequest("POST", "/api/auth/login", data);
    },
    onSuccess: async () => {
      // Invalidate and refetch auth queries to update state
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      // Wait a moment for session to be set, then refetch
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ["/api/auth/me"] });
      }, 100);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: RegisterData) => {
      return apiRequest("POST", "/api/auth/register", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/auth/logout", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.clear(); // Clear all cached data
    },
  });
}