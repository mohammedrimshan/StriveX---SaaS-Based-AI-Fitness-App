import { Route, Routes } from "react-router-dom";
import { ClientAuth } from "@/pages/client/clientAuth";
import { ClientLayout } from "@/layouts/ClientLayout";
import { AuthRoute } from "@/utils/protected/ProtectedRoute";
import { NoAuthRoute } from "@/utils/protected/PublicRoute";
import { lazy, Suspense } from "react";

// Eager-loaded components (critical for initial render)
import LandingPage from "@/components/landing/Landing";
import FallbackUI from "@/components/common/FallBackUi";

// Lazy-loaded components
const ForgotPassword = lazy(() => import("@/components/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("@/components/auth/ResetPassword"));
const NotFoundPage = lazy(() => import("@/components/common/NotFoundPage"));
const ProfileForm = lazy(() => import("@/pages/client/ProfileForm"));
const PlanGenerator = lazy(() => import("@/pages/client/GenerateAi"));
const TrainersPage = lazy(() => import("@/pages/client/TrainerList"));
const Index = lazy(() => import("@/pages/client/TrainerProfilePage"));
const UserWorkout = lazy(() => import("@/pages/client/UserWorkouts"));
const WorkoutDetails = lazy(() => import("@/pages/client/Workouts/WorkoutDetails"));
const PremiumLanding = lazy(() => import("@/components/landing/PremiumLanding"));
const PaymentSuccessPage = lazy(() => import("@/components/Payment/Success"));
const PaymentFailedPage = lazy(() => import("@/components/Payment/Fail"));
const TrainerSelectionPromptPage = lazy(() => import("@/pages/client/TrainerSelectionPromptPage"));
const TrainerPreferencesPage = lazy(() => import("@/pages/client/TrainerPreference"));
const MatchedTrainersPage = lazy(() => import("@/pages/client/MatchedTrainersList"));
const ManualTrainersListing = lazy(() => import("@/pages/client/ManualTrainer"));
const BookingPage = lazy(() => import("@/pages/client/BookingPage"));
const ChatLayout = lazy(() => import("@/components/Chat/ChatLayout"));
const CommunityForum = lazy(() => import("@/pages/client/Community"));
const WorkoutProgressDashboard = lazy(() => import("@/pages/client/WorkoutProgressChart"));
const Notifications = lazy(() => import("@/components/Notification/Notifications"));
const VideoCallPage = lazy(() => import("@/components/VideoCall/VideoCallPage"));
const UserDashBoard = lazy(() => import("@/pages/client/DashBoard"));
const SessionHistoryPage = lazy(() => import("@/components/common/SessionHistoryPage"));
const TrainerManagement = lazy(() => import("@/pages/client/TrainerManagement"));
const ClientWallet = lazy(() => import("@/pages/client/ClientWallet"));

const ClientRoutes = () => {
  return (
    <Suspense fallback={<FallbackUI />}>
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
              <AuthRoute allowedRoles={["client"]} element={<CommunityForum />} />
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
                    // params={{ slotId: useParams().slotId ?? "" }}
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
          <Route
            path="/session-history"
            element={
              <AuthRoute
                allowedRoles={["client"]}
                element={<SessionHistoryPage />}
              />
            }
          />
          <Route
            path="/trainermanagement"
            element={
              <AuthRoute
                allowedRoles={["client"]}
                element={<TrainerManagement />}
              />
            }
          />
          <Route
            path="/wallet"
            element={
              <AuthRoute
                allowedRoles={["client"]}
                element={<ClientWallet />}
              />
            }
          />
          {/* Catch-all route for unmatched client sub-routes */}
          <Route path="*" element={<NotFoundPage />} />
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
    </Suspense>
  );
};

export default ClientRoutes;