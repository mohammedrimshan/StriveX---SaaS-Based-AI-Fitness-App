import { Route, Routes, useParams } from "react-router-dom";
import { ClientAuth } from "@/pages/client/clientAuth";
import { ClientLayout } from "@/layouts/ClientLayout";
import { AuthRoute } from "@/utils/protected/ProtectedRoute";
import { NoAuthRoute } from "@/utils/protected/PublicRoute";
import LandingPage from "@/components/landing/Landing";
import ForgotPassword from "@/components/auth/ForgotPassword";
import ResetPassword from "@/components/auth/ResetPassword";
import ProfileForm from "@/pages/client/ProfileForm";
import { PlanGenerator } from "@/pages/client/GenerateAi";
import TrainersPage from "@/pages/client/TrainerList";
import Index from "@/pages/client/TrainerProfilePage";
import UserWorkout from "@/pages/client/UserWorkouts";
import WorkoutDetails from "@/pages/client/Workouts/WorkoutDetails";
import PremiumLanding from "@/components/landing/PremiumLanding";
import { PaymentSuccessPage } from "@/components/Payment/Success";
import { PaymentFailedPage } from "@/components/Payment/Fail";
import { TrainerSelectionPromptPage } from "@/pages/client/TrainerSelectionPromptPage";
import { TrainerPreferencesPage } from "@/pages/client/TrainerPreference";
import { MatchedTrainersPage } from "@/pages/client/MatchedTrainersList";
import ManualTrainersListing from "@/pages/client/ManualTrainer";
import BookingPage from "@/pages/client/BookingPage";
import { ChatLayout } from "@/components/Chat/ChatLayout";
import Community from "@/components/Community/index.tsx";
import WorkoutProgressDashboard from "@/pages/client/WorkoutProgressChart";
import VideoCallPage from "@/components/VideoCall/VideoCallPage";
import Notifications from "@/components/Notification/Notifications";
import UserDashBoard from "@/pages/client/DashBoard";
export const ClientRoutes = () => {
  return (
    <Routes>
      <Route element={<ClientLayout />}>
        {/* Public routes inside the layout */}
        <Route index element={<LandingPage />} />
        <Route
          path="/login"
          element={<NoAuthRoute element={<ClientAuth />} />}
        />

        {/* Protected routes */}
        <Route
          path="/home"
          element={
            <AuthRoute allowedRoles={["client"]} element={<LandingPage />} />
          }
        />
        <Route
          path="/profile"
          element={
            <AuthRoute allowedRoles={["client"]} element={<ProfileForm />} />
          }
        />
        <Route
          path="/aiplanning"
          element={
            <AuthRoute allowedRoles={["client"]} element={<PlanGenerator />} />
          }
        />

        <Route
          path="/alltrainers"
          element={
            <AuthRoute allowedRoles={["client"]} element={<TrainersPage />} />
          }
        />
        <Route
          path="/trainerprofile/:trainerId"
          element={<AuthRoute allowedRoles={["client"]} element={<Index />} />}
        />

        <Route
          path="/workouts"
          element={
            <AuthRoute allowedRoles={["client"]} element={<UserWorkout />} />
          }
        />

        <Route
          path="/workout/:id"
          element={
            <AuthRoute allowedRoles={["client"]} element={<WorkoutDetails />} />
          }
        />

        <Route
          path="/premium"
          element={
            <AuthRoute allowedRoles={["client"]} element={<PremiumLanding />} />
          }
        />

        <Route
          path="/checkout/success"
          element={
            <AuthRoute
              allowedRoles={["client"]}
              element={<PaymentSuccessPage />}
            />
          }
        />

        <Route
          path="/checkout/cancel"
          element={
            <AuthRoute
              allowedRoles={["client"]}
              element={<PaymentFailedPage />}
            />
          }
        />

        <Route
          path="/trainer-selection-prompt"
          element={
            <AuthRoute
              allowedRoles={["client"]}
              element={<TrainerSelectionPromptPage />}
            />
          }
        />

        <Route
          path="/trainer-preferences"
          element={
            <AuthRoute
              allowedRoles={["client"]}
              element={<TrainerPreferencesPage />}
            />
          }
        />
        <Route
          path="/trainer-selection"
          element={
            <AuthRoute
              allowedRoles={["client"]}
              element={<MatchedTrainersPage />}
            />
          }
        />
        <Route
          path="/trainer-selection/manual"
          element={
            <AuthRoute
              allowedRoles={["client"]}
              element={<ManualTrainersListing />}
            />
          }
        />
        <Route
          path="/booking"
          element={
            <AuthRoute allowedRoles={["client"]} element={<BookingPage />} />
          }
        />

        <Route
          path="/chat"
          element={
            <AuthRoute allowedRoles={["client"]} element={<ChatLayout />} />
          }
        />

        <Route
          path="/community"
          element={
            <AuthRoute allowedRoles={["client"]} element={<Community />} />
          }
        />

        <Route
          path="/progress"
          element={
            <AuthRoute
              allowedRoles={["client"]}
              element={<WorkoutProgressDashboard />}
            />
          }
        />

        <Route
          path="/notifications"
          element={
            <AuthRoute allowedRoles={["client"]} element={<Notifications />} />
          }
        />

        <Route
          path="/video-call/:slotId"
          element={
            <AuthRoute
              allowedRoles={["client"]}
              element={
                <VideoCallPage
                  userType="client"
                  params={{ slotId: useParams().slotId ?? "" }}
                />
              }
            />
          }
        />

         <Route
          path="/dashboard"
          element={
            <AuthRoute allowedRoles={["client"]} element={<UserDashBoard />} />
          }
        />
        {/* Add morHae protected routes as needed */}
      </Route>
      <Route
        path="/forgot-password"
        element={
          <NoAuthRoute
            element={<ForgotPassword role="client" signInPath="/" />}
          />
        }
      />
      <Route
        path="/reset-password/:token"
        element={
          <NoAuthRoute
            element={<ResetPassword role="client" signInPath="/" />}
          />
        }
      />
    </Routes>
  );
};
