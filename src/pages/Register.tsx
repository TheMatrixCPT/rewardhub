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
                  inputText: '#222222',
                  inputLabelText: '#64748B',
                  inputPlaceholder: '#C8C8C9',
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
          view="sign_up"
          magicLink={false}
          showLinks={false}
          localization={{
            variables: {
              sign_up: {
                email_label: "Email",
                password_label: "Password",
                button_label: "Sign up",
              }
            }
          }}
          additionalData={{
            first_name: undefined,
            last_name: undefined,
            phone_number: undefined,
            date_of_birth: undefined,
            gender: undefined,
          }}
          extendedSignUp={{
            fields: [
              {
                name: 'first_name',
                type: 'text',
                label: 'First Name',
                required: true,
              },
              {
                name: 'last_name',
                type: 'text',
                label: 'Last Name',
                required: true,
              },
              {
                name: 'phone_number',
                type: 'tel',
                label: 'Phone Number',
                required: true,
              },
              {
                name: 'date_of_birth',
                type: 'date',
                label: 'Date of Birth',
                required: true,
              },
              {
                name: 'gender',
                type: 'select',
                label: 'Gender',
                required: true,
                options: [
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' },
                  { value: 'prefer_not_to_say', label: 'Prefer not to say' }
                ],
              }
            ]
          }}
        />
      </div>
    </div>
  );
};

export default Register;