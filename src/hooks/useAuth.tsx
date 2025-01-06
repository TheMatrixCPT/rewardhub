import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

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

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Initial session check:", session ? "Session found" : "No session");
        
        setUser(session?.user ?? null);
        if (session?.user) {
          checkAdmin(session.user.id);
        } else {
          setIsLoading(false);
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session ? "Session exists" : "No session");
      
      if (event === 'SIGNED_OUT') {
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

  return { user, isAdmin, isLoading, handleLogout };
};