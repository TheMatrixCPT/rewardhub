import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useAdminStatus = (userId: string | undefined) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const checkAdminStatus = async (uid: string) => {
    try {
      console.log("Starting admin status check for user:", uid);
      setIsChecking(true);
      
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", uid)
        .single();

      if (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
        return false;
      }
      
      console.log("Admin check completed. Result:", data);
      const adminStatus = data?.role === "admin";
      setIsAdmin(adminStatus);
      return adminStatus;
    } catch (error) {
      console.error("Unexpected error checking admin status:", error);
      setIsAdmin(false);
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (userId) {
      checkAdminStatus(userId);
    }
  }, [userId]);

  return { isAdmin, isChecking, checkAdminStatus };
};