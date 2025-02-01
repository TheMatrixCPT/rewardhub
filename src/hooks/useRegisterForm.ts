import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RegisterFormData } from "@/types/auth";

export const useRegisterForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormData>({
    defaultValues: {
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      phone_number: "",
      address: "",
      date_of_birth: "",
      gender: "",
      referral_source: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    console.log("Register form submitted", data);
    try {
      setIsLoading(true);
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
        console.error("Registration error:", error);
        throw error;
      }

      console.log("Registration successful");
      toast.success("Registration successful! Please check your email to verify your account.");
      navigate("/login");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "An error occurred during registration");
    } finally {
      setIsLoading(false);
    }
  };

  return { form, isLoading, onSubmit };
};