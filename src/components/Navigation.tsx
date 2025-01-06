import { useState, useEffect } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Initial session check
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Initial session check:", session ? "Session found" : "No session");
        
        setUser(session?.user ?? null);
        if (session?.user) {
          checkAdmin(session.user.id);
        } else {
          setIsLoading(false);
          // If no session, redirect to auth page
          navigate("/auth");
        }
      } catch (error) {
        console.error("Session check error:", error);
        setIsLoading(false);
        toast.error("Authentication error. Please try logging in again.");
        navigate("/auth");
      }
    };

    checkSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session ? "Session exists" : "No session");
      
      if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        setUser(null);
        setIsAdmin(false);
        setIsLoading(false);
        navigate("/auth");
        return;
      }

      if (session?.user) {
        setUser(session.user);
        checkAdmin(session.user.id);
      } else {
        setUser(null);
        setIsLoading(false);
        setIsAdmin(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const checkAdmin = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('is_admin', {
        user_id: userId
      });
      
      if (error) {
        console.error('Error checking admin status:', error);
        toast.error("Error checking permissions");
      } else {
        console.log("Admin status check result:", data);
        setIsAdmin(data);
      }
    } catch (error) {
      console.error('Admin check error:', error);
      toast.error("Error checking permissions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      navigate("/auth");
    } catch (error) {
      console.error('Logout error:', error);
      toast.error("Error logging out");
    }
  };

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Submit", href: "/submit" },
    { name: "Leaderboard", href: "/leaderboard" },
  ];

  if (isAdmin) {
    navigation.push({ name: "Admin", href: "/admin" });
  }

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

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
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

          {/* Mobile Navigation Button */}
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

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-foreground hover:text-primary block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {user ? (
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
            ) : (
              <Link to="/auth" onClick={() => setIsOpen(false)}>
                <Button className="w-full">Login</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;