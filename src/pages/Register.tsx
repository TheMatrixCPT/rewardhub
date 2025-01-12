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
          options={{
            emailRedirectTo: window.location.origin,
            data: {
              first_name: '',
              last_name: '',
              phone_number: '',
              date_of_birth: '',
              gender: '',
            },
            additionalFields: [
              {
                key: 'first_name',
                label: 'First Name',
                type: 'text',
                required: true,
              },
              {
                key: 'last_name',
                label: 'Last Name',
                type: 'text',
                required: true,
              },
              {
                key: 'phone_number',
                label: 'Phone Number',
                type: 'tel',
                required: true,
              },
              {
                key: 'date_of_birth',
                label: 'Date of Birth',
                type: 'date',
                required: true,
              },
              {
                key: 'gender',
                label: 'Gender',
                type: 'select',
                options: [
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' },
                  { value: 'prefer_not_to_say', label: 'Prefer not to say' }
                ],
                required: true,
              }
            ],
          }}
        />
      </div>
    </div>
  );
};

export default Register;