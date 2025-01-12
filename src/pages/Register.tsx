import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";

const Register = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1F0FB] px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm">
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-bold text-[#222222]">Create an account</h2>
          <p className="mt-2 text-sm text-[#8E9196]">
            Sign up to get started
          </p>
        </div>

        <Auth
          supabaseClient={supabase}
          appearance={{ 
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#9b87f5',
                  brandAccent: '#D6BCFA',
                  brandButtonText: 'white',
                  defaultButtonBackground: '#F1F0FB',
                  defaultButtonBackgroundHover: '#E5DEFF',
                  defaultButtonBorder: '#D6BCFA',
                  defaultButtonText: '#8E9196',
                  dividerBackground: '#C8C8C9',
                  inputBackground: 'white',
                  inputBorder: '#C8C8C9',
                  inputBorderHover: '#9b87f5',
                  inputBorderFocus: '#9b87f5',
                  inputText: '#222222',
                  inputLabelText: '#8E9196',
                  inputPlaceholder: '#C8C8C9',
                },
                borderWidths: {
                  buttonBorderWidth: '1px',
                  inputBorderWidth: '1px',
                },
                borderStyles: {
                  buttonBorderStyle: 'solid',
                  inputBorderStyle: 'solid',
                },
                radii: {
                  borderRadiusButton: '8px',
                  buttonBorderRadius: '8px',
                  inputBorderRadius: '8px',
                },
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
          view="sign_up"
        />
      </div>
    </div>
  );
};

export default Register;