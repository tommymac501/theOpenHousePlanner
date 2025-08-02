import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Switch, Route } from "wouter";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { Home } from "@/pages/home";
import { AddOpenHouse } from "@/pages/add-open-house";
import { OpenHouseDetail } from "@/pages/open-house-detail";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import type { OpenHouse } from "@shared/schema";

// Router component with authentication
function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={() => <Home />} />
      <ProtectedRoute path="/add" component={() => <AddOpenHouse />} />
      <ProtectedRoute path="/edit/:id" component={({ params }: any) => <OpenHouseDetail openHouseId={parseInt(params.id)} />} />
      <ProtectedRoute path="/detail/:id" component={({ params }: any) => <OpenHouseDetail openHouseId={parseInt(params.id)} />} />
      <Route path="/auth" component={() => <AuthPage />} />
      <Route component={() => <NotFound />} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <Router />
          </div>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
