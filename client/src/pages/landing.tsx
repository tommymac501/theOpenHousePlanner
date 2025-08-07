import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Calendar, Heart, Star, TrendingUp, Users } from "lucide-react";
import logoImage from "@assets/TOHP_1754579048093.png";

interface LandingProps {
  onNavigate: (path: string) => void;
}

export function Landing({ onNavigate }: LandingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="w-full bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <img 
                src={logoImage} 
                alt="The Open House Planner" 
                className="h-26 w-auto"
                style={{ imageRendering: 'crisp-edges' }}
              />
            </div>
            <div className="space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => onNavigate("login")}
                className="text-gray-600 hover:text-gray-900"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => onNavigate("register")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Plan Your Perfect
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}Open House{" "}
            </span>
            Journey
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover, organize, and track real estate open houses with our intelligent planning platform. 
            Turn property hunting into a streamlined, data-driven experience.
          </p>
          <div className="space-x-4">
            <Button 
              size="lg"
              onClick={() => onNavigate("register")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg"
            >
              Start Planning Free
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => onNavigate("login")}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 text-lg"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything You Need to Find Your Dream Home
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our platform combines powerful property data with intuitive planning tools to make house hunting effortless.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Smart Property Discovery</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Paste property listings from any website and our AI automatically extracts all the important details including images, prices, and addresses.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Organized Planning</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Keep track of open house dates, times, and your personal notes. Never miss an important viewing again with our scheduling system.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-xl">Personal Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Mark properties as favorites, track which ones you've visited, and organize your search with custom tags and notes.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle className="text-xl">Market Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Get automatic price estimates, monthly payment calculations, and market data to make informed decisions about your next home.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Star className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl">Mobile Optimized</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Use our mobile-first design to research properties on the go, navigate to open houses, and update your preferences anywhere.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <CardTitle className="text-xl">Easy Sharing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Share your favorite properties with family, real estate agents, or friends. Collaborate on your house hunting journey.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your House Hunting?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of home buyers who use our platform to find their perfect property faster and smarter.
          </p>
          <Button 
            size="lg"
            onClick={() => onNavigate("register")}
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
          >
            Start Your Free Account
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Open House Planner</span>
            </div>
            <p className="text-gray-400">
              © 2025 Open House Planner. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}