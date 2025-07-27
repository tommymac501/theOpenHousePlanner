import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Edit, Check, Share, Trash2, Heart, Navigation, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatPrice, getMapUrl } from "@/lib/utils";
import type { OpenHouse } from "@shared/schema";

interface OpenHouseDetailProps {
  openHouseId: number;
  onNavigate: (path: string, params?: any) => void;
}

export function OpenHouseDetail({ openHouseId, onNavigate }: OpenHouseDetailProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: openHouse, isLoading } = useQuery<OpenHouse>({
    queryKey: ["/api/open-houses", openHouseId],
    queryFn: async () => {
      const response = await fetch(`/api/open-houses/${openHouseId}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch open house");
      }
      return response.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<OpenHouse>) => {
      await apiRequest("PATCH", `/api/open-houses/${openHouseId}`, updates);
    },
    onSuccess: () => {
      // Force immediate cache refresh
      queryClient.invalidateQueries({ queryKey: ["/api/open-houses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/open-houses", openHouseId] });
      queryClient.refetchQueries({ queryKey: ["/api/open-houses"] });
      queryClient.refetchQueries({ queryKey: ["/api/stats"] });
      queryClient.refetchQueries({ queryKey: ["/api/open-houses", openHouseId] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update open house",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/open-houses/${openHouseId}`);
    },
    onSuccess: () => {
      // Force immediate cache refresh
      queryClient.invalidateQueries({ queryKey: ["/api/open-houses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.refetchQueries({ queryKey: ["/api/open-houses"] });
      queryClient.refetchQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Open house deleted successfully" });
      onNavigate("home");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete open house",
        variant: "destructive",
      });
    },
  });

  const handleMarkAsVisited = () => {
    if (openHouse) {
      updateMutation.mutate({ visited: !openHouse.visited });
      toast({
        title: openHouse.visited ? "Marked as not visited" : "Marked as visited",
      });
    }
  };

  const handleToggleFavorite = () => {
    if (openHouse) {
      updateMutation.mutate({ 
        favorited: !openHouse.favorited,
        disliked: false, // Clear dislike when favoriting
        visited: true // Always mark as visited when favoriting
      });
      toast({
        title: openHouse.favorited ? "Removed from favorites" : "Added to favorites",
      });
    }
  };

  const handleToggleDislike = () => {
    if (openHouse) {
      updateMutation.mutate({ 
        disliked: !openHouse.disliked,
        favorited: false, // Clear favorite when disliking
        visited: true // Always mark as visited when disliking
      });
      toast({
        title: openHouse.disliked ? "Removed from dislikes" : "Added to dislikes",
      });
    }
  };

  const handleShare = async () => {
    if (!openHouse) return;
    
    const shareData = {
      title: "Open House",
      text: `${openHouse.address} - ${formatPrice(openHouse.price)}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(
          `${shareData.text}\nDate: ${openHouse.date} at ${openHouse.time}\n${shareData.url}`
        );
        toast({ title: "Copied to clipboard" });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to share",
          variant: "destructive",
        });
      }
    }
  };

  const handleOpenInWaze = () => {
    if (!openHouse?.address) return;
    
    // Encode the address for URL
    const encodedAddress = encodeURIComponent(openHouse.address);
    
    // Waze URL scheme - works on both mobile and desktop
    const wazeUrl = `https://waze.com/ul?q=${encodedAddress}&navigate=yes`;
    
    // Open Waze in a new tab/window
    window.open(wazeUrl, '_blank');
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this open house?")) {
      deleteMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading open house details...</p>
        </div>
      </div>
    );
  }

  if (!openHouse) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Open house not found</h3>
          <Button onClick={() => onNavigate("home")}>Go back</Button>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(openHouse.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with navigation */}
      <div className="relative bg-white border-b">
        <div className="flex items-center justify-between p-4">
          <Button
            onClick={() => onNavigate("home")}
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
            variant="ghost"
            size="sm"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </Button>

          <h1 className="text-lg font-semibold text-gray-800 flex-1 text-center mx-4">
            Property Details
          </h1>

          <div className="flex items-center space-x-2">
            <Button
              onClick={handleToggleDislike}
              disabled={updateMutation.isPending}
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                openHouse.disliked 
                  ? 'bg-gray-800 text-white hover:bg-gray-900' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              variant="ghost"
              size="sm"
            >
              <ThumbsDown className={`h-5 w-5 ${openHouse.disliked ? 'fill-current' : ''}`} />
            </Button>
            <Button
              onClick={handleToggleFavorite}
              disabled={updateMutation.isPending}
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                openHouse.favorited 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              variant="ghost"
              size="sm"
            >
              <Heart className={`h-5 w-5 ${openHouse.favorited ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6 pb-20">
        <Card className="shadow-material">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  {openHouse.address}
                </h1>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">
                  {formatPrice(openHouse.price)}
                </div>
                {openHouse.monthlyPayment && (
                  <div className="text-base text-gray-700 mt-1 font-medium">
                    Est. ${formatPrice(openHouse.monthlyPayment)}/mo
                  </div>
                )}
                {openHouse.zestimate && (
                  <div className="text-sm text-gray-600 mt-1">
                    Zestimate: {openHouse.zestimate === "Not available" ? openHouse.zestimate : formatPrice(openHouse.zestimate)}
                  </div>
                )}
              </div>
            </div>

            {(openHouse.imageData || openHouse.imageUrl) && (
              <div className="mb-4">
                <img
                  src={(openHouse.imageData || openHouse.imageUrl) as string}
                  alt="Property exterior"
                  className="w-full max-h-64 object-contain rounded-lg border"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}

            <Card className="bg-blue-50 border-blue-200 mb-4">
              <CardContent className="p-4">
                <h3 className="font-medium text-gray-800 mb-2">Open House</h3>
                <div className="flex items-center text-sm text-gray-700 space-x-4">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                    <span>{formattedDate}</span>
                  </div>
                  <div className="flex items-center">
                    <span>{openHouse.time}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-3 gap-2">
              <Button
                onClick={() => window.open(getMapUrl(openHouse.address), '_blank')}
                className="flex flex-col items-center justify-center space-y-1 bg-blue-600 text-white hover:bg-blue-700 h-16"
              >
                <MapPin className="h-4 w-4" />
                <span className="text-xs">View Map</span>
              </Button>
              <Button
                onClick={handleOpenInWaze}
                className="flex flex-col items-center justify-center space-y-1 bg-purple-600 text-white hover:bg-purple-700 h-16"
              >
                <Navigation className="h-4 w-4" />
                <span className="text-xs">Open Waze</span>
              </Button>
              <Button
                onClick={() => onNavigate("edit", { openHouse })}
                variant="outline"
                className="flex flex-col items-center justify-center space-y-1 border-gray-300 text-gray-700 hover:bg-gray-100 h-16"
              >
                <Edit className="h-4 w-4" />
                <span className="text-xs">Edit Details</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {openHouse.notes && (
          <Card className="shadow-material">
            <CardHeader>
              <CardTitle className="text-base font-medium text-gray-800">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">{openHouse.notes}</p>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-material">
          <CardHeader>
            <CardTitle className="text-base font-medium text-gray-800">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={handleMarkAsVisited}
              disabled={updateMutation.isPending}
              variant="ghost"
              className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 text-left"
            >
              <div className="flex items-center space-x-3">
                <Check className={`h-5 w-5 ${openHouse.visited ? 'text-green-500' : 'text-gray-400'}`} />
                <span className="font-medium">
                  {openHouse.visited ? 'Mark as Not Visited' : 'Mark as Visited'}
                </span>
              </div>
            </Button>

            <Button
              onClick={handleShare}
              variant="ghost"
              className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 text-left"
            >
              <div className="flex items-center space-x-3">
                <Share className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Share Listing</span>
              </div>
            </Button>

            <Button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              variant="ghost"
              className="w-full flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 text-left"
            >
              <div className="flex items-center space-x-3">
                <Trash2 className="h-5 w-5 text-red-500" />
                <span className="font-medium text-red-500">
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete Listing'}
                </span>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
