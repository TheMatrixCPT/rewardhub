import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import RegisterForm from "@/components/auth/RegisterForm";

const Register = () => {
  console.log("Register component rendered");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    console.log("Register useEffect - Checking auth state");
    if (user) {
      console.log("User already authenticated, redirecting to home");
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-xl shadow-sm">
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-bold text-foreground">Create an account</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign up to get started
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
};

export default Register;