import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";

interface Stats {
  total: number;
  thisWeek: number;
  visited: number;
}

export function StatsDashboard() {
  const { data: stats } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  return (
    <div className="mx-6 my-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="floating-card p-4 text-center group hover:neon-glow">
          <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <div className="text-white font-bold text-sm">{stats?.total || 0}</div>
          </div>
          <div className="text-xl font-bold gradient-text mb-1 font-['Outfit']">
            {stats?.total || 0}
          </div>
          <div className="text-xs text-gray-600 font-medium uppercase tracking-wide">Total</div>
        </div>
        
        <div className="floating-card p-4 text-center group hover:neon-glow">
          <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
            <div className="text-white font-bold text-sm">{stats?.thisWeek || 0}</div>
          </div>
          <div className="text-xl font-bold price-highlight mb-1 font-['Outfit']">
            {stats?.thisWeek || 0}
          </div>
          <div className="text-xs text-gray-600 font-medium uppercase tracking-wide">This Week</div>
        </div>
        
        <div className="floating-card p-4 text-center group hover:neon-glow">
          <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
            <div className="text-white font-bold text-sm">{stats?.visited || 0}</div>
          </div>
          <div className="text-xl font-bold text-green-600 mb-1 font-['Outfit']">
            {stats?.visited || 0}
          </div>
          <div className="text-xs text-gray-600 font-medium uppercase tracking-wide">Visited</div>
        </div>
      </div>
    </div>
  );
}
