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

  // For production deployment without auth, create a default user
  const { data: defaultUser, isLoading: defaultLoading } = useQuery({
    queryKey: ["/api/auth/default-user"],
    retry: false,
    enabled: !isDev && !user,
  });

  const finalUser = isDev && devUser ? devUser : user || defaultUser;
  const finalLoading = isDev ? devLoading : (userLoading || defaultLoading);

  return {
    user: finalUser,
    isLoading: finalLoading,
    isAuthenticated: !!finalUser,
  };
}