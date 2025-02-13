
import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { AuthProvider } from "@/hooks/useAuth";
import AppRoutes from "./AppRoutes";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Router>
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              <Toaster position="top-center" />
              <AppRoutes />
            </div>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
