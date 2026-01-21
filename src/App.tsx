import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { TaskProvider } from "@/contexts/TaskContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import TaskEntry from "./pages/TaskEntry";
import NotFound from "./pages/NotFound";
import SupervisorStats from "./pages/SupervisorStats";
import SupervisorDetail from "./pages/SupervisorDetail";
import { PageLoader } from "@/components/LoadingSpinner";


const queryClient = new QueryClient();

const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }


  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }



  // If admin-only route and user is not admin, redirect to supervisor stats
  if (adminOnly && !isAdmin) {
    return <Navigate to="/my-stats" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TaskProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute adminOnly>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/task-entry"
                  element={
                    <ProtectedRoute adminOnly>
                      <TaskEntry />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-stats"
                  element={
                    <ProtectedRoute>
                      <SupervisorStats />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/supervisor/:id"
                  element={
                    <ProtectedRoute adminOnly>
                      <SupervisorDetail />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </TaskProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
