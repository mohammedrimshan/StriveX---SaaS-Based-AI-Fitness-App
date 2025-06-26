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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LikePostUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const notification_service_1 = require("@/interfaceAdapters/services/notification.service");
const mongoose_1 = __importDefault(require("mongoose"));
let LikePostUseCase = class LikePostUseCase {
    constructor(postRepository, clientRepository, trainerRepository, notificationService) {
        this.postRepository = postRepository;
        this.clientRepository = clientRepository;
        this.trainerRepository = trainerRepository;
        this.notificationService = notificationService;
    }
    execute(postId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.default.Types.ObjectId.isValid(postId)) {
                throw new Error('Invalid post ID');
            }
            if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
                throw new Error('Invalid user ID');
            }
            const post = yield this.postRepository.findById(postId);
            if (!post) {
                throw new Error('Post not found');
            }
            if (post.isDeleted) {
                throw new Error('Cannot like a deleted post');
            }
            const hasLiked = post.likes.includes(userId);
            let updatedPost;
            try {
                updatedPost = hasLiked
                    ? yield this.postRepository.removeLike(postId, userId)
                    : yield this.postRepository.addLike(postId, userId);
            }
            catch (error) {
                throw new Error('Failed to update like');
            }
            if (!updatedPost) {
                updatedPost = yield this.postRepository.findById(postId);
                if (!updatedPost) {
                    throw new Error('Failed to update like');
                }
            }
            if (!hasLiked && post.authorId !== userId) {
                let senderName = 'Someone';
                try {
                    const client = yield this.clientRepository.findByClientNewId(userId);
                    if (client) {
                        senderName = `${client.firstName} ${client.lastName}`;
                    }
                    else {
                        const trainer = yield this.trainerRepository.findById(userId);
                        if (trainer) {
                            senderName = `${trainer.firstName} ${trainer.lastName}`;
                        }
                    }
                    yield this.notificationService.sendToUser(post.authorId, 'Post Liked', `${senderName} liked your post!`, 'INFO');
                }
                catch (error) {
                    console.error('Error sending notification:', error);
                }
            }
            return updatedPost;
        });
    }
};
exports.LikePostUseCase = LikePostUseCase;
exports.LikePostUseCase = LikePostUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IPostRepository')),
    __param(1, (0, tsyringe_1.inject)('IClientRepository')),
    __param(2, (0, tsyringe_1.inject)('ITrainerRepository')),
    __param(3, (0, tsyringe_1.inject)('NotificationService')),
    __metadata("design:paramtypes", [Object, Object, Object, notification_service_1.NotificationService])
], LikePostUseCase);
