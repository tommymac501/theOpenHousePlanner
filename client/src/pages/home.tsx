import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Home as HomeIcon, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { StatsDashboard } from "@/components/stats-dashboard";
import { OpenHouseCard } from "@/components/open-house-card";
import type { OpenHouse } from "@shared/schema";

interface HomeProps {
  onNavigate: (path: string, params?: any) => void;
}

export function Home({ onNavigate }: HomeProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const { data: openHouses = [], isLoading } = useQuery<OpenHouse[]>({
    queryKey: ["/api/open-houses"],
  });

  const filteredAndSortedHouses = openHouses
    .filter(house => {
      // Apply search filter
      const matchesSearch = !searchQuery || 
        house.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        house.price.includes(searchQuery);
      
      if (!matchesSearch) return false;
      
      // Apply active filter
      if (!activeFilter) return true;
      
      const now = new Date();
      const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
      const houseDate = new Date(house.date);
      
      switch (activeFilter) {
        case "thisWeek":
          // Include today and next 7 days
          const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const endOfWeek = new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000);
          const matches = houseDate >= startOfToday && houseDate < endOfWeek;
          // Debug logging
          console.log(`[DEBUG] This Week Filter:`, {
            house: house.address.substring(0, 40),
            date: house.date,
            houseDate: houseDate.toISOString(),
            startOfToday: startOfToday.toISOString(),
            endOfWeek: endOfWeek.toISOString(),
            matches
          });
          return matches;
        case "nextWeek":
          // Week 2: days 8-14 from today
          const startOfNextWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);
          const endOfNextWeek = new Date(startOfNextWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
          return houseDate >= startOfNextWeek && houseDate < endOfNextWeek;
        case "liked":
          return house.favorited;
        case "disliked":
          return house.disliked;
        case "visited":
          return house.visited;
        case "notVisited":
          return !house.visited;
        default:
          return true;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price":
          return parseInt(a.price.replace(/[^0-9]/g, '')) - parseInt(b.price.replace(/[^0-9]/g, ''));
        case "location":
          return a.address.localeCompare(b.address);
        case "date":
        default:
          // Sort by date first, then by time
          const dateComparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          if (dateComparison !== 0) return dateComparison;
          
          // Parse times for comparison
          const parseTime = (timeStr: string) => {
            const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
            if (!match) return 0;
            let hours = parseInt(match[1]);
            const minutes = parseInt(match[2]);
            const isPM = match[3].toUpperCase() === 'PM';
            if (isPM && hours !== 12) hours += 12;
            if (!isPM && hours === 12) hours = 0;
            return hours * 60 + minutes;
          };
          
          return parseTime(a.time) - parseTime(b.time);
      }
    });

  // Create grouping function based on current sort
  const getGroupKey = (house: OpenHouse) => {
    switch (sortBy) {
      case "date":
        // Parse date properly to avoid timezone issues
        const [year, month, day] = house.date.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        
        if (date.getTime() === today.getTime()) {
          return "Today";
        } else if (date.getTime() === yesterday.getTime()) {
          return "Yesterday";
        } else if (date.getTime() === tomorrow.getTime()) {
          return "Tomorrow";
        } else if (date < today) {
          return "Past Open Houses";
        } else {
          return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        }
      case "price":
        const price = parseInt(house.price.replace(/[^0-9]/g, ''));
        if (price < 300000) return "Under $300k";
        if (price < 500000) return "$300k - $500k";
        if (price < 750000) return "$500k - $750k";
        if (price < 1000000) return "$750k - $1M";
        return "Over $1M";
      case "location":
        const city = house.address.split(',')[1]?.trim() || "Unknown City";
        return city;
      default:
        return "All Properties";
    }
  };

  // Group houses by the determined key
  const groupedHouses = filteredAndSortedHouses.reduce((groups, house) => {
    const groupKey = getGroupKey(house);
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(house);
    return groups;
  }, {} as Record<string, OpenHouse[]>);

  // Sort group keys for consistent display order
  const sortedGroupKeys = Object.keys(groupedHouses).sort((a, b) => {
    if (sortBy === "date") {
      const order = ["Today", "Tomorrow", "Yesterday", "Past Open Houses"];
      const aIndex = order.indexOf(a);
      const bIndex = order.indexOf(b);
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return new Date(a).getTime() - new Date(b).getTime();
    }
    return a.localeCompare(b);
  });

  const toggleGroupCollapse = (groupKey: string) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(groupKey)) {
      newCollapsed.delete(groupKey);
    } else {
      newCollapsed.add(groupKey);
    }
    setCollapsedGroups(newCollapsed);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading open houses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header onSearch={setSearchQuery} onSort={setSortBy} onNavigate={onNavigate} />
      
      <main className="pb-24">
        <div className="animate-fade-in">
          <StatsDashboard onFilterChange={setActiveFilter} activeFilter={activeFilter} />
        </div>

        {Object.keys(groupedHouses).length > 0 ? (
          <div className="px-6 mt-4 space-y-4">
            {sortedGroupKeys.map((groupKey) => {
              const houses = groupedHouses[groupKey];
              const isCollapsed = collapsedGroups.has(groupKey);
              const isPastGroup = groupKey === "Past Open Houses";
              
              return (
                <div key={groupKey} className="space-y-3">
                  <div className="sticky top-16 py-2 z-10">
                    <button
                      onClick={() => toggleGroupCollapse(groupKey)}
                      className="w-full glass-effect px-4 py-2 rounded-xl hover:bg-white/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <h2 className="text-lg font-bold gradient-text font-['Outfit'] flex items-center">
                            {isCollapsed ? (
                              <ChevronRight className="w-5 h-5 mr-2 text-gray-500" />
                            ) : (
                              <ChevronDown className="w-5 h-5 mr-2 text-gray-500" />
                            )}
                            {groupKey}
                          </h2>
                          <p className="text-xs text-gray-600">
                            {houses.length} {houses.length === 1 ? 'property' : 'properties'}
                            {isPastGroup && houses.filter(h => h.visited).length > 0 && 
                              ` • ${houses.filter(h => h.visited).length} visited`
                            }
                          </p>
                        </div>
                        <div className="text-xs text-gray-400">
                          {isCollapsed ? 'Click to expand' : 'Click to collapse'}
                        </div>
                      </div>
                    </button>
                  </div>
                  
                  {!isCollapsed && (
                    <div className="space-y-3 animate-fade-in">
                      {houses.map((house, index) => (
                        <div key={house.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                          <OpenHouseCard
                            openHouse={house}
                            onClick={() => onNavigate("detail", { id: house.id })}
                            onEdit={() => onNavigate("edit", { openHouse: house })}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 px-6">
            <div className="floating-card max-w-md mx-auto p-8">
              <div className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r ${activeFilter ? 'from-gray-400 to-gray-500' : 'from-purple-500 to-indigo-600'} flex items-center justify-center`}>
                <HomeIcon className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3 font-['Outfit']">
                {activeFilter ? "None found" : searchQuery ? "No Properties Found" : "Welcome to Open Home Visit Planner"}
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {activeFilter 
                  ? "No properties match the selected filter."
                  : searchQuery 
                    ? "Try adjusting your search terms to find the perfect property."
                    : "Start tracking your dream properties and never miss an open house again."
                }
              </p>
              {!searchQuery && !activeFilter && (
                <Button 
                  onClick={() => onNavigate("add")}
                  className="luxury-button px-8 py-3 text-lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Your First Property
                </Button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
