import { useState } from "react";
import { Search, SortAsc, Home, Printer, Plus, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useAuth, useLogout } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { OpenHouse } from "@shared/schema";

interface HeaderProps {
  onSearch?: (query: string) => void;
  onSort?: (sortBy: string) => void;
  onNavigate?: (path: string) => void;
}

export function Header({ onSearch, onSort, onNavigate }: HeaderProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const logoutMutation = useLogout();
  const [searchVisible, setSearchVisible] = useState(false);
  const [sortVisible, setSortVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSort, setActiveSort] = useState("date");

  const { data: openHouses = [] } = useQuery<OpenHouse[]>({
    queryKey: ["/api/open-houses"],
  });

  const handleSearchToggle = () => {
    setSearchVisible(!searchVisible);
    if (searchVisible) {
      setSearchQuery("");
      onSearch?.("");
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  const handleSortChange = (sortBy: string) => {
    setActiveSort(sortBy);
    onSort?.(sortBy);
  };

  const sortOptions = [
    { id: "date", label: "Date" },
    { id: "price", label: "Price" },
    { id: "location", label: "Location" }
  ];

  const handlePrint = () => {
    // Utility functions for sorting and formatting
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

    const formatDateForPrint = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    };

    const formatPriceForPrint = (price: string) => {
      const numPrice = parseInt(price.replace(/[^0-9]/g, ''));
      return '$' + numPrice.toLocaleString();
    };

    // Sort open houses by earliest date and time first
    const sortedHouses = [...openHouses].sort((a, b) => {
      const dateComparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (dateComparison !== 0) return dateComparison;
      return parseTime(a.time) - parseTime(b.time);
    });

    // Create print content
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Open House Schedule</title>
          <style>
            @media print {
              @page { margin: 0.5in; }
              body { -webkit-print-color-adjust: exact; }
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              line-height: 1.4;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #2563eb;
              padding-bottom: 15px;
            }
            .header h1 {
              margin: 0;
              color: #2563eb;
              font-size: 28px;
            }
            .header p {
              margin: 5px 0 0 0;
              color: #666;
              font-size: 14px;
            }
            .house {
              border: 1px solid #ddd;
              margin-bottom: 20px;
              padding: 15px;
              page-break-inside: avoid;
              background: #f9f9f9;
              display: flex;
              gap: 15px;
            }
            .house-content {
              flex: 1;
            }
            .house-image {
              width: 200px;
              height: 150px;
              object-fit: cover;
              border-radius: 4px;
              border: 1px solid #ddd;
              flex-shrink: 0;
            }
            .house-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 10px;
              flex-wrap: wrap;
            }
            .address {
              font-weight: bold;
              font-size: 16px;
              color: #1f2937;
              flex: 1;
              min-width: 200px;
            }
            .price {
              font-weight: bold;
              font-size: 18px;
              color: #059669;
              margin-left: 15px;
            }
            .datetime {
              background: #2563eb;
              color: white;
              padding: 8px 12px;
              border-radius: 4px;
              font-weight: bold;
              margin-top: 5px;
              display: inline-block;
            }
            .details {
              margin-top: 10px;
              color: #4b5563;
            }
            .zestimate {
              color: #7c3aed;
              font-weight: 500;
            }
            .notes {
              margin-top: 8px;
              font-style: italic;
              color: #6b7280;
            }
            .status {
              margin-top: 10px;
              font-size: 12px;
            }
            .visited { color: #059669; }
            .favorited { color: #dc2626; }
            .disliked { color: #dc2626; }
            .summary {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Open House Schedule</h1>
            <p>Generated on ${new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            })}</p>
          </div>
          
          ${sortedHouses.map(house => `
            <div class="house">
              ${house.imageData || house.imageUrl ? `
                <img src="${house.imageData || house.imageUrl}" alt="Property image" class="house-image" />
              ` : ''}
              <div class="house-content">
                <div class="house-header">
                  <div class="address">${house.address}</div>
                  <div class="price">${formatPriceForPrint(house.price)}</div>
                </div>
                
                <div class="datetime">
                  ${formatDateForPrint(house.date)} • ${house.time}
                </div>
                
                <div class="details">
                  ${house.zestimate && house.zestimate !== 'Not available' ? 
                    `<span class="zestimate">Zestimate: $${parseInt(house.zestimate).toLocaleString()}</span>` : 
                    ''
                  }
                  ${house.notes ? `<div class="notes">${house.notes}</div>` : ''}
                </div>
                
                <div class="status">
                  ${house.visited ? '<span class="visited">✓ Visited</span>' : ''}
                  ${house.favorited ? '<span class="favorited">★ Favorited</span>' : ''}
                  ${house.disliked ? '<span class="disliked">👎 Disliked</span>' : ''}
                </div>
              </div>
            </div>
          `).join('')}
          
          <div class="summary">
            Total Open Houses: ${sortedHouses.length}
          </div>
        </body>
      </html>
    `;

    // Open print window
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast({ title: "Logged out successfully" });
      onNavigate?.("landing");
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="modern-header sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
          <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 shadow-lg flex-shrink-0">
            <Home className="text-lg text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl font-bold gradient-text font-['Outfit'] leading-tight">
              <span className="block sm:inline">Open Home</span>
              <span className="block sm:inline sm:ml-1">Visit Planner</span>
            </h1>
            <p className="text-xs text-gray-600 font-medium hidden sm:block">Track Your Open Houses</p>
          </div>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          {onNavigate && (
            <Button
              onClick={() => onNavigate("add")}
              className="luxury-button px-2 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl shadow-lg"
            >
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Add New</span>
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrint}
            className="p-2 sm:p-3 rounded-xl hover:bg-gradient-to-r hover:from-purple-500 hover:to-indigo-600 hover:text-white transition-all duration-300 text-gray-700 hover:shadow-lg"
            title="Print Open Houses"
          >
            <Printer className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSearchToggle}
            className="p-2 sm:p-3 rounded-xl hover:bg-gradient-to-r hover:from-purple-500 hover:to-indigo-600 hover:text-white transition-all duration-300 text-gray-700 hover:shadow-lg"
          >
            <Search className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSortVisible(!sortVisible)}
            className="p-2 sm:p-3 rounded-xl hover:bg-gradient-to-r hover:from-purple-500 hover:to-indigo-600 hover:text-white transition-all duration-300 text-gray-700 hover:shadow-lg"
          >
            <SortAsc className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="p-2 sm:p-3 rounded-xl hover:bg-gradient-to-r hover:from-purple-500 hover:to-indigo-600 hover:text-white transition-all duration-300 text-gray-700 hover:shadow-lg"
              >
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem disabled className="text-sm text-gray-600">
                {user?.name || user?.email}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-red-600 focus:text-red-600"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {searchVisible && (
        <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search open houses..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          </div>
        </div>
      )}

      {sortVisible && (
        <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
          <div className="flex flex-wrap gap-2">
            {sortOptions.map((option) => (
              <Button
                key={option.id}
                variant={option.id === activeSort ? "default" : "secondary"}
                size="sm"
                onClick={() => handleSortChange(option.id)}
                className="px-3 py-2 rounded-full text-sm font-medium"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
