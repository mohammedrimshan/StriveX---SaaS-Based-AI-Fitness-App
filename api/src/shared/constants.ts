export const ROLES = {
  ADMIN: "admin",
  USER: "client",
  TRAINER: "trainer"
} as const;

export type TRole = "client" | "trainer" | "admin";

export enum TrainerApprovalStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}


export type Gender = "male" | "female" | "other";


export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const SUCCESS_MESSAGES = {
  REGISTRATION_SUCCESS: "Registration completed successfully",
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
} as const;

export const ERROR_MESSAGES = {
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
  UPDATE_FAILED:"Updation Failed"
} as const;

export const VERIFICATION_MAIL_CONTENT = (otp: string) => `
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



// api\src\shared\constants.ts
export const APPROVAL_MAIL_CONTENT = (trainerName: string) => `
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

export const REJECTION_MAIL_CONTENT = (trainerName: string, rejectionReason: string) => `
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


export const PASSWORD_RESET_MAIL_CONTENT = (resetLink: string) => `
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