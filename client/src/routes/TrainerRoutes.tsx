import { TrainerAuth } from "@/pages/trainer/trainerAuth";
import { TrainerLayout } from "@/layouts/TrainerLayout";
import { TrainerAuthRoute } from "@/utils/protected/ProtectedRoute";
import { NoTrainerAuthRoute } from "@/utils/protected/PublicRoute";
import { Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";

// Eager-loaded components (critical for initial render)
import TrainerLanding from "@/components/landing/TrainerLanding";
import DashboardTrainer from "@/pages/trainer/Dashboard";
import FallbackUI from "@/components/common/FallBackUi";

// Lazy-loaded components
const ForgotPassword = lazy(() => import("@/components/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("@/components/auth/ResetPassword"));
const NotFoundPage = lazy(() => import("@/components/common/NotFoundPage"));
const TrainerProfilePage = lazy(() => import("@/pages/trainer/ProfileManagement"));
const TrainerSlotPage = lazy(() => import("@/pages/Slot/CreateSlot"));
const ChatLayout = lazy(() => import("@/components/Chat/ChatLayout"));
const Bookslots = lazy(() => import("@/pages/trainer/SlotBook"));
const VideoCallPage = lazy(() => import("@/components/VideoCall/VideoCallPage"));
const Notifications = lazy(() => import("@/components/Notification/Notifications"));
const TrainerWallet = lazy(() => import("@/pages/trainer/Wallet/TrainerWallet"));
const SessionHistoryPage = lazy(() => import("@/components/common/SessionHistoryPage"));
const FullReview = lazy(() => import("@/pages/trainer/FullReview"));
const TrainerClientTabs = lazy(() => import("@/pages/trainer/ClientManagement"));
const ClientTabs = lazy(() => import("@/pages/trainer/ClientTabs"));

const TrainerRoutes = () => {
  return (
   <Suspense fallback={<FallbackUI />}>
      <Routes>
        {/* Trainer login route outside of protected layout */}
        <Route index element={<NoTrainerAuthRoute element={<TrainerAuth />} />} />
        {/* All protected trainer routes inside the layout */}
        <Route
          path="/"
          element={
            <TrainerAuthRoute
              allowedRoles={["trainer"]}
              element={<TrainerLayout />}
            />
          }
        >
          <Route
            path="trainerhome"
            element={
              <TrainerAuthRoute
                allowedRoles={["trainer"]}
                element={<TrainerLanding />}
              />
            }
          />
          <Route
            path="profile"
            element={
              <TrainerAuthRoute
                allowedRoles={["trainer"]}
                element={<TrainerProfilePage />}
              />
            }
          />
          <Route
            path="clientrequest"
            element={
              <TrainerAuthRoute
                allowedRoles={["trainer"]}
                element={<TrainerClientTabs />}
              />
            }
          />
          <Route
            path="slotadd"
            element={
              <TrainerAuthRoute
                allowedRoles={["trainer"]}
                element={<TrainerSlotPage />}
              />
            }
          />
          <Route
            path="chat"
            element={
              <TrainerAuthRoute
                allowedRoles={["trainer"]}
                element={<ChatLayout />}
              />
            }
          />
          <Route
            path="clientlist"
            element={
              <TrainerAuthRoute
                allowedRoles={["trainer"]}
                element={<ClientTabs />}
              />
            }
          />
          <Route
            path="bookslots"
            element={
              <TrainerAuthRoute
                allowedRoles={["trainer"]}
                element={<Bookslots />}
              />
            }
          />
          <Route
            path="video-call/:slotId"
            element={
              <TrainerAuthRoute
                allowedRoles={["trainer"]}
                element={
                  <VideoCallPage
                    userType="trainer"
                    // params={{ slotId: useParams().slotId ?? "" }}
                  />
                }
              />
            }
          />
          <Route
            path="notifications"
            element={
              <TrainerAuthRoute
                allowedRoles={["trainer"]}
                element={<Notifications />}
              />
            }
          />
          <Route
            path="earnings"
            element={
              <TrainerAuthRoute
                allowedRoles={["trainer"]}
                element={<TrainerWallet />}
              />
            }
          />
          <Route
            path="session-history"
            element={
              <TrainerAuthRoute
                allowedRoles={["trainer"]}
                element={<SessionHistoryPage />}
              />
            }
          />
          <Route
            path="trainerdashboard"
            element={
              <TrainerAuthRoute
                allowedRoles={["trainer"]}
                element={<DashboardTrainer />}
              />
            }
          />
          <Route
            path=":trainerId/reviews"
            element={
              <TrainerAuthRoute
                allowedRoles={["trainer"]}
                element={<FullReview />}
              />
            }
          />
          {/* Catch-all route for unmatched trainer sub-routes */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route
          path="forgot-password"
          element={
            <NoTrainerAuthRoute
              element={<ForgotPassword role="trainer" signInPath="/trainer" />}
            />
          }
        />
        <Route
          path="reset-password/:token"
          element={
            <NoTrainerAuthRoute
              element={<ResetPassword role="trainer" signInPath="/trainer" />}
            />
          }
        />
      </Routes>
    </Suspense>
  );
};

export default TrainerRoutes;