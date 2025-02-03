import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const { session, isInitialized } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    console.log("Login component mounted, checking auth state...");
    console.log("isInitialized:", isInitialized, "session:", session ? "exists" : "none");
    
    if (!isInitialized) {
      console.log("Auth not initialized yet, showing loading state");
      return;
    }

    if (session) {
      console.log("User is authenticated, redirecting to home");
      navigate("/");
    }
  }, [session, navigate, isInitialized]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change:", event, session ? "Session exists" : "No session");
      
      if (event === "SIGNED_IN") {
        console.log("User signed in, redirecting to home");
        navigate("/");
      }

      // Clear error when auth state changes
      if (event === "SIGNED_OUT" || event === "SIGNED_IN") {
        setErrorMessage("");
      }

      // Handle auth errors
      if (event === "USER_UPDATED" && !session) {
        handleAuthError();
      }
    });

    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleAuthError = async () => {
    const { error } = await supabase.auth.getSession();
    if (error) {
      console.error("Auth error:", error);
      
      // More user-friendly error messages
      if (error.message.includes("Email not confirmed")) {
        setErrorMessage("Please verify your email address before signing in.");
      } else if (error.message.includes("Invalid login credentials")) {
        setErrorMessage("The email or password you entered is incorrect. Please try again.");
      } else if (error.message.includes("Email address is required")) {
        setErrorMessage("Please enter your email address.");
      } else if (error.message.includes("Password is required")) {
        setErrorMessage("Please enter your password.");
      } else if (error.message.includes("Invalid email")) {
        setErrorMessage("Please enter a valid email address.");
      } else if (error.message.includes("Password should be")) {
        setErrorMessage("Your password must be at least 6 characters long.");
      } else {
        setErrorMessage("An error occurred. Please try again.");
      }
    }
  };

  // Show loading state while auth is initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-xl shadow-sm">
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-bold text-foreground">Welcome back</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>

        {errorMessage && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <Auth
          supabaseClient={supabase}
          appearance={{ 
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#2DD4BF',
                  brandAccent: '#14B8A6',
                  brandButtonText: 'white',
                  defaultButtonBackground: '#F1F5F9',
                  defaultButtonBackgroundHover: '#E2E8F0',
                  defaultButtonBorder: '#CBD5E1',
                  defaultButtonText: '#64748B',
                  inputBackground: 'transparent',
                  inputBorder: '#E2E8F0',
                  inputBorderHover: '#2DD4BF',
                  inputBorderFocus: '#2DD4BF',
                  inputText: 'inherit',
                  inputLabelText: '#64748B',
                  inputPlaceholder: '#94A3B8',
                }
              },
            },
            className: {
              container: 'auth-container',
              button: 'auth-button',
              input: 'auth-input',
              label: 'auth-label',
              anchor: 'auth-anchor',
            },
          }}
          providers={[]}
          redirectTo={window.location.origin}
        />
      </div>
    </div>
  );
};

export default Login;