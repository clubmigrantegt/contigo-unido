import { Navigate, RouteObject } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import Splash from "@/pages/Splash";
import Onboarding from "@/pages/onboarding/Onboarding";
import Welcome from "@/pages/auth/Welcome";
import Auth from "@/pages/auth/Auth";
import Home from "@/pages/Home";
import Chat from "@/pages/Chat";
import LegalInfo from "@/pages/services/LegalInfo";
import LegalConsultation from "@/pages/services/LegalConsultation";
import Resources from "@/pages/services/Resources";
import ResourceDetail from "@/pages/services/ResourceDetail";
import Appointments from "@/pages/services/Appointments";
import Community from "@/pages/Community";
import NewPost from "@/pages/community/NewPost";
import CategoryView from "@/pages/community/CategoryView";
import PostDetail from "@/pages/community/PostDetail";
import WriteComment from "@/pages/community/WriteComment";
import Profile from "@/pages/Profile";
import Notifications from "@/pages/Notifications";
import DesignSystem from "@/pages/DesignSystem";
import NotFound from "@/pages/NotFound";
import BreathingTool from "@/pages/wellness/BreathingTool";
import GratitudeJournal from "@/pages/wellness/GratitudeJournal";
import GratitudeHistory from "@/pages/wellness/GratitudeHistory";
import GratitudeDetail from "@/pages/wellness/GratitudeDetail";
import CrisisHelp from "@/pages/wellness/CrisisHelp";
import { useAuth } from "@/components/auth/AuthContext";

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

export const routes: RouteObject[] = [
    {
        path: "/",
        element: <Navigate to="/splash" replace />,
    },
    {
        path: "/splash",
        element: <Splash />,
    },
    {
        path: "/onboarding",
        element: <Onboarding />,
    },
    {
        path: "/welcome",
        element: <Welcome />,
    },
    {
        path: "/auth",
        element: <Auth />,
    },
    {
        path: "/",
        element: (
            <ProtectedRoute>
                <AppLayout />
            </ProtectedRoute>
        ),
        children: [
            { path: "home", element: <Home /> },
            { path: "chat", element: <Chat /> },
            { path: "services/legal", element: <LegalInfo /> },
            // { path: "services/legal/consultation", element: <LegalConsultation /> }, // Feature deactivated for now
            { path: "services/legal/:id", element: <ResourceDetail /> },
            { path: "services/resources", element: <Resources /> },
            { path: "services/resources/:id", element: <ResourceDetail /> },
            // { path: "services/appointments", element: <Appointments /> }, // Feature deactivated for now
            { path: "community", element: <Community /> },
            { path: "community/new", element: <NewPost /> },
            { path: "community/category/:categoryId", element: <CategoryView /> },
            { path: "community/post/:postId", element: <PostDetail /> },
            { path: "community/post/:postId/comment", element: <WriteComment /> },
            { path: "profile", element: <Profile /> },
            { path: "notifications", element: <Notifications /> },
            { path: "design-system", element: <DesignSystem /> },
        ],
    },
    {
        path: "/wellness",
        children: [
            {
                path: "breathing",
                element: (
                    <ProtectedRoute>
                        <BreathingTool />
                    </ProtectedRoute>
                ),
            },
            {
                path: "gratitude",
                element: (
                    <ProtectedRoute>
                        <GratitudeJournal />
                    </ProtectedRoute>
                ),
            },
            {
                path: "gratitude/history",
                element: (
                    <ProtectedRoute>
                        <GratitudeHistory />
                    </ProtectedRoute>
                ),
            },
            {
                path: "gratitude/:id",
                element: (
                    <ProtectedRoute>
                        <GratitudeDetail />
                    </ProtectedRoute>
                ),
            },
            {
                path: "crisis",
                element: (
                    <ProtectedRoute>
                        <CrisisHelp />
                    </ProtectedRoute>
                ),
            },
        ],
    },
    {
        path: "*",
        element: <NotFound />,
    },
];
