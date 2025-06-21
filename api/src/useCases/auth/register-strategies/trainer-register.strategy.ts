import { inject, injectable } from "tsyringe";
import { IRegisterStrategy } from "./register-strategy.interface";
import { TrainerDTO, UserDTO } from "@/shared/dto/user.dto";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { IAdminRepository } from "@/entities/repositoryInterfaces/admin/admin-repository.interface"; // Add this
import { NotificationService } from "@/interfaceAdapters/services/notification.service"; // Add this
import { CustomError } from "@/entities/utils/custom.error";
import {
  ERROR_MESSAGES,
  HTTP_STATUS,
  TrainerApprovalStatus,
  RE_REGISTRATION_MAIL_CONTENT,
} from "@/shared/constants";
import { IBcrypt } from "@/frameworks/security/bcrypt.interface";
import { generateUniqueId } from "@/frameworks/security/uniqueuid.bcrypt";
import { IUserEntity } from "@/entities/models/user.entity";
import { trainerSchema } from "@/interfaceAdapters/controllers/auth/validations/user-signup.validation.schema";
import { IEmailService } from "@/entities/services/email-service.interface";

@injectable()
export class TrainerRegisterStrategy implements IRegisterStrategy {
  constructor(
    @inject("IPasswordBcrypt") private _passwordBcrypt: IBcrypt,
    @inject("ITrainerRepository")
    private _trainerRepository: ITrainerRepository,
    @inject("IEmailService") private _emailService: IEmailService,
    @inject("IAdminRepository") private _adminRepository: IAdminRepository, // Inject AdminRepository
    @inject("NotificationService")
    private _notificationService: NotificationService // Inject NotificationService
  ) {}

  async register(user: UserDTO): Promise<IUserEntity | null> {
    if (user.role !== "trainer") {
      throw new CustomError(
        "Invalid role for user registration",
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const validationResult = trainerSchema.safeParse(user);
    if (!validationResult.success) {
      throw new CustomError("Invalid input data", HTTP_STATUS.BAD_REQUEST);
    }

    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      dateOfBirth,
      gender,
      experience,
      skills,
    } = user as TrainerDTO;
    const existingTrainer = await this._trainerRepository.findByEmail(email);

    let hashedPassword = password
      ? await this._passwordBcrypt.hash(password)
      : "";
    const trainerData = {
      firstName,
      lastName,
      email,
      phoneNumber,
      password: hashedPassword,
      dateOfBirth,
      gender,
      experience,
      skills,
      role: "trainer" as const,
      approvalStatus: TrainerApprovalStatus.PENDING,
      rejectionReason: undefined,
      approvedByAdmin: false,
    };

    let savedTrainer: IUserEntity | null;

    if (
      existingTrainer &&
      existingTrainer.approvalStatus === TrainerApprovalStatus.REJECTED
    ) {
      // Re-registration case
      savedTrainer = await this._trainerRepository.updateByEmail(email, {
        ...trainerData,
        updatedAt: new Date(),
      });

      if (!savedTrainer) {
        throw new CustomError(
          "Failed to update trainer data",
          HTTP_STATUS.INTERNAL_SERVER_ERROR
        );
      }

      // Send re-registration email
      const trainerName = `${firstName} ${lastName}`;
      await this._emailService.sendEmail(
        email,
        "StriveX Trainer Re-registration Submitted",
        RE_REGISTRATION_MAIL_CONTENT(trainerName)
      );
    } else if (existingTrainer) {
      // Email already exists and not rejected
      throw new CustomError(ERROR_MESSAGES.EMAIL_EXISTS, HTTP_STATUS.CONFLICT);
    } else {
      // New registration
      const clientId = generateUniqueId("trainer");
      savedTrainer = await this._trainerRepository.save({
        ...trainerData,
        clientId,
      });
    }

    if (!savedTrainer) {
      return null;
    }

    const { items: admins, total } = await this._adminRepository.find(
      { role: "admin" },
      0, // skip 0 records
      1000 // fetch up to 1000 admins, adjust as needed
    );
    const notificationMessage = `Trainer ${firstName} ${lastName} has registered and requires approval.`;

    for (const admin of admins) {
      try {
        await this._notificationService.sendToUser(
          admin.id!,
          "New Trainer Registration",
          notificationMessage,
          "INFO"
        );
      } catch (err) {
        console.error("Failed to send notification to admin", err);
      }
    }

    return savedTrainer;
  }
}
