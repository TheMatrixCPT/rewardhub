
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import type { NavigationItem } from "./types";
import { adminNavigationItems } from "@/config/navigation";

interface MobileMenuProps {
  navigation: NavigationItem[];
  user: any;
  handleLogout: () => void;
  setIsOpen: (isOpen: boolean) => void;
  isAdmin?: boolean;
}

const MobileMenu = ({ navigation, user, handleLogout, setIsOpen, isAdmin }: MobileMenuProps) => {
  if (!user) return null;

  return (
    <div className="md:hidden">
      <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
        {navigation.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className="text-foreground hover:text-primary block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 flex items-center gap-2"
            onClick={() => setIsOpen(false)}
          >
            {item.icon && <item.icon className="h-4 w-4" />}
            {item.name}
          </Link>
        ))}

        {isAdmin && (
          <>
            <div className="px-3 py-2 text-sm font-semibold text-muted-foreground">
              Admin
            </div>
            {adminNavigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-foreground hover:text-primary block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 flex items-center gap-2"
                onClick={() => setIsOpen(false)}
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                {item.name}
              </Link>
            ))}
          </>
        )}

        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => {
            handleLogout();
            setIsOpen(false);
          }}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default MobileMenu;
