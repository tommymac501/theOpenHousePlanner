import { Clock, Calendar, MapPin, Edit, Heart, ThumbsDown, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate, formatPrice, isUpcoming, getMapUrl } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { OpenHouse } from "@shared/schema";

interface OpenHouseCardProps {
  openHouse: OpenHouse;
  onClick: () => void;
  onEdit: () => void;
}

export function OpenHouseCard({ openHouse, onClick, onEdit }: OpenHouseCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Consolidated mutation for preference updates
  const updatePreferenceMutation = useMutation({
    mutationFn: async ({ favorited, disliked }: { favorited: boolean; disliked: boolean }) => {
      await apiRequest("PATCH", `/api/open-houses/${openHouse.id}`, {
        favorited,
        disliked,
        visited: true // Always mark as visited when favoriting or disliking
      });
    },
    onSuccess: (_, variables) => {
      // Force immediate cache refresh
      queryClient.invalidateQueries({ queryKey: ["/api/open-houses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.refetchQueries({ queryKey: ["/api/open-houses"] });
      queryClient.refetchQueries({ queryKey: ["/api/stats"] });
      
      const { favorited, disliked } = variables;
      
      if (favorited && !openHouse.favorited) {
        toast({ title: "Added to favorites" });
      } else if (!favorited && openHouse.favorited) {
        toast({ title: "Removed from favorites" });
      } else if (disliked && !openHouse.disliked) {
        toast({ title: "Added to dislikes" });
      } else if (!disliked && openHouse.disliked) {
        toast({ title: "Removed from dislikes" });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update preference",
        variant: "destructive",
      });
    },
  });

  const handleMapClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(getMapUrl(openHouse.address), '_blank');
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    updatePreferenceMutation.mutate({
      favorited: !openHouse.favorited,
      disliked: false
    });
  };

  const handleDislikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    updatePreferenceMutation.mutate({
      favorited: false,
      disliked: !openHouse.disliked
    });
  };

  const upcoming = isUpcoming(openHouse.date);

  return (
    <div 
      className={`floating-card overflow-hidden cursor-pointer group transition-all duration-300 ${
        openHouse.visited ? 'opacity-90' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex p-4">
        {(openHouse.imageData || openHouse.imageUrl) && (
          <div className="relative overflow-hidden w-16 h-16 rounded-xl mr-4 flex-shrink-0">
            <img
              src={openHouse.imageData || openHouse.imageUrl || ""}
              alt="Property"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-base text-gray-900 leading-tight flex-1 pr-2 group-hover:gradient-text transition-all duration-300 font-['Outfit'] truncate">
              {openHouse.address}
            </h3>
            <div className="flex space-x-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFavoriteClick}
                className="p-1 rounded-full text-gray-400 hover:text-red-500 transition-all duration-300"
                disabled={updatePreferenceMutation.isPending}
              >
                <Heart className={`h-4 w-4 ${openHouse.favorited ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDislikeClick}
                className="p-1 rounded-full text-gray-400 hover:text-red-600 transition-all duration-300"
                disabled={updatePreferenceMutation.isPending}
              >
                <ThumbsDown className={`h-3 w-3 ${openHouse.disliked ? 'text-red-600 opacity-50' : ''}`} />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="price-highlight text-lg font-bold">
                {formatPrice(openHouse.price)}
              </div>
              {openHouse.monthlyPayment && (
                <div className="text-sm text-gray-600 font-medium">
                  Est. ${formatPrice(openHouse.monthlyPayment)}/mo
                </div>
              )}
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              openHouse.visited 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {openHouse.visited ? 'Visited' : 'Not Visited'}
            </span>
          </div>
          
          <div className="flex items-center text-xs text-gray-600 mb-2 space-x-4">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1 text-purple-500" />
              <span>{formatDate(openHouse.date)}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1 text-indigo-500" />
              <span>{openHouse.time}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMapClick}
                className="px-3 py-1 text-xs rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:shadow-lg transition-all duration-300"
              >
                <MapPin className="h-3 w-3 mr-1" />
                Map
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEditClick}
                className="px-3 py-1 text-xs rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 transition-all duration-300"
              >
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>
              {openHouse.listingUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(openHouse.listingUrl || '', '_blank');
                  }}
                  className="px-3 py-1 text-xs rounded-lg border border-blue-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all duration-300"
                >
                  <Link className="h-3 w-3 mr-1" />
                  Listing
                </Button>
              )}
            </div>
            
            {openHouse.imageUrl && (
              <a 
                href={openHouse.imageUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center"
                onClick={(e) => e.stopPropagation()}
              >
                <Link className="h-3 w-3 mr-1" />
                Listing
              </a>
            )}
          </div>
          
          {openHouse.visited && openHouse.notes && (
            <div className="mt-3 pt-2 border-t border-gray-200">
              <div className="text-xs text-gray-600 leading-relaxed">{openHouse.notes}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
