import { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { Landing } from "@/pages/landing";
import { Login } from "@/pages/login";
import { Register } from "@/pages/register";
import { BottomNavigation } from "@/components/bottom-navigation";
import { Home } from "@/pages/home";
import { AddOpenHouse } from "@/pages/add-open-house";
import { OpenHouseDetail } from "@/pages/open-house-detail";
import type { OpenHouse } from "@shared/schema";

type Route = {
  path: string;
  params?: any;
};

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<Route>({ path: "landing" });
  const [activeTab, setActiveTab] = useState("home");

  // Handle authentication state changes
  useEffect(() => {
    console.log("Auth state changed:", { isAuthenticated, isLoading, currentPath: currentRoute.path });
    if (!isLoading) {
      if (isAuthenticated && (currentRoute.path === "landing" || currentRoute.path === "login" || currentRoute.path === "register")) {
        console.log("Redirecting to home after successful authentication");
        setCurrentRoute({ path: "home" });
        setActiveTab("home");
      } else if (!isAuthenticated && !["landing", "login", "register"].includes(currentRoute.path)) {
        console.log("Redirecting to landing after logout");
        setCurrentRoute({ path: "landing" });
      }
    }
  }, [isAuthenticated, isLoading, currentRoute.path]);

  const navigate = (path: string, params?: any) => {
    setCurrentRoute({ path, params });
    
    // Update active tab for bottom navigation
    if (path === "home") {
      setActiveTab("home");
    } else if (path === "add" || path === "edit") {
      setActiveTab("add");
    } else {
      // For detail view, keep the current tab active
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "home") {
      navigate("home");
    } else if (tab === "add") {
      navigate("add");
    } else if (tab === "settings") {
      // Settings page can be implemented later
      navigate("home");
    }
  };

  const renderCurrentView = () => {
    // Show loading spinner while checking authentication
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    // If not authenticated, show auth pages
    if (!isAuthenticated) {
      switch (currentRoute.path) {
        case "login":
          return <Login onNavigate={navigate} />;
        case "register":
          return <Register onNavigate={navigate} />;
        default:
          return <Landing onNavigate={navigate} />;
      }
    }

    // If authenticated, show app pages
    switch (currentRoute.path) {
      case "home":
        return <Home onNavigate={navigate} />;
      
      case "add":
        return <AddOpenHouse onNavigate={navigate} />;
      
      case "edit":
        return (
          <AddOpenHouse 
            onNavigate={navigate} 
            editingOpenHouse={currentRoute.params?.openHouse as OpenHouse}
          />
        );
      
      case "detail":
        return (
          <OpenHouseDetail 
            openHouseId={currentRoute.params?.id} 
            onNavigate={navigate}
          />
        );
      
      default:
        return <Home onNavigate={navigate} />;
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50">
        {renderCurrentView()}
        
        {/* Only show bottom navigation on authenticated main views */}
        {isAuthenticated && (currentRoute.path === "home" || currentRoute.path === "add") && (
          <BottomNavigation 
            activeTab={activeTab} 
            onTabChange={handleTabChange} 
          />
        )}
      </div>
      
      <Toaster />
    </TooltipProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
