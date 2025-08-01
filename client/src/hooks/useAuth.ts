import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  // In development, try dev user first, then fall back to regular auth
  const isDev = import.meta.env.DEV;
  
  const { data: devUser, isLoading: devLoading } = useQuery({
    queryKey: ["/api/auth/dev-user"],
    retry: false,
    enabled: isDev,
  });

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: !isDev || !devUser,
  });

  // For demo mode when auth fails
  const { data: demoUser, isLoading: demoLoading } = useQuery({
    queryKey: ["/api/auth/demo-user"],
    retry: false,
    enabled: !isDev && !user && !userLoading,
  });

  const finalUser = isDev && devUser ? devUser : user || demoUser;
  const finalLoading = isDev ? devLoading : (userLoading || demoLoading);

  return {
    user: finalUser,
    isLoading: finalLoading,
    isAuthenticated: !!finalUser,
  };
}