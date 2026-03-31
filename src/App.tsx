import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppHeader } from "@/components/AppHeader";
import RoleSelect from "@/pages/RoleSelect";
import OrganizerDashboard from "@/pages/OrganizerDashboard";
import VolunteerDashboard from "@/pages/VolunteerDashboard";
import VolunteerProfile from "@/pages/VolunteerProfile";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

function AppRoutes() {
  const { role } = useAuth();

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
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
