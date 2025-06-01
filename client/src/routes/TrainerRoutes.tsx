import { TrainerAuth } from "@/pages/trainer/trainerAuth";
import { TrainerLayout } from "@/layouts/TrainerLayout";
import { TrainerAuthRoute } from "@/utils/protected/ProtectedRoute";
import { NoTrainerAuthRoute } from "@/utils/protected/PublicRoute";
import { Route, Routes, useParams } from "react-router-dom";
import ForgotPassword from "@/components/auth/ForgotPassword";
import ResetPassword from "@/components/auth/ResetPassword";
import TrainerLanding from "@/components/landing/TrainerLanding";
import TrainerProfilePage from "@/pages/trainer/ProfileManagement";
import ClientRequestTable from "@/pages/trainer/ClientRequestManagement";
import TrainerSlotPage from "@/pages/Slot/CreateSlot";
import { ChatLayout } from "@/components/Chat/ChatLayout";
import MyClients from "@/pages/trainer/MyClients";
import Bookslots from "@/pages/trainer/SlotBook";
import VideoCallPage from "@/components/VideoCall/VideoCallPage";
import Notifications from "@/components/Notification/Notifications";
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
          path="/trainerhome"
          element={
            <TrainerAuthRoute
              allowedRoles={["trainer"]}
              element={<TrainerLanding />}
            />
          }
        />
        <Route
          path="/profile"
          element={
            <TrainerAuthRoute
              allowedRoles={["trainer"]}
              element={<TrainerProfilePage />}
            />
          }
        />
        {/* <Route path="profileform" element={<TrainerPostRegistrationForm />} /> */}
        <Route
          path="/clientrequest"
          element={
            <TrainerAuthRoute
              allowedRoles={["trainer"]}
              element={<ClientRequestTable />}
            />
          }
        />

        <Route
          path="/slotadd"
          element={
            <TrainerAuthRoute
              allowedRoles={["trainer"]}
              element={<TrainerSlotPage />}
            />
          }
        />
        <Route
          path="/chat"
          element={
            <TrainerAuthRoute
              allowedRoles={["trainer"]}
              element={<ChatLayout />}
            />
          }
        />

        <Route
          path="/clientlist"
          element={
            <TrainerAuthRoute
              allowedRoles={["trainer"]}
              element={<MyClients />}
            />
          }
        />

        <Route
          path="/bookslots"
          element={
            <TrainerAuthRoute
              allowedRoles={["trainer"]}
              element={<Bookslots />}
            />
          }
        />

        <Route
          path="/video-call/:slotId"
          element={
            <TrainerAuthRoute
              allowedRoles={["trainer"]}
              element={
                <VideoCallPage
                  userType="trainer"
                  params={{ slotId: useParams().slotId ?? "" }}
                />
              }
            />
          }
        />

        <Route
          path="/notifications"
          element={
            <TrainerAuthRoute
              allowedRoles={["trainer"]}
              element={<Notifications />}
            />
          }
        />
        {/* Add more admin routes here as needed */}
      </Route>

      <Route
        path="/forgot-password"
        element={
          <NoTrainerAuthRoute
            element={<ForgotPassword role="trainer" signInPath="/trainer" />}
          />
        }
      />
      <Route
        path="/reset-password/:token"
        element={
          <NoTrainerAuthRoute
            element={<ResetPassword role="trainer" signInPath="/trainer" />}
          />
        }
      />
    </Routes>
  );
};
