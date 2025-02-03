import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const authService = {
  signInWithEmail: async (email: string, password: string) => {
    console.log("Attempting sign in for:", email);
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  },

  signUpWithEmail: async (email: string, password: string, metadata?: any) => {
    console.log("Attempting sign up for:", email);
    const response = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    
    if (!response.error) {
      toast.success("Registration successful! Please check your email to verify your account.");
    }
    
    return response;
  },

  handleLogout: async () => {
    console.log("Attempting logout");
    return await supabase.auth.signOut();
  },

  getSession: async () => {
    console.log("Fetching initial session");
    return await supabase.auth.getSession();
  },
};