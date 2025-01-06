import { useState } from "react";
import { Menu, X, Gift, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import MobileMenu from "./navigation/MobileMenu";
import DesktopMenu from "./navigation/DesktopMenu";
import type { NavigationItem } from "./navigation/types";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAdmin, isLoading, handleLogout } = useAuth();

  const navigation: NavigationItem[] = [
    { name: "Home", href: "/" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Submit", href: "/submit" },
    { name: "Leaderboard", href: "/leaderboard" },
    { 
      name: "Manage Prizes", 
      href: "/admin", 
      icon: Gift, 
      adminOnly: true 
    },
    { 
      name: "Manage Submissions", 
      href: "/admin?tab=submissions", 
      icon: ClipboardList, 
      adminOnly: true 
    }
  ];

  if (isLoading) {
    return null;
  }

  return (
    <nav className="bg-background border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-primary">RewardHub</span>
            </div>
          </div>

          <DesktopMenu 
            navigation={navigation}
            user={user}
            handleLogout={handleLogout}
            isAdmin={isAdmin}
          />

          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground hover:text-primary transition-colors duration-200 ml-4"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <MobileMenu
          navigation={navigation}
          user={user}
          handleLogout={handleLogout}
          setIsOpen={setIsOpen}
        />
      )}
    </nav>
  );
};

export default Navigation;