import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { navigationItems } from "@/config/navigation";
import DesktopMenu from "@/components/navigation/DesktopMenu";
import MobileMenu from "@/components/navigation/MobileMenu";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAdmin, handleLogout } = useAuth();

  return (
    <nav className="bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex items-center space-x-1 group cursor-pointer">
              <span className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent transform transition-transform duration-200 group-hover:scale-105">
                R
              </span>
              <div className="w-0.5 h-6 bg-primary transform -skew-x-12 mx-0.5 opacity-70" />
              <span className="text-3xl font-bold bg-gradient-to-r from-primary-hover to-primary bg-clip-text text-transparent transform transition-transform duration-200 group-hover:scale-105">
                H
              </span>
              <span className="text-xs text-muted-foreground ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                RewardHub
              </span>
            </div>
          </div>

          <DesktopMenu
            navigation={navigationItems}
            user={user}
            handleLogout={handleLogout}
            isAdmin={isAdmin}
          />

          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              className="inline-flex items-center justify-center p-2"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {isOpen && (
        <MobileMenu
          navigation={navigationItems}
          user={user}
          handleLogout={handleLogout}
          setIsOpen={setIsOpen}
        />
      )}
    </nav>
  );
};

export default Navbar;