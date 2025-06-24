import { AdminAuth } from "@/pages/admin/AdminAuth";
import { AdminLayout } from "@/layouts/AdminLayout";
import { AdminAuthRoute } from "@/utils/protected/ProtectedRoute";
import { NoAdminAuthRoute } from "@/utils/protected/PublicRoute";
import { Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";

// Non-lazy-loaded components (critical for initial render)
import AdminDashboard from "@/pages/admin/AdminDashboard";
import UserManagement from "@/pages/admin/AdminUserManagement";
import Categories from "@/pages/admin/Categories";
import AdminWorkoutsPage from "@/pages/admin/Workout";
import WorkoutsListPage from "@/pages/admin/WorkoutList/WorkoutsListPage";
import MembershipPlans from "@/pages/admin/AddMembership/MembershipPlans";
import FallbackUI from "@/components/common/FallBackUi";

// Lazy-loaded components
const ForgotPassword = lazy(() => import("@/components/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("@/components/auth/ResetPassword"));
const NotFoundPage = lazy(() => import("@/components/common/NotFoundPage"));
const TransactionHistory = lazy(() => import("@/pages/admin/TransactionHistory"));
const SessionHistoryPage = lazy(() => import("@/components/common/SessionHistoryPage"));
const TrainerVerificationPage = lazy(() => import("@/pages/admin/TrainerVerification"));
const WorkoutDetailPage = lazy(() => import("@/pages/admin/WorkoutList/WorkoutDetailPage"));
const WorkoutFormPage = lazy(() => import("@/pages/admin/WorkoutList/WorkoutFormPage"));
const SubscriptionDashboard = lazy(() => import("@/pages/admin/SubscriptionDashboard"));
const Notifications = lazy(() => import("@/components/Notification/Notifications"));
const AdminDashboardTabs = lazy(() => import("@/pages/admin/AdminBackupClients"));

const AdminRoutes = () => {
  return (
  <Suspense fallback={<FallbackUI />}>
      <Routes>
        {/* Admin login route outside of protected layout */}
        <Route index element={<NoAdminAuthRoute element={<AdminAuth />} />} />
        {/* All protected admin routes inside the layout */}
        <Route
          path="/"
          element={
            <AdminAuthRoute allowedRoles={["admin"]} element={<AdminLayout />} />
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="clients" element={<UserManagement userType="client" />} />
          <Route
            path="trainers"
            element={<UserManagement userType="trainer" />}
          />
          <Route path="trainerverification" element={<TrainerVerificationPage />} />
          <Route path="category" element={<Categories />} />
          <Route path="workout" element={<AdminWorkoutsPage />} />
          <Route path="membership" element={<MembershipPlans />} />
          <Route path="workouts" element={<WorkoutsListPage />} />
          <Route path="workouts/:id" element={<WorkoutDetailPage />} />
          <Route path="workouts/new" element={<WorkoutFormPage />} />
          <Route path="workouts/edit/:id" element={<WorkoutFormPage />} />
          <Route path="transaction" element={<TransactionHistory />} />
          <Route path="session-history" element={<SessionHistoryPage />} />
          <Route path="subscriptions" element={<SubscriptionDashboard />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="backupclients" element={<AdminDashboardTabs />} />
          {/* Catch-all route for unmatched admin sub-routes */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route
          path="/forgot-password"
          element={
            <NoAdminAuthRoute
              element={<ForgotPassword role="admin" signInPath="/admin" />}
            />
          }
        />
        <Route
          path="/reset-password/:token"
          element={
            <NoAdminAuthRoute
              element={<ResetPassword role="admin" signInPath="/admin" />}
            />
          }
        />
      </Routes>
    </Suspense>
  );
};

export default AdminRoutes;