import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, MapPin, Calendar, Heart, TrendingUp, Shield, Upload, Camera, BarChart3, Navigation, Clock, Star } from "lucide-react";

export default function Landing() {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  
  const handleLogin = async () => {
    if (import.meta.env.PROD) {
      // In production, try Replit auth first
      try {
        window.location.href = "/api/login";
        return;
      } catch (error) {
        console.error("Replit auth failed, trying demo mode:", error);
      }
    }
    
    // Try demo login for development or as fallback
    try {
      console.log("Attempting demo login...");
      const response = await fetch("/api/auth/demo-user", {
        method: 'GET',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Demo login response:", data);
        
        // Small delay to ensure session is saved
        setTimeout(() => {
          console.log("Redirecting to home page...");
          window.location.href = "/";
        }, 500);
        return;
      } else {
        console.error("Demo login failed with status:", response.status);
      }
    } catch (error) {
      console.error("Demo login error:", error);
    }
    
    // Last resort - reload the page
    console.log("Falling back to page reload");
    window.location.reload();
  };

  const handleDevLogin = async () => {
    if (import.meta.env.DEV) {
      try {
        const response = await fetch("/api/auth/admin-login");
        if (response.ok) {
          window.location.reload();
        }
      } catch (error) {
        console.error("Dev login failed:", error);
      }
    }
  };

  const featurePreviews = {
    organization: {
      title: "Smart Organization in Action",
      items: [
        { icon: Upload, text: "Upload property photos", color: "text-blue-500" },
        { icon: Camera, text: "Parse listing details with AI", color: "text-green-500" },
        { icon: MapPin, text: "Auto-organize by location", color: "text-purple-500" },
      ]
    },
    planning: {
      title: "Visit Planning Features",
      items: [
        { icon: Calendar, text: "Schedule open house visits", color: "text-orange-500" },
        { icon: Navigation, text: "Get Waze directions", color: "text-blue-500" },
        { icon: Clock, text: "Track visit history", color: "text-green-500" },
      ]
    },
    analytics: {
      title: "Analytics Dashboard",
      items: [
        { icon: BarChart3, text: "View search statistics", color: "text-indigo-500" },
        { icon: TrendingUp, text: "Track weekly progress", color: "text-emerald-500" },
        { icon: Star, text: "Analyze preferences", color: "text-yellow-500" },
      ]
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      {/* Header */}
      <header className="px-6 py-8">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center">
              <Home className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 font-['Outfit']">
              Open House Planner
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            {import.meta.env.DEV && (
              <Button 
                onClick={handleDevLogin}
                variant="outline"
                className="px-4 py-2"
              >
                Dev Login
              </Button>
            )}
            <Button 
              onClick={handleLogin}
              className="luxury-button px-6 py-2"
            >
              {import.meta.env.PROD ? "Try Demo" : "Sign In"}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6 font-['Outfit']">
            Never Miss Your 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600"> Dream Home</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Track, organize, and plan your open house visits with smart scheduling, 
            property insights, and seamless navigation integration.
          </p>
          <div className="flex flex-col items-center space-y-3">
            <Button 
              onClick={handleLogin}
              className="luxury-button px-8 py-4 text-lg"
            >
              {import.meta.env.PROD ? "Try Demo Now" : "Get Started Free"}
            </Button>
            {import.meta.env.DEV && (
              <Button 
                onClick={handleDevLogin}
                variant="outline"
                className="px-6 py-2 text-sm"
              >
                Development Login
              </Button>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card 
            className="floating-card cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105"
            onClick={() => setActiveFeature(activeFeature === 'organization' ? null : 'organization')}
          >
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-800">Smart Organization</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600 leading-relaxed mb-4">
                Automatically organize properties by date, location, and preferences. 
                Upload images and parse listing details with AI assistance.
              </CardDescription>
              {activeFeature === 'organization' && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 animate-in slide-in-from-top-2 duration-300">
                  <h4 className="font-semibold text-blue-800 mb-3">{featurePreviews.organization.title}</h4>
                  <div className="space-y-2">
                    {featurePreviews.organization.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <item.icon className={`h-4 w-4 ${item.color}`} />
                        <span className="text-sm text-gray-700">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card 
            className="floating-card cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105"
            onClick={() => setActiveFeature(activeFeature === 'planning' ? null : 'planning')}
          >
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-800">Visit Planning</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600 leading-relaxed mb-4">
                Track which properties you've visited, mark favorites, and get 
                direct navigation to open houses through Waze integration.
              </CardDescription>
              {activeFeature === 'planning' && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-200 animate-in slide-in-from-top-2 duration-300">
                  <h4 className="font-semibold text-green-800 mb-3">{featurePreviews.planning.title}</h4>
                  <div className="space-y-2">
                    {featurePreviews.planning.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <item.icon className={`h-4 w-4 ${item.color}`} />
                        <span className="text-sm text-gray-700">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card 
            className="floating-card cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105"
            onClick={() => setActiveFeature(activeFeature === 'analytics' ? null : 'analytics')}
          >
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-800">Analytics Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600 leading-relaxed mb-4">
                Get insights on your home search progress with statistics on 
                visits, preferences, and upcoming open houses this week.
              </CardDescription>
              {activeFeature === 'analytics' && (
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200 animate-in slide-in-from-top-2 duration-300">
                  <h4 className="font-semibold text-purple-800 mb-3">{featurePreviews.analytics.title}</h4>
                  <div className="space-y-2">
                    {featurePreviews.analytics.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <item.icon className={`h-4 w-4 ${item.color}`} />
                        <span className="text-sm text-gray-700">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Key Benefits */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-8 font-['Outfit']">
            Why Choose Open House Planner?
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mt-1">
                <Heart className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Save Time & Stay Organized</h4>
                <p className="text-gray-600">
                  No more scattered notes or missed appointments. Keep all your property information 
                  in one organized, searchable place.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mt-1">
                <MapPin className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Smart Navigation</h4>
                <p className="text-gray-600">
                  Get directions to any property instantly with integrated Waze navigation. 
                  Never get lost on your way to an open house.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mt-1">
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Track Your Progress</h4>
                <p className="text-gray-600">
                  See at a glance which properties you've visited, which ones you loved, 
                  and plan your upcoming visits efficiently.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mt-1">
                <Shield className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Secure & Private</h4>
                <p className="text-gray-600">
                  Your property searches and preferences are kept private and secure. 
                  Focus on finding your dream home with peace of mind.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="floating-card max-w-md mx-auto p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 font-['Outfit']">
              Ready to Find Your Dream Home?
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Join thousands of home buyers who've streamlined their house hunting with our platform.
            </p>
            <div className="space-y-3 w-full">
              <Button 
                onClick={handleLogin}
                className="luxury-button px-8 py-3 text-lg w-full"
              >
                {import.meta.env.PROD ? "Try Demo" : "Start Planning Today"}
              </Button>
              {import.meta.env.DEV && (
                <Button 
                  onClick={handleDevLogin}
                  variant="outline"
                  className="px-6 py-2 text-sm w-full"
                >
                  Quick Dev Access
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-8 mt-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-gray-600">
            © 2024 Open House Planner. Built with ❤️ for home buyers.
          </p>
        </div>
      </footer>
    </div>
  );
}