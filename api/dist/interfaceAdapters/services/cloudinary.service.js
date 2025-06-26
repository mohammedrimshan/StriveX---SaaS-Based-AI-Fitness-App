"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudinaryService = exports.CloudinaryService = void 0;
const cloudinary_1 = require("cloudinary");
const tsyringe_1 = require("tsyringe");
let CloudinaryService = class CloudinaryService {
    constructor() {
        this.config = {
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            secure: true,
        };
        if (!this.config.cloud_name || !this.config.api_key || !this.config.api_secret) {
            throw new Error("Cloudinary configuration is incomplete. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment variables.");
        }
    }
    configure() {
        cloudinary_1.v2.config(this.config);
    }
    getClient() {
        return cloudinary_1.v2;
    }
    uploadImage(file_1) {
        return __awaiter(this, arguments, void 0, function* (file, options = {}) {
            try {
                if (!file.match(/^data:image\/(png|jpeg|jpg);base64,/)) {
                    throw new Error("Invalid image format. Only PNG, JPEG, or JPG allowed.");
                }
                const base64SizeMB = Buffer.from(file.split(",")[1], "base64").length / (1024 * 1024);
                if (base64SizeMB > 5) {
                    throw new Error("Image size exceeds 5MB limit.");
                }
                this.configure();
                const result = yield cloudinary_1.v2.uploader.upload(file, {
                    folder: options.folder || "default",
                    public_id: options.public_id,
                    overwrite: true,
                    resource_type: "image",
                    type: "authenticated",
                });
                console.log("Image upload result:", result);
                return result;
            }
            catch (error) {
                throw new Error(`Cloudinary image upload failed: ${error.message}`);
            }
        });
    }
    uploadFile(file_1) {
        return __awaiter(this, arguments, void 0, function* (file, options = {}) {
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
                const result = yield cloudinary_1.v2.uploader.upload(file, Object.assign({ folder: options.folder || "default", public_id: options.public_id, overwrite: true, resource_type: options.resource_type || "auto", type: "authenticated" }, options));
                console.log("File upload result:", result);
                return result;
            }
            catch (error) {
                throw new Error(`Cloudinary file upload failed: ${error.message}`);
            }
        });
    }
    generateSignedUrl(publicId, resourceType, expiresInSeconds) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.configure();
                const options = {
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
                const signedUrl = cloudinary_1.v2.url(publicId, options);
                console.log("Generated signed URL:", signedUrl);
                return signedUrl;
            }
            catch (error) {
                console.error("Error generating signed URL:", error);
                throw new Error(`Failed to generate signed URL: ${error.message}`);
            }
        });
    }
};
exports.CloudinaryService = CloudinaryService;
exports.CloudinaryService = CloudinaryService = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], CloudinaryService);
exports.cloudinaryService = new CloudinaryService();
