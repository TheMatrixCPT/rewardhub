import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import type { NavigationItem } from "./types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DesktopMenuProps {
  navigation: NavigationItem[];
  user: any;
  handleLogout: () => void;
  isAdmin: boolean;
}

const DesktopMenu = ({ navigation, user, handleLogout, isAdmin }: DesktopMenuProps) => {
  const regularNavItems = navigation.filter(item => !item.adminOnly);
  const adminNavItems = navigation.filter(item => item.adminOnly);

  return (
    <div className="hidden md:flex md:items-center md:space-x-4">
      {regularNavItems.map((item) => (
        <Link
          key={item.name}
          to={item.href}
          className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2"
        >
          {item.icon && <item.icon className="h-4 w-4" />}
          {item.name}
        </Link>
      ))}
      
      {isAdmin && adminNavItems.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Admin</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {adminNavItems.map((item) => (
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
      )}

      {user ? (
        <Button
          variant="ghost"
          className="flex items-center gap-2"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      ) : (
        <Link to="/auth">
          <Button>Login</Button>
        </Link>
      )}
    </div>
  );
};

export default DesktopMenu;