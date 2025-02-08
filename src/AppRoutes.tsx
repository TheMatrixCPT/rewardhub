
import { Routes, Route } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminRoute from "@/components/auth/AdminRoute";
import Navbar from "@/components/layout/Navbar";
import Index from "@/pages/Index";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import Activities from "@/pages/Activities";
import Prizes from "@/pages/Prizes";
import UserPrizes from "@/pages/UserPrizes";
import Leaderboard from "@/pages/Leaderboard";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NotFound from "@/pages/NotFound";
import { Suspense } from "react";

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      <p className="text-muted-foreground">Loading application...</p>
    </div>
  </div>
);

const AppRoutes = () => {
  const { isLoading, isInitialized } = useAuth();
  console.log("AppRoutes rendered, isLoading:", isLoading, "isInitialized:", isInitialized);

  // Show loading spinner while auth is initializing
  if (!isInitialized) {
    console.log("Auth not initialized, showing loading state");
    return <LoadingSpinner />;
  }

  // Show loading spinner while checking auth state
  if (isLoading) {
    console.log("Auth is loading, showing loading state");
    return <LoadingSpinner />;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/activities"
          element={
            <ProtectedRoute>
              <Activities />
            </ProtectedRoute>
          }
        />
        <Route
          path="/prizes"
          element={
            <ProtectedRoute>
              <UserPrizes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/prizes"
          element={
            <AdminRoute>
              <Prizes />
            </AdminRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          }
        />

        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
