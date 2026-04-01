import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppHeader } from "@/components/AppHeader";
import PWAProvider from "@/components/PWAProvider";
import { pushNotifications } from "@/lib/pushNotifications";
import "@/lib/videoDemoData"; // Импортируем демо-данные для видео
import RoleSelect from "@/pages/RoleSelect";
import OrganizerDashboard from "@/pages/OrganizerDashboard";
import VolunteerProfile from "@/pages/VolunteerProfile";
import DemoDataManager from "@/components/DemoDataManager";
import NotFound from "./pages/NotFound.tsx";
import React from "react";

const queryClient = new QueryClient();

function AppRoutes() {
  const { role } = useAuth();

  React.useEffect(() => {
    pushNotifications.initialize();
  }, []);

  // No role selected - show role selection
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
        <Route path="/volunteer" element={role === 'volunteer' ? <VolunteerProfile /> : <Navigate to={`/${role}`} />} />
        <Route path="/volunteer/profile" element={role === 'volunteer' ? <VolunteerProfile /> : <Navigate to={`/${role}`} />} />
        <Route path="/demo" element={<DemoDataManager />} />
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
