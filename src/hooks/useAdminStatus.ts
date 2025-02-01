import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useAdminStatus = (userId: string | undefined) => {
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdminStatus = async (uid: string) => {
    try {
      console.log("Checking admin status for user:", uid);
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", uid)
        .single();

      if (error) throw error;
      
      console.log("Admin check result:", data);
      setIsAdmin(data.role === "admin");
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
    }
  };

  return { isAdmin, checkAdminStatus };
};