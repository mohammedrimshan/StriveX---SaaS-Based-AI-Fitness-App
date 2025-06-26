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
const tsyringe_1 = require("tsyringe");
const generative_ai_1 = require("@google/generative-ai");
const client_model_1 = require("@/frameworks/database/mongoDB/models/client.model");
const notification_service_1 = require("./notification.service");
const config_1 = require("@/shared/config");
let ChatbotService = class ChatbotService {
    constructor(notificationService) {
        this.notificationService = notificationService;
        this.connectedClients = new Set();
        this.genAI = new generative_ai_1.GoogleGenerativeAI(config_1.config.gemini.MAKERSUITE_KEY);
        // Primary: Gemini 2.5 Flash-Lite Preview (June 17)
        this.primaryModel = this.genAI.getGenerativeModel({
            model: "gemini-2.5-flash-lite-preview-06-17",
            generationConfig: {
                responseMimeType: "text/plain",
            },
        });
        // Fallback: Gemini 2.5 Flash stable
        this.fallbackModel = this.genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "text/plain",
            },
        });
    }
    getClientFitnessProfile(clientId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield client_model_1.ClientModel.findOne({ clientId }).select("firstName fitnessGoal experienceLevel preferredWorkout dietPreference skillsToGain height weight");
        });
    }
    generateContent(prompt) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const result = yield this.primaryModel.generateContent(prompt);
                return result.response.text().trim();
            }
            catch (error) {
                console.warn("Primary Gemini model failed:", error === null || error === void 0 ? void 0 : error.message);
                // Fallback on quota or rate limit errors
                const shouldFallback = ((_a = error.message) === null || _a === void 0 ? void 0 : _a.includes("Too Many Requests")) ||
                    ((_b = error.message) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes("quota"));
                if (shouldFallback) {
                    console.log("⚠️ Falling back to secondary Gemini model...");
                    try {
                        const fallbackResult = yield this.fallbackModel.generateContent(prompt);
                        return fallbackResult.response.text().trim();
                    }
                    catch (fallbackError) {
                        console.error("Fallback model also failed:", fallbackError === null || fallbackError === void 0 ? void 0 : fallbackError.message);
                        throw fallbackError;
                    }
                }
                throw error;
            }
        });
    }
    generateResponse(userMessage, clientId) {
        return __awaiter(this, void 0, void 0, function* () {
            const profile = yield this.getClientFitnessProfile(clientId);
            const userLower = userMessage.toLowerCase();
            const chitChatTriggers = [
                "how are you",
                "how's it going",
                "how are you doing",
                "what's up",
            ];
            if (chitChatTriggers.some((phrase) => userLower.includes(phrase))) {
                return {
                    response: `I'm doing great, ${(profile === null || profile === void 0 ? void 0 : profile.firstName) || "there"}! 💪 Ready to crush your fitness goals? Ask me anything about workouts, nutrition, or recovery!`,
                    source: "chitchat",
                };
            }
            const fitnessContext = profile
                ? `Client: ${profile.firstName || "User"}. Fitness goal: ${profile.fitnessGoal || "Not set"}. Experience level: ${profile.experienceLevel || "Not set"}. Preferred workout: ${profile.preferredWorkout || "Not set"}. Diet preference: ${profile.dietPreference || "Not set"}.`
                : "General fitness context.";
            const prompt = `
You are a friendly and motivational fitness coach for StriveX, helping ${(profile === null || profile === void 0 ? void 0 : profile.firstName) || "the user"}! Answer clearly and concisely with a supportive tone and relevant emojis. Always stay focused on fitness, workouts, nutrition, meditation, or recovery topics.

User's question: "${userMessage}"
Fitness Context: ${fitnessContext}

Response:
`;
            try {
                const aiResponse = yield this.generateContent(prompt);
                return {
                    response: aiResponse ||
                        `Let's keep pushing, ${(profile === null || profile === void 0 ? void 0 : profile.firstName) || "champ"}! What fitness goal should we tackle today? 💪`,
                    source: "gemini",
                };
            }
            catch (error) {
                return {
                    response: "Oops, something went wrong! Please try again or ask something else. 😅",
                    source: "fallback",
                };
            }
        });
    }
    handleSocket(io) {
        io.on("connection", (socket) => {
            if (this.connectedClients.has(socket.id)) {
                socket.disconnect(true);
                return;
            }
            this.connectedClients.add(socket.id);
            socket.on("message", (msg) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const { response, source } = yield this.generateResponse(msg.doubt, msg.clientId);
                    socket.emit("response", { message: response, source });
                }
                catch (error) {
                    socket.emit("response", {
                        message: "Something went wrong! Let’s try again! 😅",
                        source: "error",
                    });
                }
            }));
            socket.on("disconnect", () => {
                this.connectedClients.delete(socket.id);
            });
            socket.on("ping", () => {
                socket.emit("pong");
            });
        });
    }
};
ChatbotService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("NotificationService")),
    __metadata("design:paramtypes", [notification_service_1.NotificationService])
], ChatbotService);
exports.default = ChatbotService;
