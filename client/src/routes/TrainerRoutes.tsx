import { TrainerAuth } from "@/pages/trainer/trainerAuth";
import { TrainerLayout } from "@/layouts/TrainerLayout";
import { TrainerAuthRoute } from "@/utils/protected/ProtectedRoute";
import { NoTrainerAuthRoute } from "@/utils/protected/PublicRoute";
import { Route, Routes } from "react-router-dom";
import ForgotPassword from "@/components/auth/ForgotPassword";
import ResetPassword from "@/components/auth/ResetPassword";
import TrainerLanding from "@/components/landing/TrainerLanding";
import TrainerProfilePage from "@/pages/trainer/ProfileManagement";
import TrainerSlotPage from "@/pages/Slot/CreateSlot";
import { ChatLayout } from "@/components/Chat/ChatLayout";
import Bookslots from "@/pages/trainer/SlotBook";
import VideoCallPage from "@/components/VideoCall/VideoCallPage";
import Notifications from "@/components/Notification/Notifications";
import TrainerWallet from "@/pages/trainer/Wallet/TrainerWallet";
import SessionHistoryPage from "@/components/common/SessionHistoryPage";
import DashboardTrainer from "@/pages/trainer/Dashboard";
import FullReview from "@/pages/trainer/FullReview";
import NotFoundPage from "@/components/common/NotFoundPage";
import TrainerClientTabs from "@/pages/trainer/ClientManagement";
import ClientTabs from "@/pages/trainer/ClientTabs";

export const TrainerRoutes = () => {
  return (
    <Routes>
      {/* Admin login route outside of protected layout */}
      <Route index element={<NoTrainerAuthRoute element={<TrainerAuth />} />} />
      {/* All protected admin routes inside the layout */}
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
  );
};