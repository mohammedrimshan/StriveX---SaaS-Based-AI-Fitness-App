"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TRAINER_REJECTION_MAIL_CONTENT = exports.TRAINER_ACCEPTANCE_MAIL_CONTENT = exports.RE_REGISTRATION_MAIL_CONTENT = exports.PASSWORD_RESET_MAIL_CONTENT = exports.REJECTION_MAIL_CONTENT = exports.APPROVAL_MAIL_CONTENT = exports.VERIFICATION_MAIL_CONTENT = exports.ERROR_MESSAGES = exports.SUCCESS_MESSAGES = exports.HTTP_STATUS = exports.TrainerSelectionStatus = exports.ACTIVITY_LEVELS = exports.SKILLS = exports.PaymentStatus = exports.EXPERIENCE_LEVELS = exports.FITNESS_GOALS = exports.WORKOUT_TYPES = exports.WalletTransactionType = exports.VideoCallStatus = exports.SlotStatus = exports.TrainerApprovalStatus = exports.TrainerChangeRequestStatus = exports.BackupInvitationStatus = exports.MessageStatus = exports.ROLES = void 0;
exports.ROLES = {
    ADMIN: "admin",
    USER: "client",
    TRAINER: "trainer",
};
var MessageStatus;
(function (MessageStatus) {
    MessageStatus["SENT"] = "sent";
    MessageStatus["DELIVERED"] = "delivered";
    MessageStatus["READ"] = "read";
})(MessageStatus || (exports.MessageStatus = MessageStatus = {}));
var BackupInvitationStatus;
(function (BackupInvitationStatus) {
    BackupInvitationStatus["PENDING"] = "PENDING";
    BackupInvitationStatus["ACCEPTED"] = "ACCEPTED";
    BackupInvitationStatus["REJECTED"] = "REJECTED";
    BackupInvitationStatus["AUTO_ASSIGNED"] = "AUTO_ASSIGNED";
})(BackupInvitationStatus || (exports.BackupInvitationStatus = BackupInvitationStatus = {}));
var TrainerChangeRequestStatus;
(function (TrainerChangeRequestStatus) {
    TrainerChangeRequestStatus["PENDING"] = "PENDING";
    TrainerChangeRequestStatus["APPROVED"] = "APPROVED";
    TrainerChangeRequestStatus["REJECTED"] = "REJECTED";
})(TrainerChangeRequestStatus || (exports.TrainerChangeRequestStatus = TrainerChangeRequestStatus = {}));
var TrainerApprovalStatus;
(function (TrainerApprovalStatus) {
    TrainerApprovalStatus["PENDING"] = "pending";
    TrainerApprovalStatus["APPROVED"] = "approved";
    TrainerApprovalStatus["REJECTED"] = "rejected";
})(TrainerApprovalStatus || (exports.TrainerApprovalStatus = TrainerApprovalStatus = {}));
var SlotStatus;
(function (SlotStatus) {
    SlotStatus["AVAILABLE"] = "available";
    SlotStatus["BOOKED"] = "booked";
    SlotStatus["CANCELLED"] = "cancelled";
})(SlotStatus || (exports.SlotStatus = SlotStatus = {}));
var VideoCallStatus;
(function (VideoCallStatus) {
    VideoCallStatus["NOT_STARTED"] = "not_started";
    VideoCallStatus["IN_PROGRESS"] = "in_progress";
    VideoCallStatus["ENDED"] = "ended";
})(VideoCallStatus || (exports.VideoCallStatus = VideoCallStatus = {}));
var WalletTransactionType;
(function (WalletTransactionType) {
    WalletTransactionType["REFUND"] = "REFUND";
    WalletTransactionType["DEPOSIT"] = "DEPOSIT";
    WalletTransactionType["WITHDRAWAL"] = "WITHDRAWAL";
})(WalletTransactionType || (exports.WalletTransactionType = WalletTransactionType = {}));
exports.WORKOUT_TYPES = [
    "Yoga",
    "Cardio",
    "WeightTraining",
    "Meditation",
    "Calisthenics",
    "Pilates",
    "General",
];
exports.FITNESS_GOALS = [
    "weightLoss",
    "muscleGain",
    "endurance",
    "flexibility",
    "maintenance",
];
exports.EXPERIENCE_LEVELS = [
    "beginner",
    "intermediate",
    "advanced",
    "expert",
];
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "pending";
    PaymentStatus["COMPLETED"] = "completed";
    PaymentStatus["FAILED"] = "failed";
    PaymentStatus["REFUNDED"] = "refunded";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
