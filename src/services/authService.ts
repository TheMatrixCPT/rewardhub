import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const authService = {
  signInWithEmail: async (email: string, password: string) => {
    console.log("Attempting sign in for:", email);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  },

  signUpWithEmail: async (email: string, password: string, metadata?: any) => {
    console.log("Attempting sign up for:", email);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    if (error) throw error;
    toast.success("Registration successful! Please check your email to verify your account.");
  },

  handleLogout: async () => {
    console.log("Attempting logout");
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  getSession: async () => {
    console.log("Fetching initial session");
    return await supabase.auth.getSession();
  },
};