import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const NotFound = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-semibold text-foreground">Page Not Found</h2>
          <p className="text-muted-foreground max-w-md">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <div className="flex justify-center gap-4">
          <Link to={user ? "/" : "/login"}>
            <Button>
              Return to {user ? "Home" : "Login"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;