exports.SKILLS = [
    "strengthTraining",
    "mindfulnessFocus",
    "stressManagement",
    "coreStrengthening",
    "postureAlignment",
    "physiotherapy",
    "muscleBuilding",
    "flexibility",
    "nutrition",
    "weightLoss",
];
exports.ACTIVITY_LEVELS = [
    "sedentary",
    "light",
    "moderate",
    "active",
    "veryActive",
];
var TrainerSelectionStatus;
(function (TrainerSelectionStatus) {
    TrainerSelectionStatus["PENDING"] = "pending";
    TrainerSelectionStatus["ASSIGNED"] = "assigned";
    TrainerSelectionStatus["NOT_CONFIRMED"] = "not_confirmed";
    TrainerSelectionStatus["ACCEPTED"] = "accepted";
    TrainerSelectionStatus["REJECTED"] = "rejected";
})(TrainerSelectionStatus || (exports.TrainerSelectionStatus = TrainerSelectionStatus = {}));
exports.HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
};
exports.SUCCESS_MESSAGES = {
    REGISTRATION_SUCCESS: "Registration completed successfully",
    RE_REGISTRATION_SUCCESS: "Re -Registration completed successfully",
    LOGIN_SUCCESS: "Login successful",
    LOGOUT_SUCCESS: "Logged out successfully",
    PROFILE_UPDATE_SUCCESS: "Profile updated successfully",
    WORKOUT_GENERATED: "Workout plan generated successfully",
    DIET_GENERATED: "Diet plan generated successfully",
    PREMIUM_UPGRADE_SUCCESS: "Premium subscription activated successfully",
    SESSION_BOOKED: "Session booked successfully",
    SESSION_CANCELLED: "Session cancelled successfully",
    TASK_ASSIGNED: "Task assigned successfully",
    TASK_COMPLETED: "Task completed successfully",
    TRAINER_APPROVED: "Trainer approved successfully",
    OTP_SENT_SUCCESS: "OTP sent successfully",
    VERIFICATION_SUCCESS: "Verification completed successfully",
    DATA_RETRIEVED: "Data retrieved successfully",
    CREATED: "Created successfully",
    UPDATE_SUCCESS: "Updated successfully",
    DELETE_SUCCESS: "Deleted successfully",
    OPERATION_SUCCESS: "Operation completed successfully",
    ACTION_SUCCESS: "Action performed successfully",
    PASSWORD_RESET_SUCCESS: "Password reset successfully",
    PAYMENT_SUCCESS: "Payment processed successfully",
    REFUND_SUCCESS: "Refund processed successfully",
    EMAIL_SENT_SUCCESSFULLY: "Email sent successfully",
    NOTIFICATION_UPDATED: "Notification preferences updated successfully",
    WORKOUT_CREATED: "Workout created successfully",
    WORKOUT_UPDATED: "Workout updated successfully",
    WORKOUT_STATUS_UPDATED: "Workout status updated successfully",
    WORKOUT_DELETED: "Workout deleted successfully",
    PROGRESS_RECORDED: "Workout progress recorded successfully",
    TRAINER_SELECTION_SAVED: "Trainer selection preferences saved successfully",
    TRAINER_ASSIGNED: "Trainer assigned successfully",
    TRAINER_REQUEST_UPDATED: "Trainer request updated successfully",
    BACKUP_TRAINER_ASSIGNMENT_INITIATED: "Backup trainer assignment process initiated",
    BACKUP_INVITATION_UPDATED: "Backup invitation status updated",
    REQUEST_SUBMITTED: "Request submitted successfully",
    REQUEST_RESOLVED: "Request resolved successfully",
};
exports.ERROR_MESSAGES = {
    INVALID_ID: "Invalid ID provided",
    WRONG_ID: "Wrong ID",
    ID_REQUIRED: "ID required",
    ID_NOT_PROVIDED: "ID not provided",
    TOKEN_EXPIRED: "Token has expired",
    TOKEN_INVALID: "Invalid token",
    FORBIDDEN: "Access denied. You do not have permission to perform this action.",
    BLOCKED_ACCOUNT: "Your account has been blocked",
    INVALID_CREDENTIALS: "Invalid email or password",
    INVALID_ROLE: "Invalid user role",
    UNAUTHORIZED_ACCESS: "Unauthorized access.",
    NOT_ALLOWED: "You are not allowed",
    EMAIL_NOT_FOUND: "Email not found",
    EMAIL_EXISTS: "Email already exists",
    USER_NOT_FOUND: "User not found",
    TRAINER_NOT_FOUND: "Trainer not found",
    TRAINER_PENDING: "Trainer registration is pending approval",
    SESSION_NOT_FOUND: "Session not found",
    SLOT_UNAVAILABLE: "Selected slot is unavailable",
    NO_SLOTS_AVAILABLE: "No available slots found",
    INVALID_BOOKING_DATE: "The requested booking date is not available",
    INVALID_TIME_SLOT: "The requested time slot is not available",
    INVALID_TOKEN: "Invalid token",
    TIME_SLOT_FULL: "The requested time slot is already at full capacity",
    PREMIUM_REQUIRED: "This feature requires a premium subscription",
    NO_CHARGE_FOUND: "No charge found for this payment",
    CONFIRM_PAYMENT_FAILED: "Failed to confirm payment",
    FAILED_TO_PROCESS_REFUND: "Failed to process refund",
    WRONG_CURRENT_PASSWORD: "Current password is wrong",
    SAME_CURR_NEW_PASSWORD: "Please enter a different password from current",
    AI_GENERATION_FAILED: "Failed to generate workout/diet plan",
    INSUFFICIENT_DATA: "Insufficient data to generate plan",
    SERVER_ERROR: "An error occurred, please try again later",
    VALIDATION_ERROR: "Validation error occurred",
    MISSING_FIELDS: "Required fields are missing",
    MISSING_PARAMETERS: "Missing required parameters",
    ROUTE_NOT_FOUND: "Route not found",
    TOKEN_BLACKLISTED: "Token is Blacklisted",
    PLAN_NOT_FOUND: "Fitness plan not found",
    GOAL_NOT_FOUND: "Fitness goal not found",
    PAYMENT_FAILED: "Payment processing failed",
    SUBSCRIPTION_EXPIRED: "Your subscription has expired",
    TOO_MANY_REQUESTS: "Too many requests, please try again later",
    REQUEST_NOT_FOUND: "Request not found",
    ACCOUNT_DELETION_FAILED: "Failed to delete account",
    INVALID_FILE_FORMAT: "Invalid file format",
    FILE_SIZE_EXCEEDED: "File size exceeded maximum limit",
    UPLOAD_FAILED: "Failed to upload file",
    BLOCKED: "Your account has been blocked.",
    UPDATE_FAILED: "Updation Failed",
    CATEGORY_EXISTS: "Category Already Exists",
    CATEGORY_NOT_FOUND: "Category Not Found",
    CURRENT_PASSWORD: "Current Password Wrong",
    WORKOUT_NOT_FOUND: "Workout not found",
    INVALID_WORKOUT_DATA: "Invalid workout data provided",
    PROFILE_UPDATE_FAILED: "Failed to update user profile",
    INVALID_HEALTH_CONDITIONS: "healthConditions must be an array",
    INVALID_WORKOUT_TYPE: "Invalid workout type provided",
    INVALID_SKILL: "Invalid skill provided",
    INVALID_TIME_RANGE: "Invalid sleep time range",
    PREFERENCES_NOT_FOUND: "Trainer selection preferences not found",
    TRAINER_REQUEST_NOT_FOUND: "Trainer request not found",
    NO_MATCHING_TRAINERS: "No matching trainers found",
    TRAINER_NOT_IN_MATCHED_LIST: "Trainer is not in the matched list",
    TRAINER_NOT_APPROVED: "Trainer is not approved",
    FAILED_TO_UPDATE_SELECTION: "Failed to update trainer selection",
    WORKOUT_UPDATE_FAILED: "Update Workout Failed",
    EXERCISE_NOT_FOUND: "Exercise not found",
    EXERCISE_UPDATE_FAILED: "Failed to update exercise",
    WORKOUT_STATUS_UPDATE_FAILED: "Failed to toggle workout status",
    PROGRESS_RECORD_FAILED: "Failed to record progress",
    INVALID_PAGE_NUMBER: "Invalid page number",
    INVALID_LIMIT: "Invalid limit value",
    FETCH_WORKOUT_FAILED: "Failed to fetch workouts",
    FETCH_WORKOUT_BY_CATEGORY_FAILED: "Failed to fetch workouts by category",
    WORKOUT_ID_REQUIRED: "Workout ID is required",
    FAILED_TO_FETCH_WORKOUT: "Failed to fetch workout by ID",
    FAILED_TO_FETCH_PROGRESS: "Failed to fetch user progress",
    FAILED_TO_DELETE_WORKOUT: "Failed to delete workout",
    INVALID_INPUT: "Invalid input provided",
    FAILED_TO_DELETE_EXERCISE: "Failed to delete exercise",
    INVALID_VIDEO_COUNT: "Number of uploaded videos must match number of exercises",
    VIDEO_UPLOAD_FAILED: (index) => `Failed to upload video for exercise ${index}`,
    EXERCISE_MISSING_VIDEO_URL: (index) => `Exercise at index ${index} is missing a required video URL`,
    CREATE_WORKOUT_FAILED: "Failed to create workout",
    VIDEO_URL_REQUIRED: "Video URL is required",
    VIDEOS_UPLOAD_FAILED: "Failed to upload video",
    INVALID_SELECTION_MODE: "Selection mode must be auto for auto-matching",
    FAILED_TO_UPDATE_PREFERENCES: "Failed to update preferences",
    INCOMPLETE_CLIENT_PROFILE: "Client profile is incomplete. Please update fitness goal and activity level.",
    CANNOT_REASSIGN_TRAINER: "Cannot reassign trainer while current assignment is accepted",
    CANNOT_SEND_REQUEST_AGAIN: "Trainer request already pending. Cannot send request again.",
    FAILED_TO_UPDATE: "Failed to update preferences",
    INVALID_TRAINER_ROLE: "Account is not a trainer",
    STRIPE_ACCOUNT_EXISTS: "Stripe Connect account already exists",
    STRIPE_ACCOUNT_CREATION_FAILED: "Failed to create Stripe Connect account",
    TRAINER_NOT_ASSIGNED_TO_CLIENT: "Trainer is not assigned to this client",
    INVALID_TRAINER_EMAIL: "Invalid trainer email",
    INVALID_ACTION: "Invalid action",
    REQUEST_NOT_PENDING: "Client request is not in pending status",
    TRAINER_ALREADY_APPROVED_OR_REJECTED: "Trainer's application has already been processed.",
    INVALID_APPROVAL_STATUS: "Invalid approval status.",
    REJECTION_REASON_REQUIRED: "Please provide a reason for rejecting the trainer.",
    MEMBERSHIP_NOT_FOUND: "Membership plan not found",
    ALREADY_BOOKED_SESSION: "You already have a booked session. Only one session can be booked at a time.",
    SLOT_NOT_FOUND: "Slot not found",
    SLOT_NOT_AVAILABLE: "Slot is not available",
    INVALID_SLOT_DATE_TIME: "Invalid slot date or time",
    PAST_SLOT_BOOKING: "Cannot book past slot",
    FAILED_BOOKING_SLOT: "Failed to book slot",
    SLOT_NOT_FOUND_OR_NOT_BOOKED: "Slot not found or not booked by this client",
    CANNOT_CANCEL_WITHIN_30_MINUTES: "Cannot cancel within 30 minutes of slot start",
    FAILED_CANCEL_BOOKING: "Failed to cancel booking",
    INVALID_DATE_FORMAT: "Invalid date format",
    INVALID_TIME_FORMAT: (startTime, endTime) => `Invalid time format for slot (${startTime}–${endTime})`,
    START_TIME_BEFORE_END_TIME: (startTime, endTime) => `Start time (${startTime}) must be before end time (${endTime})`,
    SLOT_OVERLAPS: (startTime, endTime) => `Slot (${startTime}–${endTime}) overlaps with existing slot`,
    INVALID_CLIENT_ID: "Valid Client ID is required",
    NO_BOOKINGS_FOUND: "No bookings found for the provided client ID",
    TRAINER_AND_SLOT_ID_REQUIRED: "Trainer ID and Slot ID are required",
    UNAUTHORIZED_TOGGLE_SLOT: "Unauthorized: Only the trainer can toggle slot availability",
    BOOKED_SLOT_CANNOT_TOGGLE: "Cannot toggle availability of a booked slot",
    FAILED_TO_UPDATE_SLOT_AVAILABILITY: "Failed to update slot availability",
    INVITATION_NOT_FOUND: "Invitation not found",
    WALLET_NOT_FOUND: "Wallet not found for the given client",
};
const VERIFICATION_MAIL_CONTENT = (otp) => `
<div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; background-color: #faf8ff; border: 1px solid #e6e0fa; border-radius: 10px;">
<!-- Logo Text Section -->
<div style="text-align: center; margin-bottom: 30px;">
  <h1 style="font-size: 48px; font-weight: bold; margin: 0;">
    🏋️‍♀️ <span style="color: #6A36CD;">StriveX</span> 🏋️‍♂️
  </h1>
</div>

<h2 style="color: #8A2BE2; text-align: center; margin-bottom: 30px; font-weight: 600;">
  ✨ Welcome to Your Fitness Journey! 💪
</h2>

<p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px; color: #555;">
  Get ready to transform your life with personalized AI workouts and nutrition plans! 🌟 Our expert system is designed to help you reach your goals faster and smarter. 🚀
</p>

<div style="background: linear-gradient(135deg, #9370DB 0%, #6A36CD 100%); border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center; box-shadow: 0 4px 8px rgba(106, 54, 205, 0.2);">
  <p style="margin-bottom: 10px; font-size: 18px; color: white;">Your verification code is:</p>
  <h1 style="background-color: white; color: #6A36CD; font-size: 36px; margin: 15px 0; padding: 20px; border-radius: 8px; letter-spacing: 8px; font-weight: bold; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
    ${otp}
  </h1>
  <p style="color: #f0f0f0; font-size: 15px;">
    ⏱️ Code expires in 2 minutes
  </p>
</div>

<div style="background-color: white; border-left: 4px solid #8A2BE2; padding: 15px; margin: 20px 0; border-radius: 4px;">
  <p style="font-size: 15px; color: #555; margin: 0;">
    🔒 For your security, please don't share this code with anyone.
  </p>
</div>

<div style="margin-top: 25px; padding: 20px; background-color: white; border-radius: 8px; text-align: center;">
  <p style="font-size: 16px; color: #6A36CD; margin-bottom: 15px; font-weight: bold;">
    Ready to begin? Here's what's next:
  </p>
  <ul style="list-style: none; padding: 0; text-align: left; margin: 0 20px;">
    <li style="margin-bottom: 10px; padding-left: 25px; position: relative;">
      <span style="position: absolute; left: 0;">📱</span> Complete your profile
    </li>
    <li style="margin-bottom: 10px; padding-left: 25px; position: relative;">
      <span style="position: absolute; left: 0;">🎯</span> Set your fitness goals
    </li>
    <li style="margin-bottom: 10px; padding-left: 25px; position: relative;">
      <span style="position: absolute; left: 0;">📊</span> Get your personalized plan
    </li>
    <li style="padding-left: 25px; position: relative;">
      <span style="position: absolute; left: 0;">🔥</span> Start your transformation
    </li>
  </ul>
</div>

<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e6e0fa; text-align: center;">
  <p style="font-size: 14px; color: #777;">
    Need assistance? We're here for you! 💬<br>
    Contact us at <a href="mailto:support@StriveX.com" style="color: #8A2BE2; text-decoration: none; font-weight: bold;">support@aifitnesshub.com</a>
  </p>
</div>

<div style="text-align: center; margin-top: 20px; font-size: 12px; color: #888;">
  <p style="margin-bottom: 5px;">
    Follow us: 📱 <span style="color: #6A36CD; font-weight: bold;">@StriveX</span>
  </p>
  <p style="margin: 0;">
    © ${new Date().getFullYear()} StriveX. All rights reserved.
  </p>
</div>
</div>
`;
exports.VERIFICATION_MAIL_CONTENT = VERIFICATION_MAIL_CONTENT;
// api\src\shared\constants.ts
const APPROVAL_MAIL_CONTENT = (trainerName) => `
<div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; background-color: #faf8ff; border: 1px solid #e6e0fa; border-radius: 10px;">
  <!-- Logo Text Section -->
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="font-size: 48px; font-weight: bold; margin: 0;">
      🏋️‍♀️ <span style="color: #6A36CD;">StriveX</span> 🏋️‍♂️
    </h1>
  </div>

  <h2 style="color: #8A2BE2; text-align: center; margin-bottom: 30px; font-weight: 600;">
    🎉 Congratulations, ${trainerName}! 🎉
  </h2>

  <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px; color: #555;">
    We’re thrilled to inform you that your trainer application has been <strong>approved</strong>! Welcome to the StriveX team. 🌟 You’re now part of a community dedicated to transforming lives through fitness.
  </p>

  <div style="background: linear-gradient(135deg, #28A745 0%, #218838 100%); border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center; box-shadow: 0 4px 8px rgba(40, 167, 69, 0.2);">
    <h1 style="color: white; font-size: 36px; margin: 0; font-weight: bold;">
      Approved ✅
    </h1>
    <p style="color: #f0f0f0; font-size: 15px; margin-top: 10px;">
      Your journey as a StriveX trainer starts now!
    </p>
  </div>

  <div style="margin-top: 25px; padding: 20px; background-color: white; border-radius: 8px; text-align: center;">
    <p style="font-size: 16px; color: #6A36CD; margin-bottom: 15px; font-weight: bold;">
      Next Steps:
    </p>
    <ul style="list-style: none; padding: 0; text-align: left; margin: 0 20px;">
      <li style="margin-bottom: 10px; padding-left: 25px; position: relative;">
        <span style="position: absolute; left: 0;">📝</span> Set up your trainer profile
      </li>
      <li style="margin-bottom: 10px; padding-left: 25px; position: relative;">
        <span style="position: absolute; left: 0;">🏋️</span> Create your training programs
      </li>
      <li style="padding-left: 25px; position: relative;">
        <span style="position: absolute; left: 0;">🌍</span> Connect with clients
      </li>
    </ul>
  </div>

  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e6e0fa; text-align: center;">
    <p style="font-size: 14px; color: #777;">
      Questions? Contact us at <a href="mailto:support@strivex.com" style="color: #8A2BE2; text-decoration: none; font-weight: bold;">support@strivex.com</a>
    </p>
  </div>

  <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #888;">
    <p style="margin: 0;">
      © ${new Date().getFullYear()} StriveX. All rights reserved.
    </p>
  </div>
</div>
`;
exports.APPROVAL_MAIL_CONTENT = APPROVAL_MAIL_CONTENT;
const REJECTION_MAIL_CONTENT = (trainerName, rejectionReason) => `
<div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; background-color: #faf8ff; border: 1px solid #e6e0fa; border-radius: 10px;">
  <!-- Logo Text Section -->
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="font-size: 48px; font-weight: bold; margin: 0;">
      🏋️‍♀️ <span style="color: #6A36CD;">StriveX</span> 🏋️‍♂️
    </h1>
  </div>

  <h2 style="color: #DC3545; text-align: center; margin-bottom: 30px; font-weight: 600;">
    Application Update for ${trainerName}
  </h2>

  <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px; color: #555;">
    Thank you for applying to become a trainer at StriveX. After careful review, we regret to inform you that your application has been <strong>rejected</strong>.
  </p>

  <div style="background: linear-gradient(135deg, #DC3545 0%, #C82333 100%); border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center; box-shadow: 0 4px 8px rgba(220, 53, 69, 0.2);">
    <h1 style="color: white; font-size: 36px; margin: 0; font-weight: bold;">
      Rejected ❌
    </h1>
    <p style="color: #f0f0f0; font-size: 15px; margin-top: 10px;">
      Reason: ${rejectionReason}
    </p>
  </div>

  <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px; color: #555;">
    We appreciate your interest in joining our team. If you have any questions or would like feedback, feel free to reach out.
  </p>

  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e6e0fa; text-align: center;">
    <p style="font-size: 14px; color: #777;">
      Contact us at <a href="mailto:support@strivex.com" style="color: #8A2BE2; text-decoration: none; font-weight: bold;">support@strivex.com</a>
    </p>
  </div>

  <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #888;">
    <p style="margin: 0;">
      © ${new Date().getFullYear()} StriveX. All rights reserved.
    </p>
  </div>
</div>
`;
exports.REJECTION_MAIL_CONTENT = REJECTION_MAIL_CONTENT;
const PASSWORD_RESET_MAIL_CONTENT = (resetLink) => `
<div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; background-color: #faf8ff; border: 1px solid #e6e0fa; border-radius: 10px;">
  <!-- Logo Text Section -->
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="font-size: 48px; font-weight: bold; margin: 0;">
      🏋️‍♀️ <span style="color: #6A36CD;">StriveX</span> 🏋️‍♂️
    </h1>
  </div>

  <h2 style="color: #8A2BE2; text-align: center; margin-bottom: 30px; font-weight: 600;">
    🔐 Password Reset Request 🔐
  </h2>

  <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px; color: #555;">
    We received a request to reset your password for your StriveX account. Click the button below to create a new password.
  </p>

  <div style="background: linear-gradient(135deg, #9370DB 0%, #6A36CD 100%); border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center; box-shadow: 0 4px 8px rgba(106, 54, 205, 0.2);">
    <a href="${resetLink}" style="display: inline-block; background-color: white; color: #6A36CD; font-size: 18px; font-weight: bold; text-decoration: none; padding: 15px 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
      Reset Password
    </a>
    <p style="color: #f0f0f0; font-size: 15px; margin-top: 15px;">
      ⏱️ This link expires in 15 minutes
    </p>
  </div>

  <div style="background-color: white; border-left: 4px solid #FF9800; padding: 15px; margin: 20px 0; border-radius: 4px;">
    <p style="font-size: 15px; color: #555; margin: 0;">
      🔒 If you didn't request a password reset, please ignore this email or contact support if you have concerns.
    </p>
  </div>

  <p style="font-size: 14px; line-height: 1.5; color: #555; margin-top: 20px;">
    Having trouble with the button? Copy and paste the URL below into your web browser:
  </p>
  <div style="background-color: #f0f0f0; padding: 10px; border-radius: 5px; margin-bottom: 20px; word-break: break-all;">
    <a href="${resetLink}" style="color: #6A36CD; font-size: 14px; text-decoration: none;">${resetLink}</a>
  </div>

  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e6e0fa; text-align: center;">
    <p style="font-size: 14px; color: #777;">
      Need assistance? We're here for you! 💬<br>
      Contact us at <a href="mailto:support@strivex.com" style="color: #8A2BE2; text-decoration: none; font-weight: bold;">support@strivex.com</a>
    </p>
  </div>

  <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #888;">
    <p style="margin-bottom: 5px;">
      Follow us: 📱 <span style="color: #6A36CD; font-weight: bold;">@StriveX</span>
    </p>
    <p style="margin: 0;">
      © ${new Date().getFullYear()} StriveX. All rights reserved.
    </p>
  </div>
</div>
`;
exports.PASSWORD_RESET_MAIL_CONTENT = PASSWORD_RESET_MAIL_CONTENT;
const RE_REGISTRATION_MAIL_CONTENT = (trainerName) => `
<div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; background-color: #faf8ff; border: 1px solid #e6e0fa; border-radius: 10px;">
  <!-- Logo Text Section -->
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="font-size: 48px; font-weight: bold; margin: 0;">
      🏋️‍♀️ <span style="color: #6A36CD;">StriveX</span> 🏋️‍♂️
    </h1>
  </div>

  <h2 style="color: #8A2BE2; text-align: center; margin-bottom: 30px; font-weight: 600;">
    Application Re-submitted, ${trainerName}! 📝
  </h2>

  <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px; color: #555;">
    Thank you for re-submitting your application to become a trainer with StriveX. Your updated application is now pending review by our admin team.
  </p>

  <div style="background: linear-gradient(135deg, #9370DB 0%, #6A36CD 100%); border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center; box-shadow: 0 4px 8px rgba(106, 54, 205, 0.2);">
    <h1 style="color: white; font-size: 36px; margin: 0; font-weight: bold;">
      Pending Review ⏳
    </h1>
    <p style="color: #f0f0f0; font-size: 15px; margin-top: 10px;">
      We’ll notify you once a decision is made.
    </p>
  </div>

  <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px; color: #555;">
    If you have any questions or need further assistance, feel free to contact our support team.
  </p>

  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e6e0fa; text-align: center;">
    <p style="font-size: 14px; color: #777;">
      Contact us at <a href="mailto:support@strivex.com" style="color: #8A2BE2; text-decoration: none; font-weight: bold;">support@strivex.com</a>
    </p>
  </div>

  <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #888;">
    <p style="margin: 0;">
      © ${new Date().getFullYear()} StriveX. All rights reserved.
    </p>
  </div>
</div>
`;
exports.RE_REGISTRATION_MAIL_CONTENT = RE_REGISTRATION_MAIL_CONTENT;
const TRAINER_ACCEPTANCE_MAIL_CONTENT = (trainerName, clientName) => `
<div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; background-color: #faf8ff; border: 1px solid #e6e0fa; border-radius: 10px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="font-size: 48px; font-weight: bold; margin: 0;">
      🏋️‍♀️ <span style="color: #6A36CD;">StriveX</span> 🏋️‍♂️
    </h1>
  </div>
  <h2 style="color: #8A2BE2; text-align: center; margin-bottom: 30px; font-weight: 600;">
    🎉 New Trainer Assignment, ${clientName}! 🎉
  </h2>
  <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px; color: #555;">
    Congratulations! You have accepted ${trainerName} as your new Trainer. Get ready to guide them on their fitness journey!
  </p>
  <div style="background: linear-gradient(135deg, #28A745 0%, #218838 100%); border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center; box-shadow: 0 4px 8px rgba(40, 167, 69, 0.2);">
    <h1 style="color: white; font-size: 36px; margin: 0; font-weight: bold;">
      Accepted ✅
    </h1>
  </div>
  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e6e0fa; text-align: center;">
    <p style="font-size: 14px; color: #777;">
      Contact us at <a href="mailto:support@strivex.com" style="color: #8A2BE2; text-decoration: none; font-weight: bold;">support@strivex.com</a>
    </p>
  </div>
  <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #888;">
    <p style="margin: 0;">
      © ${new Date().getFullYear()} StriveX. All rights reserved.
    </p>
  </div>
</div>
`;
exports.TRAINER_ACCEPTANCE_MAIL_CONTENT = TRAINER_ACCEPTANCE_MAIL_CONTENT;
const TRAINER_REJECTION_MAIL_CONTENT = (trainerName, clientName, rejectionReason) => `
<div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; background-color: #faf8ff; border: 1px solid #e6e0fa; border-radius: 10px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="font-size: 48px; font-weight: bold; margin: 0;">
      🏋️‍♀️ <span style="color: #6A36CD;">StriveX</span> 🏋️‍♂️
    </h1>
  </div>
  <h2 style="color: #DC3545; text-align: center; margin-bottom: 30px; font-weight: 600;">
    Client Request Update, ${clientName}
  </h2>
  <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px; color: #555;">
    You have rejected the request from ${trainerName}.
  </p>
  <div style="background: linear-gradient(135deg, #DC3545 0%, #C82333 100%); border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center; box-shadow: 0 4px 8px rgba(220, 53, 69, 0.2);">
    <h1 style="color: white; font-size: 36px; margin: 0; font-weight: bold;">
      Rejected ❌
    </h1>
    <p style="color: #f0f0f0; font-size: 15px; margin-top: 10px;">
      Reason: ${rejectionReason}
    </p>
  </div>
  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e6e0fa; text-align: center;">
    <p style="font-size: 14px; color: #777;">
      Contact us at <a href="mailto:support@strivex.com" style="color: #8A2BE2; text-decoration: none; font-weight: bold;">support@strivex.com</a>
    </p>
  </div>
  <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #888;">
    <p style="margin: 0;">
      © ${new Date().getFullYear()} StriveX. All rights reserved.
    </p>
  </div>
</div>
`;
exports.TRAINER_REJECTION_MAIL_CONTENT = TRAINER_REJECTION_MAIL_CONTENT;
