import { useEffect } from "react";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Clear any existing tokens from localStorage on component mount
    localStorage.removeItem('supabase.auth.token');
    
    // Check if user is already logged in
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Session check error:", error);
          return;
        }
        
        if (session) {
          console.log("User already logged in, redirecting to dashboard");
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Session check error:", error);
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth event:", event);
        
        if (event === "SIGNED_IN" && session) {
          console.log("User signed in:", session.user.email);
          // Clear any existing tokens from localStorage
          localStorage.removeItem('supabase.auth.token');
          
          toast({
            title: "Welcome to RewardHub!",
            description: "You have successfully signed in.",
          });
          navigate("/dashboard");
        } else if (event === "SIGNED_OUT") {
          console.log("User signed out");
          // Clear any existing tokens
          localStorage.removeItem('supabase.auth.token');
          
          toast({
            title: "Signed out",
            description: "You have been signed out successfully.",
          });
          navigate("/auth");
        } else if (event === "TOKEN_REFRESHED") {
          console.log("Token refreshed successfully");
        } else if (event === "USER_UPDATED" && session) {
          console.log("User updated:", session.user.email);
          toast({
            title: "Profile Updated",
            description: "Your profile has been updated successfully.",
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  return (
    <div className="min-h-screen pt-16 pb-12">
      <div className="max-w-md mx-auto bg-card rounded-lg shadow-sm p-8 mt-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-card-foreground">
          Welcome to RewardHub
        </h2>
        
        {/* Email verification notice */}
        <div className="mb-6 p-4 bg-muted rounded-md text-sm text-muted-foreground">
          <h3 className="font-medium mb-2">Important Notice:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>You will need to verify your email address after signing up</li>
            <li>Check your inbox for the verification link</li>
            <li>After verification, you can sign in to your account</li>
          </ul>
        </div>

        {/* Password requirements notice */}
        <div className="mb-6 p-4 bg-muted rounded-md text-sm text-muted-foreground">
          <h3 className="font-medium mb-2">Password Requirements:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Minimum 6 characters long</li>
            <li>Can contain letters, numbers, and special characters</li>
          </ul>
        </div>

        <SupabaseAuth
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
                  inputBackground: 'white',
                  inputBorder: '#E2E8F0',
                  inputBorderHover: '#2DD4BF',
                  inputBorderFocus: '#2DD4BF',
                  inputText: '#1E293B',
                  inputLabelText: '#64748B',
                  inputPlaceholder: '#94A3B8',
                }
              }
            },
            style: {
              button: {
                borderRadius: '0.5rem',
                height: '2.75rem',
                fontSize: '0.975rem',
              },
              input: {
                borderRadius: '0.5rem',
                height: '2.75rem',
                fontSize: '0.975rem',
              },
              message: {
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                padding: '1rem',
              },
            },
          }}
          providers={[]}
          localization={{
            variables: {
              sign_up: {
                email_label: 'Email address',
                password_label: 'Create a password',
                button_label: 'Create account',
              },
              sign_in: {
                email_label: 'Email address',
                password_label: 'Your password',
                button_label: 'Sign in',
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default Auth;