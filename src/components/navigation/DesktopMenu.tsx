
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import type { NavigationItem } from "./types";

interface DesktopMenuProps {
  navigation: NavigationItem[];
  user: any;
  handleLogout: () => void;
  isAdmin: boolean;
}

const DesktopMenu = ({ navigation, user, handleLogout, isAdmin }: DesktopMenuProps) => {
  if (!user) {
    return (
      <div className="hidden md:flex md:items-center md:space-x-4">
        <Link to="/login">
          <Button>Login</Button>
        </Link>
      </div>
    );
  }

  const visibleItems = navigation.filter(item => !item.adminOnly || (item.adminOnly && isAdmin));

  return (
    <div className="hidden md:flex md:items-center md:space-x-4">
      {visibleItems.map((item) => (
        <Link
          key={item.name}
          to={item.href}
          className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2"
        >
          {item.icon && <item.icon className="h-4 w-4" />}
          {item.name}
        </Link>
      ))}
      
      <Button
        variant="ghost"
        className="flex items-center gap-2"
        onClick={handleLogout}
      >
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    </div>
  );
};

export default DesktopMenu;
