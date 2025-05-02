import { TrainerAuth } from "@/pages/trainer/trainerAuth";
import { TrainerLayout } from "@/layouts/TrainerLayout";
import { TrainerAuthRoute } from "@/utils/protected/ProtectedRoute";
import { NoTrainerAuthRoute } from "@/utils/protected/PublicRoute";
import { Route, Routes } from "react-router-dom";
import ForgotPassword from "@/components/auth/ForgotPassword";
import ResetPassword from "@/components/auth/ResetPassword";
import TrainerLanding from "@/components/landing/TrainerLanding";
import TrainerProfilePage from "@/pages/trainer/ProfileManagement";
import ClientRequestTable from "@/pages/trainer/ClientRequestManagement";
import TrainerSlotPage from "@/pages/Slot/CreateSlot";
import { ChatLayout } from "@/components/Chat/ChatLayout";
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
        <Route path="/profile" element={
                  <TrainerAuthRoute allowedRoles={["trainer"]} element={<TrainerProfilePage />} />
                } />
        {/* <Route path="profileform" element={<TrainerPostRegistrationForm />} /> */}
        <Route path="/clientrequest" element={
                  <TrainerAuthRoute allowedRoles={["trainer"]} element={<ClientRequestTable />} />
                } />


        
          <Route path="/slotadd" element={
                  <TrainerAuthRoute allowedRoles={["trainer"]} element={<TrainerSlotPage />} />
                } />
          <Route path="/chat" element={
                  <TrainerAuthRoute allowedRoles={["trainer"]} element={<ChatLayout />} />
                } />
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
