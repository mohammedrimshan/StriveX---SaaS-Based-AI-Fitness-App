import { inject, injectable } from "tsyringe";
import { IRegisterStrategy } from "./register-strategy.interface";
import { IAdminRepository } from "../../../entities/repositoryInterfaces/admin/admin-repository.interface";
import { AdminDTO, UserDTO } from "../../../shared/dto/user.dto";
import { IBcrypt } from "../../../frameworks/security/bcrypt.interface";
import { CustomError } from "../../../entities/utils/custom.error";
import { ERROR_MESSAGES, HTTP_STATUS } from "../../../shared/constants";
import { generateUniqueId } from "@/frameworks/security/uniqueuid.bcrypt";
import { IUserEntity } from "@/entities/models/user.entity";

@injectable()
export class AdminRegisterStrategy implements IRegisterStrategy {
  constructor(
    @inject("IAdminRepository") private adminRepository: IAdminRepository,
    @inject("IPasswordBcrypt") private passwordBcrypt: IBcrypt
  ) {}

  async register(user: UserDTO): Promise<IUserEntity | null> {
    if (user.role !== "admin") {
      throw new CustomError(
        "Invalid role for admin registration",
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Check if admin already exists
    const existingAdmin = await this.adminRepository.findByEmail(user.email);
    if (existingAdmin) {
      throw new CustomError(
        ERROR_MESSAGES.EMAIL_EXISTS,
        HTTP_STATUS.CONFLICT
      );
    }

    // Extract and hash the password
    const { firstName, lastName, password, email } = user as AdminDTO;

    let hashedPassword = null;
    if (password) {
      hashedPassword = await this.passwordBcrypt.hash(password);
    }
    const adminId = generateUniqueId("admin");

    // Save admin to database and return the result
    const savedAdmin = await this.adminRepository.save({
      firstName,
      lastName,
      email,
      password: hashedPassword ?? "",
      clientId: adminId,
      role: "admin",
    });

    if (!savedAdmin) {
      return null; // Return null if save fails
    }

    return savedAdmin; // Return the saved admin entity
  }
}