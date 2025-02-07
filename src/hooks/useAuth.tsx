import { useState, useEffect, createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, metadata?: any) => Promise<void>;
  handleLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isAdmin: false,
  isLoading: true,
  isInitialized: false,
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  handleLogout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  // Check if user is admin based on email
  const checkAdminAccess = (email: string | undefined) => {
    console.log("Checking admin access for email:", email);
    return email === 'shadlyfrans@gmail.com';
  };

  useEffect(() => {
    let mounted = true;
    console.log("AuthProvider: Initializing auth state");

    const initializeAuth = async () => {
      try {
        console.log("AuthProvider: Getting session");
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("AuthProvider: Session initialization error:", error.message);
          if (mounted) {
            setIsLoading(false);
            setUser(null);
            setSession(null);
            setIsInitialized(true);
          }
          return;
        }

        if (currentSession?.user && mounted) {
          console.log("AuthProvider: Valid session found");
          setSession(currentSession);
          setUser(currentSession.user);
          setIsAdmin(checkAdminAccess(currentSession.user.email));
        }
        
        if (mounted) {
          setIsLoading(false);
          setIsInitialized(true);
        }
      } catch (error) {
        console.error("AuthProvider: Auth initialization error:", error);
        if (mounted) {
          setIsLoading(false);
          setIsInitialized(true);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log("AuthProvider: Auth state changed:", event, currentSession ? "Session exists" : "No session");
      
      if (!mounted) return;

      if (event === 'TOKEN_REFRESHED') {
        console.log("AuthProvider: Token refreshed successfully");
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          setIsAdmin(checkAdminAccess(currentSession.user.email));
        }
      }

      if (event === 'SIGNED_IN') {
        console.log("AuthProvider: User signed in");
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          setIsAdmin(checkAdminAccess(currentSession.user.email));
          navigate("/");
        }
      }

      if (event === 'SIGNED_OUT') {
        console.log("AuthProvider: User signed out");
        setSession(null);
        setUser(null);
        setIsAdmin(false);
        navigate("/login");
      }
      
      setIsLoading(false);
      setIsInitialized(true);
    });

    return () => {
      console.log("AuthProvider: Cleaning up auth subscription");
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signInWithEmail = async (email: string, password: string) => {
    try {
      console.log("AuthProvider: Attempting sign in");
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error("AuthProvider: Sign in error:", error);
        toast.error(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string, metadata?: any) => {
    try {
      console.log("AuthProvider: Attempting sign up");
      setIsLoading(true);
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: { data: metadata }
      });
      if (error) {
        console.error("AuthProvider: Sign up error:", error);
        toast.error(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      console.log("AuthProvider: Attempting logout");
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("AuthProvider: Logout error:", error);
        toast.error(error.message);
      }
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
        isInitialized,
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