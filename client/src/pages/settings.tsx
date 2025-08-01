import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, LogOut, User, Mail, Calendar, Shield, ExternalLink } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { User as UserType } from "@shared/schema";

interface SettingsProps {
  onNavigate: (path: string, params?: any) => void;
}

export function Settings({ onNavigate }: SettingsProps) {
  const { user, isLoading } = useAuth();
  
  // Type assertion to ensure proper typing
  const typedUser = user as UserType | undefined;

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const userInitials = typedUser?.firstName && typedUser?.lastName 
    ? `${typedUser.firstName[0]}${typedUser.lastName[0]}`
    : typedUser?.email?.[0]?.toUpperCase() || "U";

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
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-sm text-gray-600">Manage your account and preferences</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* User Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Profile</span>
            </CardTitle>
            <CardDescription>
              Your account information and profile details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage 
                  src={typedUser?.profileImageUrl || ""} 
                  alt={typedUser?.firstName || "User"} 
                />
                <AvatarFallback className="text-lg font-semibold bg-blue-100 text-blue-700">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {typedUser?.firstName || typedUser?.lastName 
                    ? `${typedUser?.firstName || ""} ${typedUser?.lastName || ""}`.trim()
                    : "User"
                  }
                </h3>
                <p className="text-sm text-gray-600 flex items-center mt-1">
                  <Mail className="h-4 w-4 mr-2" />
                  {typedUser?.email || "No email available"}
                </p>
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <Calendar className="h-3 w-3 mr-2" />
                  Member since {typedUser?.createdAt ? new Date(typedUser.createdAt).toLocaleDateString() : "Unknown"}
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Account Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-gray-600">User ID</label>
                  <p className="font-mono text-xs bg-gray-100 px-2 py-1 rounded mt-1">
                    {typedUser?.id || "Not available"}
                  </p>
                </div>
                <div>
                  <label className="text-gray-600">Email</label>
                  <p className="text-gray-900 mt-1">{typedUser?.email || "Not available"}</p>
                </div>
                <div>
                  <label className="text-gray-600">First Name</label>
                  <p className="text-gray-900 mt-1">{typedUser?.firstName || "Not set"}</p>
                </div>
                <div>
                  <label className="text-gray-600">Last Name</label>
                  <p className="text-gray-900 mt-1">{typedUser?.lastName || "Not set"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* App Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>App Information</span>
            </CardTitle>
            <CardDescription>
              Information about the Open House Planner app
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Version</span>
              <Badge variant="outline">1.0.0</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Authentication</span>
              <Badge className="bg-green-100 text-green-800">Secure</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Data Storage</span>
              <Badge className="bg-blue-100 text-blue-800">Encrypted</Badge>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Your property data is securely stored and encrypted. We respect your privacy and 
                only use your information to provide the best house hunting experience.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center space-x-2"
                onClick={() => window.open("https://github.com/tommymac501/theOpenHousePlanner", "_blank")}
              >
                <ExternalLink className="h-4 w-4" />
                <span>View on GitHub</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Account Actions</CardTitle>
            <CardDescription>
              Manage your account session and data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-3">
              <Button 
                variant="destructive" 
                onClick={handleLogout}
                className="flex items-center justify-center space-x-2 w-full sm:w-auto"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
              <p className="text-xs text-gray-500">
                You will be redirected to the login page. Your data will remain safe and accessible when you sign back in.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 py-4">
          <p>© 2024 Open House Planner. Built with ❤️ for home buyers.</p>
          <p className="mt-1">Secure authentication powered by Replit</p>
        </div>
      </div>
    </div>
  );
}