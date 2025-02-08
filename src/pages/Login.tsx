
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ChevronLeft } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { session, isInitialized } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isResetMode, setIsResetMode] = useState(false);

  useEffect(() => {
    if (session && isInitialized) {
      console.log("Login: Session detected in auth context, redirecting to home");
      navigate("/");
    }
  }, [session, navigate, isInitialized]);

  useEffect(() => {
    console.log("Login: Setting up auth state change listener");
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log("Login: Auth state changed -", event, currentSession ? "Session exists" : "No session");

      if (event === "SIGNED_IN" && currentSession) {
        console.log("Login: User signed in successfully, redirecting to home");
        navigate("/");
      }

      if (event === "SIGNED_OUT") {
        console.log("Login: User signed out");
        setErrorMessage("");
      }

      if (event === "TOKEN_REFRESHED" && currentSession) {
        console.log("Login: Token refreshed successfully");
        navigate("/");
      }

      if (event === "PASSWORD_RECOVERY") {
        setIsResetMode(true);
      }
    });

    return () => {
      console.log("Login: Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleForgotPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) throw error;
      toast.success("Password reset instructions have been sent to your email");
    } catch (error) {
      console.error("Error sending reset password email:", error);
      toast.error("Failed to send reset password email. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-xl shadow-sm">
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
          <h2 className="text-3xl font-bold text-foreground">Welcome back</h2>
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
          showLinks={false}
          localization={{
            variables: {
              sign_in: {
                email_label: "Email address",
                password_label: "Password",
                button_label: "Sign in",
                loading_button_label: "Signing in ...",
                password_input_placeholder: "Your password",
                email_input_placeholder: "Your email address",
                link_text: "Already have an account? Sign in",
              }
            }
          }}
          view={isResetMode ? "update_password" : "sign_in"}
        />

        <div className="mt-4 text-center space-y-2">
          <button
            onClick={() => setIsResetMode(true)}
            className="text-sm text-primary hover:text-primary/90 block w-full"
          >
            Forgot password?
          </button>
          <Link to="/register" className="text-sm text-primary hover:text-primary/90 block">
            Don't have an account? Sign up here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
