import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/components/auth/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import Onboarding from "./pages/onboarding/Onboarding";
import Welcome from "./pages/auth/Welcome";
import Auth from "./pages/auth/Auth";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import LegalInfo from "./pages/services/LegalInfo";
import ResourceDetail from "./pages/services/ResourceDetail";
import Community from "./pages/Community";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import BreathingTool from "./pages/wellness/BreathingTool";
import GratitudeJournal from "./pages/wellness/GratitudeJournal";
import CrisisHelp from "./pages/wellness/CrisisHelp";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/onboarding" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Navigate to="/onboarding" replace />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route path="home" element={<Home />} />
              <Route path="chat" element={<Chat />} />
              <Route path="services/legal" element={<LegalInfo />} />
              <Route path="services/legal/:id" element={<ResourceDetail />} />
              <Route path="resources/:id" element={<ResourceDetail />} />
              <Route path="community" element={<Community />} />
              <Route path="profile" element={<Profile />} />
              <Route path="notifications" element={<Notifications />} />
            </Route>

            {/* Wellness routes - fullscreen without AppLayout */}
            <Route path="/wellness/breathing" element={
              <ProtectedRoute>
                <BreathingTool />
              </ProtectedRoute>
            } />
            <Route path="/wellness/gratitude" element={
              <ProtectedRoute>
                <GratitudeJournal />
              </ProtectedRoute>
            } />
            <Route path="/wellness/crisis" element={
              <ProtectedRoute>
                <CrisisHelp />
              </ProtectedRoute>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
