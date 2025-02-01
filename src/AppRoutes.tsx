import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminRoute from "@/components/auth/AdminRoute";
import Navbar from "@/components/layout/Navbar";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import Activities from "@/pages/Activities";
import Prizes from "@/pages/Prizes";
import UserPrizes from "@/pages/UserPrizes";
import Leaderboard from "@/pages/Leaderboard";
import Login from "@/pages/Login";
import Register from "@/pages/Register";

const AppRoutes = () => {
  const { isLoading } = useAuth();
  console.log("AppRoutes rendered, isLoading:", isLoading);

  if (isLoading) {
    console.log("Auth is loading, showing loading state");
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route
          path="/"
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

        {/* Catch all route - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default AppRoutes;