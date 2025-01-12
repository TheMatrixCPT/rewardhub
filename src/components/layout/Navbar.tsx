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
            <span className="text-2xl font-bold">Logo</span>
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