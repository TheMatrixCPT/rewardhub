import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    console.log("Login component mounted, session:", session ? "exists" : "none");
    
    if (session) {
      console.log("User is authenticated, redirecting to home");
      navigate("/");
    }
  }, [session, navigate]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change:", event, session ? "Session exists" : "No session");
      
      if (event === "SIGNED_IN") {
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

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAuthError = async () => {
    const { error } = await supabase.auth.getSession();
    if (error) {
      console.error("Auth error:", error);
      
      // User-friendly error messages
      if (error.message.includes("Email not confirmed")) {
        setErrorMessage("Please verify your email address before signing in. Check your inbox for the verification link.");
      } else if (error.message.includes("Invalid login credentials")) {
        setErrorMessage("The email or password you entered is incorrect. Please try again.");
      } else if (error.message.includes("Email address is required")) {
        setErrorMessage("Please enter your email address to continue.");
      } else if (error.message.includes("Password is required")) {
        setErrorMessage("Please enter your password to continue.");
      } else if (error.message.includes("Invalid email")) {
        setErrorMessage("Please enter a valid email address (e.g., name@example.com).");
      } else if (error.message.includes("Password should be")) {
        setErrorMessage("Your password must be at least 6 characters long.");
      } else if (error.message.includes("Too many requests")) {
        setErrorMessage("Too many login attempts. Please try again in a few minutes.");
      } else if (error.message.includes("User not found")) {
        setErrorMessage("We couldn't find an account with this email address. Please check your email or sign up for a new account.");
      } else if (error.message.includes("Password recovery")) {
        setErrorMessage("We've sent you a password reset link. Please check your email.");
      } else {
        setErrorMessage("An error occurred. Please try again or contact support if the problem persists.");
      }
    }
  };

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
          localization={{
            variables: {
              sign_in: {
                email_label: 'Email address',
                password_label: 'Your password',
                email_input_placeholder: 'name@example.com',
                password_input_placeholder: 'Your secure password',
                button_label: 'Sign in',
                loading_button_label: 'Signing in...',
                social_provider_text: 'Sign in with {{provider}}',
                link_text: "Don't have an account? Sign up",
              },
              sign_up: {
                email_label: 'Email address',
                password_label: 'Create a password',
                email_input_placeholder: 'name@example.com',
                password_input_placeholder: 'Create a secure password',
                button_label: 'Create account',
                loading_button_label: 'Creating account...',
                social_provider_text: 'Sign up with {{provider}}',
                link_text: "Already have an account? Sign in",
              },
              forgotten_password: {
                email_label: 'Email address',
                password_label: 'Your password',
                email_input_placeholder: 'name@example.com',
                button_label: 'Send reset instructions',
                loading_button_label: 'Sending reset instructions...',
                link_text: 'Forgot your password?',
              },
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