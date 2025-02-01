import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { RegisterForm } from "@/components/register/RegisterForm";
import type { RegisterFormData } from "@/components/register/types";

const Register = () => {
  console.log("Register component rendered");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    console.log("Register useEffect - Checking auth state");
    if (user) {
      console.log("User already authenticated, redirecting to home");
      navigate("/");
    }
  }, [user, navigate]);

  const handleAuthError = (error: any) => {
    console.error("Registration error:", error);
    
    if (error.message.includes("Email already registered")) {
      setErrorMessage("This email address is already registered. Please sign in or use a different email.");
    } else if (error.message.includes("Password should be")) {
      setErrorMessage("Please choose a password that is at least 6 characters long.");
    } else if (error.message.includes("Invalid email")) {
      setErrorMessage("Please enter a valid email address (e.g., name@example.com).");
    } else if (error.message.includes("Missing data")) {
      setErrorMessage("Please fill in all required fields to complete your registration.");
    } else if (error.message.includes("Too many requests")) {
      setErrorMessage("Too many registration attempts. Please try again in a few minutes.");
    } else {
      setErrorMessage("An error occurred during registration. Please try again or contact support.");
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    console.log("Register form submitted", data);
    try {
      setIsLoading(true);
      setErrorMessage("");

      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.first_name,
            last_name: data.last_name,
            phone_number: data.phone_number,
            address: data.address,
            date_of_birth: data.date_of_birth,
            gender: data.gender,
            referral_source: data.referral_source,
          },
        },
      });

      if (error) {
        handleAuthError(error);
        return;
      }

      console.log("Registration successful");
      toast.success("Registration successful! Please check your email to verify your account.");
      navigate("/login");
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-xl shadow-sm">
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-bold text-foreground">Create an account</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign up to get started
          </p>
        </div>

        {errorMessage && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
            {errorMessage}
          </div>
        )}

        <RegisterForm onSubmit={onSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default Register;