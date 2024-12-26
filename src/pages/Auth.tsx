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
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          navigate("/dashboard");
        } else if (event === "SIGNED_UP" && session) {
          toast({
            title: "Welcome to RewardHub!",
            description: "Your account has been created successfully.",
          });
          navigate("/dashboard");
        } else if (event === "USER_DELETED") {
          toast({
            title: "Account Deleted",
            description: "Your account has been deleted successfully.",
            variant: "destructive",
          });
          navigate("/auth");
        } else if (event === "PASSWORD_RECOVERY") {
          toast({
            title: "Password Reset Email Sent",
            description: "Check your email for the password reset link.",
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
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm p-8 mt-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">
          Welcome to RewardHub
        </h2>
        
        {/* Password requirements notice */}
        <div className="mb-6 p-4 bg-gray-50 rounded-md text-sm text-gray-600">
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
                  brand: 'rgb(20 184 166)',
                  brandAccent: 'rgb(13 148 136)',
                }
              }
            },
            // Enhance the styling of the auth component
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