
import { useState } from "react";
import { Menu, X, LayoutDashboard } from "lucide-react";
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
            <div className="relative group cursor-pointer">
              <div className="flex items-center justify-center w-10 h-10 transform transition-all duration-200 group-hover:scale-105">
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="h-6 w-6 text-primary" />
                  <span className="text-lg font-semibold text-foreground">Dashboard</span>
                </div>
              </div>
            </div>
          </div>

          <DesktopMenu
            navigation={navigationItems}
            user={user}
            handleLogout={handleLogout}
            isAdmin={isAdmin}
          />

          {user && (
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
          )}
        </div>
      </div>

      {isOpen && user && (
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
