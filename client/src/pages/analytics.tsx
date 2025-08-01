import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, MapPin, DollarSign, Clock, Home, Heart, ThumbsDown, BarChart3, PieChart, Activity } from "lucide-react";
import type { OpenHouse } from "@shared/schema";

interface AnalyticsProps {
  onNavigate: (path: string, params?: any) => void;
}

export function Analytics({ onNavigate }: AnalyticsProps) {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "all">("month");

  const { data: openHouses = [], isLoading: housesLoading } = useQuery<OpenHouse[]>({
    queryKey: ["/api/open-houses"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
  });

  if (housesLoading || statsLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Calculate analytics data
  const totalProperties = openHouses.length;
  const visitedProperties = openHouses.filter(h => h.visited).length;
  const likedProperties = openHouses.filter(h => h.favorited).length;
  const dislikedProperties = openHouses.filter(h => h.disliked).length;
  const visitRate = totalProperties > 0 ? (visitedProperties / totalProperties) * 100 : 0;
  const likeRate = visitedProperties > 0 ? (likedProperties / visitedProperties) * 100 : 0;

  // Price analysis
  const propertiesWithPrices = openHouses.filter(h => h.price && h.price !== "");
  const prices = propertiesWithPrices.map(h => {
    const priceStr = h.price.replace(/[^0-9]/g, "");
    return parseInt(priceStr) || 0;
  }).filter(p => p > 0);

  const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  // Monthly payment analysis
  const propertiesWithPayments = openHouses.filter(h => h.monthlyPayment && h.monthlyPayment !== "");
  const payments = propertiesWithPayments.map(h => {
    const paymentStr = h.monthlyPayment!.replace(/[^0-9]/g, "");
    return parseInt(paymentStr) || 0;
  }).filter(p => p > 0);

  const avgPayment = payments.length > 0 ? payments.reduce((a, b) => a + b, 0) / payments.length : 0;

  // Time analysis
  const now = new Date();
  const thisWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const thisWeekProperties = openHouses.filter(h => {
    const houseDate = new Date(h.date);
    return houseDate >= thisWeekStart;
  }).length;

  const thisMonthProperties = openHouses.filter(h => {
    const houseDate = new Date(h.date);
    return houseDate >= thisMonthStart;
  }).length;

  // Visit trends
  const recentVisits = openHouses.filter(h => h.visited).slice(-5);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("home")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
              <p className="text-sm text-gray-600">Your property search insights</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={timeRange === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange("week")}
            >
              Week
            </Button>
            <Button
              variant={timeRange === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange("month")}
            >
              Month
            </Button>
            <Button
              variant={timeRange === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange("all")}
            >
              All Time
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProperties}</div>
              <p className="text-xs text-muted-foreground">
                {thisMonthProperties} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Visit Rate</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{visitRate.toFixed(1)}%</div>
              <Progress value={visitRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{likeRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {likedProperties} liked of {visitedProperties} visited
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Price</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {avgPrice > 0 ? `$${(avgPrice / 1000).toFixed(0)}k` : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">
                {avgPayment > 0 ? `~$${avgPayment.toFixed(0)}/mo` : ""}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Price Range Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Price Analysis</span>
              </CardTitle>
              <CardDescription>
                Price range and trends of properties you're considering
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {prices.length > 0 ? (
                <>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Lowest Price</span>
                      <Badge variant="outline">${(minPrice / 1000).toFixed(0)}k</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Average Price</span>
                      <Badge variant="secondary">${(avgPrice / 1000).toFixed(0)}k</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Highest Price</span>
                      <Badge variant="outline">${(maxPrice / 1000).toFixed(0)}k</Badge>
                    </div>
                  </div>
                  
                  {avgPayment > 0 && (
                    <div className="pt-3 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Avg. Monthly Payment</span>
                        <Badge className="bg-green-100 text-green-800">${avgPayment.toFixed(0)}/mo</Badge>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-500">No price data available</p>
              )}
            </CardContent>
          </Card>

          {/* Visit Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="h-5 w-5" />
                <span>Visit Preferences</span>
              </CardTitle>
              <CardDescription>
                Your preferences based on visited properties
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Heart className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Liked</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-100 text-green-800">{likedProperties}</Badge>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${visitedProperties > 0 ? (likedProperties / visitedProperties) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <ThumbsDown className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Disliked</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-red-100 text-red-800">{dislikedProperties}</Badge>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${visitedProperties > 0 ? (dislikedProperties / visitedProperties) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Not Visited</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{totalProperties - visitedProperties}</Badge>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gray-400 h-2 rounded-full" 
                        style={{ width: `${totalProperties > 0 ? ((totalProperties - visitedProperties) / totalProperties) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>
              Your latest property interactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentVisits.length > 0 ? (
              <div className="space-y-3">
                {recentVisits.map((house) => (
                  <div 
                    key={house.id} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => onNavigate("detail", { id: house.id })}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-sm">{house.address}</p>
                        <p className="text-xs text-gray-500">{house.date} at {house.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {house.favorited && <Heart className="h-4 w-4 text-red-500 fill-current" />}
                      {house.disliked && <ThumbsDown className="h-4 w-4 text-gray-500" />}
                      <Badge variant="outline" className="text-xs">{house.price}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No recent visits to display</p>
            )}
          </CardContent>
        </Card>

        {/* Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {visitRate > 75 && (
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">Great Visit Rate!</p>
                    <p className="text-sm text-green-600">You're actively visiting {visitRate.toFixed(1)}% of properties you track.</p>
                  </div>
                </div>
              )}
              
              {likeRate > 50 && visitedProperties > 2 && (
                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Heart className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800">You Know What You Like!</p>
                    <p className="text-sm text-blue-600">You're liking {likeRate.toFixed(1)}% of properties you visit.</p>
                  </div>
                </div>
              )}
              
              {thisWeekProperties > 3 && (
                <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-purple-800">Busy Week Ahead!</p>
                    <p className="text-sm text-purple-600">You have {thisWeekProperties} open houses scheduled this week.</p>
                  </div>
                </div>
              )}
              
              {totalProperties > 0 && visitedProperties === 0 && (
                <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-orange-800">Time to Start Visiting!</p>
                    <p className="text-sm text-orange-600">You have {totalProperties} properties tracked but haven't visited any yet.</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}