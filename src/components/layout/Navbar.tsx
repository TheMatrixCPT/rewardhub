
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { navigationItems, adminNavigationItems } from "@/config/navigation";
import DesktopMenu from "@/components/navigation/DesktopMenu";
import MobileMenu from "@/components/navigation/MobileMenu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";

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
                <div className="flex items-center">
                  <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">R</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-primary-hover to-primary bg-clip-text text-transparent">H</span>
                </div>
              </div>
              <span className="absolute left-full ml-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
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

          {isAdmin && (
            <div className="hidden md:flex items-center ml-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    Admin
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {adminNavigationItems.map((item) => (
                    <DropdownMenuItem key={item.name} asChild>
                      <Link
                        to={item.href}
                        className="flex items-center gap-2 w-full"
                      >
                        {item.icon && <item.icon className="h-4 w-4" />}
                        {item.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

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
          isAdmin={isAdmin}
        />
      )}
    </nav>
  );
};

export default Navbar;
