import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  // In production deployment without Replit auth, always return authenticated
  const isProductionDeployment = import.meta.env.VITE_PRODUCTION_DEPLOYMENT;
  
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: !isProductionDeployment, // Don't make auth request in production deployment
  });

  // For production deployment, return mock authenticated state
  if (isProductionDeployment) {
    return {
      user: {
        id: "demo-user",
        email: "demo@theOpenHousePlanner.com",
        firstName: "Demo",
        lastName: "User",
        profileImageUrl: null,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date()
      },
      isLoading: false,
      isAuthenticated: true,
    };
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}