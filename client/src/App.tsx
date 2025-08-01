import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BottomNavigation } from "@/components/bottom-navigation";
import { Home } from "@/pages/home";
import { AddOpenHouse } from "@/pages/add-open-house";
import { OpenHouseDetail } from "@/pages/open-house-detail";
import { Analytics } from "@/pages/analytics";
import { Settings } from "@/pages/settings";
import Landing from "@/pages/landing";
import { useAuth } from "@/hooks/useAuth";
import type { OpenHouse } from "@shared/schema";

type Route = {
  path: string;
  params?: any;
};

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<Route>({ path: "home" });
  const [activeTab, setActiveTab] = useState("home");

  // Show landing page for unauthenticated users
  if (isLoading || !isAuthenticated) {
    return <Landing />;
  }

  const navigate = (path: string, params?: any) => {
    setCurrentRoute({ path, params });
    
    // Update active tab for bottom navigation
    if (path === "home") {
      setActiveTab("home");
    } else if (path === "add" || path === "edit") {
      setActiveTab("add");
    } else if (path === "analytics") {
      setActiveTab("analytics");
    } else if (path === "settings") {
      setActiveTab("settings");
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
    } else if (tab === "analytics") {
      navigate("analytics");
    } else if (tab === "settings") {
      navigate("settings");
    }
  };

  const renderCurrentView = () => {
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
      
      case "analytics":
        return <Analytics onNavigate={navigate} />;
      
      case "settings":
        return <Settings onNavigate={navigate} />;
      
      default:
        return <Home onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderCurrentView()}
      
      {/* Only show bottom navigation on main views */}
      {(currentRoute.path === "home" || currentRoute.path === "add" || currentRoute.path === "analytics" || currentRoute.path === "settings") && (
        <BottomNavigation 
          activeTab={activeTab} 
          onTabChange={handleTabChange} 
        />
      )}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
