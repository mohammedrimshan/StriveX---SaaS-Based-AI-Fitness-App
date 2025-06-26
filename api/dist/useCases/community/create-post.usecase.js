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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
exports.CreatePostUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const uuid_1 = require("uuid");
const constants_1 = require("@/shared/constants");
let CreatePostUseCase = class CreatePostUseCase {
    constructor(postRepository, clientRepository, trainerRepository, cloudinaryService) {
        this.postRepository = postRepository;
        this.clientRepository = clientRepository;
        this.trainerRepository = trainerRepository;
        this.cloudinaryService = cloudinaryService;
    }
    execute(data, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const client = yield this.clientRepository.findByClientNewId(userId);
            const trainer = yield this.trainerRepository.findById(userId);
            const user = client || trainer;
            if (!user) {
                throw new Error("User not found");
            }
            // Determine category and ensure it's a WorkoutType
            let category = data.category;
            if (!category) {
                if ((_a = trainer === null || trainer === void 0 ? void 0 : trainer.specialization) === null || _a === void 0 ? void 0 : _a[0]) {
                    category = trainer.specialization[0];
                }
                else if (client === null || client === void 0 ? void 0 : client.preferredWorkout) {
                    category = client.preferredWorkout;
                }
            }
            if (!category || !constants_1.WORKOUT_TYPES.includes(category)) {
                throw new Error(`Category must be one of: ${constants_1.WORKOUT_TYPES.join(", ")}`);
            }
            // Use the provided mediaUrl directly (Cloudinary URL)
            const mediaUrl = data.mediaUrl;
            const role = trainer ? "trainer" : "client";
            let author = null;
            if (client === null || client === void 0 ? void 0 : client.id) {
                author = {
                    _id: client.id.toString(),
                    firstName: client.firstName || "Unknown",
                    lastName: client.lastName || "",
                    email: client.email || "",
                    profileImage: client.profileImage || undefined,
                };
            }
            else if (trainer === null || trainer === void 0 ? void 0 : trainer.id) {
                author = {
                    _id: trainer.id.toString(),
                    firstName: trainer.firstName || "Unknown",
                    lastName: trainer.lastName || "",
                    email: trainer.email || "",
                    profileImage: trainer.profileImage || undefined,
                };
            }
            if (!author) {
                throw new Error("Failed to construct author details");
            }
            // Validate textContent
            const textContent = data.textContent || (mediaUrl ? mediaUrl : "");
            if (!textContent) {
                throw new Error("Post content is required");
            }
            const postData = {
                id: (0, uuid_1.v4)(),
                author,
                authorId: userId,
                role,
                textContent,
                category,
                mediaUrl,
                likes: [],
                isDeleted: false,
                reports: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            const savedPost = yield this.postRepository.save(postData);
            // Verify and update author if null
            if (!savedPost.author) {
                const updatedPost = yield this.postRepository.update(savedPost.id, {
                    author,
                });
                if (updatedPost) {
                    savedPost.author = updatedPost.author;
                }
            }
            return savedPost;
        });
    }
};
exports.CreatePostUseCase = CreatePostUseCase;
exports.CreatePostUseCase = CreatePostUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IPostRepository")),
    __param(1, (0, tsyringe_1.inject)("IClientRepository")),
    __param(2, (0, tsyringe_1.inject)("ITrainerRepository")),
    __param(3, (0, tsyringe_1.inject)("ICloudinaryService")),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], CreatePostUseCase);
