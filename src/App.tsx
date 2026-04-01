import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppHeader } from "@/components/AppHeader";
import PWAProvider from "@/components/PWAProvider";
import { pushNotifications } from "@/lib/pushNotifications";
import AuthPage from "@/pages/AuthPage";
import RoleSelect from "@/pages/RoleSelect";
import OrganizerDashboard from "@/pages/OrganizerDashboard";
import VolunteerDashboard from "@/pages/VolunteerDashboard";
import VolunteerProfile from "@/pages/VolunteerProfile";
import NotFound from "./pages/NotFound.tsx";
import DemoShowcase from "@/components/DemoShowcase";
import React from "react";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function AppRoutes() {
  const { role, user, loading } = useAuth();

  React.useEffect(() => {
    pushNotifications.initialize();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated — show auth page
  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<AuthPage />} />
      </Routes>
    );
  }

  // Authenticated but no role selected
  if (!role) {
    return (
      <Routes>
        <Route path="*" element={<RoleSelect />} />
      </Routes>
    );
  }

  return (
    <>
      <AppHeader />
      <Routes>
        <Route path="/organizer" element={role === 'organizer' ? <OrganizerDashboard /> : <Navigate to={`/${role}`} />} />
        <Route path="/volunteer" element={role === 'volunteer' ? <VolunteerDashboard /> : <Navigate to={`/${role}`} />} />
        <Route path="/volunteer/profile" element={role === 'volunteer' ? <VolunteerProfile /> : <Navigate to={`/${role}`} />} />
        <Route path="/demo" element={<DemoShowcase />} />
        <Route path="/" element={<Navigate to={`/${role}`} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <PWAProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </PWAProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
