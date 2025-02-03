import { useState, useEffect, createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAdminStatus } from "./useAdminStatus";
import { authService } from "@/services/authService";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, metadata?: any) => Promise<void>;
  handleLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isAdmin: false,
  isLoading: true,
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  handleLogout: async () => {},
});

// Helper functions for session storage
const SESSION_KEY = 'app_session';
const USER_KEY = 'app_user';
const ADMIN_KEY = 'is_admin';

const getStoredSession = () => {
  const stored = sessionStorage.getItem(SESSION_KEY);
  return stored ? JSON.parse(stored) : null;
};

const getStoredUser = () => {
  const stored = sessionStorage.getItem(USER_KEY);
  return stored ? JSON.parse(stored) : null;
};

const getStoredAdminStatus = () => {
  return sessionStorage.getItem(ADMIN_KEY) === 'true';
};

const clearStoredAuth = () => {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(ADMIN_KEY);
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [session, setSession] = useState<Session | null>(() => getStoredSession());
  const [isLoading, setIsLoading] = useState(!user);
  const navigate = useNavigate();
  const { isAdmin, isChecking, checkAdminStatus } = useAdminStatus(user?.id);

  useEffect(() => {
    console.log("AuthProvider mounted, setting up auth state...");
    let mounted = true;

    const initializeAuth = async () => {
      if (!mounted) return;
      
      try {
        console.log("Fetching initial session...");
        // Try to get session from storage first
        const storedSession = getStoredSession();
        const storedUser = getStoredUser();
        
        if (storedSession && storedUser) {
          console.log("Found stored session, validating...");
          const { data: { session: freshSession }, error } = await authService.getSession();
          
          if (!error && freshSession) {
            console.log("Stored session is valid");
            setSession(freshSession);
            setUser(storedUser);
            await checkAdminStatus(storedUser.id);
          } else {
            console.log("Stored session invalid, clearing...");
            clearStoredAuth();
            setSession(null);
            setUser(null);
          }
        } else {
          console.log("No stored session, checking for active session...");
          const { data: { session }, error } = await authService.getSession();
          
          if (error) {
            console.error("Error fetching session:", error);
            if (mounted) {
              setIsLoading(false);
              setUser(null);
              setSession(null);
            }
            return;
          }

          if (session?.user) {
            console.log("Setting up authenticated user state...");
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
            sessionStorage.setItem(USER_KEY, JSON.stringify(session.user));
            setSession(session);
            setUser(session.user);
            await checkAdminStatus(session.user.id);
          }
        }
      } catch (error) {
        console.error("Error in auth initialization:", error);
      } finally {
        if (mounted) {
          console.log("Completing initialization, setting loading to false");
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session ? "Session exists" : "No session");
      
      if (!mounted) {
        console.log("Component unmounted, skipping auth state update");
        return;
      }

      if (event === 'SIGNED_OUT') {
        console.log("User signed out, clearing auth state");
        clearStoredAuth();
        setSession(null);
        setUser(null);
        setIsLoading(false);
        return;
      }

      if (session?.user) {
        console.log("Updating auth state with new session");
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
        sessionStorage.setItem(USER_KEY, JSON.stringify(session.user));
        setSession(session);
        setUser(session.user);
        await checkAdminStatus(session.user.id);
        if (isAdmin) {
          sessionStorage.setItem(ADMIN_KEY, 'true');
        }
      } else {
        console.log("No session in auth state change");
        clearStoredAuth();
        setSession(null);
        setUser(null);
      }
      
      setIsLoading(false);
    });

    return () => {
      console.log("Cleaning up auth subscription");
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setIsLoading(isChecking);
  }, [isChecking]);

  const signInWithEmail = async (email: string, password: string) => {
    try {
      console.log("Attempting sign in...");
      setIsLoading(true);
      await authService.signInWithEmail(email, password);
      navigate("/");
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string, metadata?: any) => {
    try {
      console.log("Attempting sign up...");
      setIsLoading(true);
      await authService.signUpWithEmail(email, password, metadata);
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      console.log("Attempting logout...");
      setIsLoading(true);
      clearStoredAuth();
      await authService.handleLogout();
      navigate("/login");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAdmin,
        isLoading,
        signInWithEmail,
        signUpWithEmail,
        handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};