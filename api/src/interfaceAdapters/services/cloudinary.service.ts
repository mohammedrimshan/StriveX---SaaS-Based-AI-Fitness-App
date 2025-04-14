import { v2 as cloudinary, ConfigOptions, UploadApiOptions } from "cloudinary";
import { injectable } from "tsyringe";

export interface ICloudinaryService {
  configure(): void;
  getClient(): typeof cloudinary;
  uploadImage(file: string, options?: { folder?: string; public_id?: string }): Promise<any>;
  uploadFile(file: string, options?: UploadApiOptions): Promise<any>;
  generateSignedUrl(publicId: string, resourceType: string, expiresInSeconds?: number): Promise<string>;
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
      if (!file.match(/^data:image\/(png|jpeg|jpg);base64,/)) {
        throw new Error("Invalid image format. Only PNG, JPEG, or JPG allowed.");
      }
      const base64SizeMB = Buffer.from(file.split(",")[1], "base64").length / (1024 * 1024);
      if (base64SizeMB > 5) {
        throw new Error("Image size exceeds 5MB limit.");
      }

      this.configure();
      const result = await cloudinary.uploader.upload(file, {
        folder: options.folder || "default",
        public_id: options.public_id,
        overwrite: true,
        resource_type: "image",
        type: "authenticated", 
      });
      console.log("Image upload result:", result);
      return result;
    } catch (error) {
      throw new Error(`Cloudinary image upload failed: ${(error as Error).message}`);
    }
  }

  async uploadFile(file: string, options: UploadApiOptions = {}): Promise<any> {
    try {
      const allowedFormats = /^data:(image\/(png|jpeg|jpg)|video\/(mp4|webm)|application\/pdf);base64,/;
      if (!file.match(allowedFormats)) {
        throw new Error("Invalid file format. Only images, videos, or PDFs allowed.");
      }
      const base64SizeMB = Buffer.from(file.split(",")[1], "base64").length / (1024 * 1024);
      if (base64SizeMB > 50) {
        throw new Error("File size exceeds 50MB limit.");
      }

      this.configure();
      const result = await cloudinary.uploader.upload(file, {
        folder: options.folder || "default",
        public_id: options.public_id,
        overwrite: true,
        resource_type: options.resource_type || "auto",
        type: "authenticated",
        ...options,
      });
      console.log("File upload result:", result);
      return result;
    } catch (error) {
      throw new Error(`Cloudinary file upload failed: ${(error as Error).message}`);
    }
  }

  async generateSignedUrl(
    publicId: string,
    resourceType: string,
    expiresInSeconds?: number
  ): Promise<string> {
    try {
      this.configure();
      const options: any = {
        resource_type: resourceType,
        type: "upload",
        sign_url: true, 
        secure: true,
      };

      // Add expiration if provided
      if (expiresInSeconds) {
        options.expires_at = Math.floor(Date.now() / 1000) + expiresInSeconds;
      }

      // Generate signed URL using cloudinary.url
      const signedUrl = cloudinary.url(publicId, options);
      console.log("Generated signed URL:", signedUrl);
      return signedUrl;
    } catch (error) {
      console.error("Error generating signed URL:", error);
      throw new Error(`Failed to generate signed URL: ${(error as Error).message}`);
    }
  }
}

export const cloudinaryService = new CloudinaryService();