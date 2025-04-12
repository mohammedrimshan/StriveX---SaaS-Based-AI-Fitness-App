
import { v2 as cloudinary, ConfigOptions, UploadApiOptions } from "cloudinary";
import { injectable } from "tsyringe";

export interface ICloudinaryService {
  configure(): void;
  getClient(): typeof cloudinary;
  uploadImage(file: string, options?: { folder?: string; public_id?: string }): Promise<any>;
  uploadFile(file: string, options?: UploadApiOptions): Promise<any>; 
}

@injectable()
export class CloudinaryService implements ICloudinaryService {
  private config: ConfigOptions;

  constructor() {
    this.config = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    };

    if (!this.config.cloud_name || !this.config.api_key || !this.config.api_secret) {
      throw new Error(
        "Cloudinary configuration is incomplete. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment variables."
      );
    }
  }

  configure(): void {
    cloudinary.config(this.config);
  }

  getClient(): typeof cloudinary {
    return cloudinary;
  }

  async uploadImage(file: string, options: { folder?: string; public_id?: string } = {}): Promise<any> {
    try {
      this.configure();
      const result = await cloudinary.uploader.upload(file, {
        folder: options.folder || "default",
        public_id: options.public_id,
        overwrite: true,
        resource_type: "image", 
      });
      console.log("Image upload result:", result);
      return result;
    } catch (error) {
      throw new Error(`Cloudinary image upload failed: ${(error as Error).message}`);
    }
  }

  async uploadFile(file: string, options: UploadApiOptions = {}): Promise<any> {
    try {
      this.configure();
      const result = await cloudinary.uploader.upload(file, {
        folder: options.folder || "default",
        public_id: options.public_id,
        overwrite: true,
        resource_type: options.resource_type || "auto", 
        ...options, 
      });
      console.log("File upload result:", result);
      return result;
    } catch (error) {
      throw new Error(`Cloudinary file upload failed: ${(error as Error).message}`);
    }
  }
}

export const cloudinaryService = new CloudinaryService();