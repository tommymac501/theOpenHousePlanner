import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";

interface Stats {
  total: number;
  thisWeek: number;
  nextWeek: number;
  visited: number;
  notVisited: number;
  liked: number;
  disliked: number;
}

interface StatsDashboardProps {
  onFilterChange: (filter: string | null) => void;
  activeFilter: string | null;
}

export function StatsDashboard({ onFilterChange, activeFilter }: StatsDashboardProps) {
  const { data: stats } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  const filterCards = [
    {
      key: null,
      label: "All Properties",
      value: stats?.total || 0,
      gradient: "from-blue-500 to-purple-600",
      textColor: "gradient-text"
    },
    {
      key: "thisWeek",
      label: "This Week",
      value: stats?.thisWeek || 0,
      gradient: "from-orange-500 to-red-500",
      textColor: "price-highlight"
    },
    {
      key: "nextWeek", 
      label: "Next Week",
      value: stats?.nextWeek || 0,
      gradient: "from-purple-500 to-pink-500",
      textColor: "text-purple-600"
    },
    {
      key: "liked",
      label: "Liked",
      value: stats?.liked || 0,
      gradient: "from-pink-500 to-rose-500",
      textColor: "text-pink-600"
    },
    {
      key: "disliked",
      label: "Disliked", 
      value: stats?.disliked || 0,
      gradient: "from-gray-500 to-slate-600",
      textColor: "text-gray-600"
    },
    {
      key: "visited",
      label: "Visited",
      value: stats?.visited || 0,
      gradient: "from-green-500 to-emerald-600",
      textColor: "text-green-600"
    },
    {
      key: "notVisited",
      label: "Not Visited",
      value: stats?.notVisited || 0,
      gradient: "from-yellow-500 to-amber-600",
      textColor: "text-yellow-600"
    }
  ];

  return (
    <div className="mx-6 my-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {filterCards.map((card) => (
          <div
            key={card.key || 'all'}
            className={`floating-card p-3 text-center cursor-pointer transition-all duration-200 ${
              activeFilter === card.key 
                ? 'ring-2 ring-blue-500 shadow-lg scale-105 bg-blue-50' 
                : 'hover:neon-glow hover:scale-102'
            }`}
            onClick={() => onFilterChange(card.key)}
          >
            <div className={`w-8 h-8 mx-auto mb-2 rounded-full bg-gradient-to-r ${card.gradient} flex items-center justify-center`}>
              <div className="text-white font-bold text-sm">{card.value}</div>
            </div>
            <div className={`text-xl font-bold mb-1 font-['Outfit'] ${card.textColor}`}>
              {card.value}
            </div>
            <div className="text-xs text-gray-600 font-medium uppercase tracking-wide">
              {card.label}
            </div>
          </div>
        ))}
      </div>
      
      {activeFilter && (
        <div className="mt-4 text-center">
          <button
            onClick={() => onFilterChange(null)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear Filter
          </button>
        </div>
      )}
    </div>
  );
}
