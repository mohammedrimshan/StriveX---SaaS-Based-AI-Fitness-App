import { injectable, inject } from "tsyringe";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Server, Socket } from "socket.io";
import { ClientModel, IClientModel } from "@/frameworks/database/mongoDB/models/client.model";
import { NotificationService } from "./notification.service";
import { config } from "@/shared/config";

@injectable()
class ChatbotService {
  private genAI: GoogleGenerativeAI;
  private primaryModel: any;
  private fallbackModel: any;
  private connectedClients: Set<string> = new Set();

  constructor(
    @inject("NotificationService")
    private notificationService: NotificationService
  ) {
    this.genAI = new GoogleGenerativeAI(config.gemini.MAKERSUITE_KEY);

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

  private async getClientFitnessProfile(
    clientId: string
  ): Promise<Partial<IClientModel> | null> {
    return await ClientModel.findOne({ clientId }).select(
      "firstName fitnessGoal experienceLevel preferredWorkout dietPreference skillsToGain height weight"
    );
  }

  private async generateContent(prompt: string): Promise<string> {
    try {
      const result = await this.primaryModel.generateContent(prompt);
      return result.response.text().trim();
    } catch (error: any) {
      console.warn("Primary Gemini model failed:", error?.message);

      // Fallback on quota or rate limit errors
      const shouldFallback =
        error.message?.includes("Too Many Requests") ||
        error.message?.toLowerCase().includes("quota");

      if (shouldFallback) {
        console.log("⚠️ Falling back to secondary Gemini model...");
        try {
          const fallbackResult = await this.fallbackModel.generateContent(prompt);
          return fallbackResult.response.text().trim();
        } catch (fallbackError: any) {
          console.error("Fallback model also failed:", fallbackError?.message);
          throw fallbackError;
        }
      }

      throw error;
    }
  }

  async generateResponse(
    userMessage: string,
    clientId: string
  ): Promise<{ response: string; source: string }> {
    const profile = await this.getClientFitnessProfile(clientId);

    const userLower = userMessage.toLowerCase();
    const chitChatTriggers = [
      "how are you",
      "how's it going",
      "how are you doing",
      "what's up",
    ];
    if (chitChatTriggers.some((phrase) => userLower.includes(phrase))) {
      return {
        response: `I'm doing great, ${
          profile?.firstName || "there"
        }! 💪 Ready to crush your fitness goals? Ask me anything about workouts, nutrition, or recovery!`,
        source: "chitchat",
      };
    }

    const fitnessContext = profile
      ? `Client: ${profile.firstName || "User"}. Fitness goal: ${
          profile.fitnessGoal || "Not set"
        }. Experience level: ${
          profile.experienceLevel || "Not set"
        }. Preferred workout: ${
          profile.preferredWorkout || "Not set"
        }. Diet preference: ${profile.dietPreference || "Not set"}.`
      : "General fitness context.";

    const prompt = `
You are a friendly and motivational fitness coach for StriveX, helping ${
      profile?.firstName || "the user"
    }! Answer clearly and concisely with a supportive tone and relevant emojis. Always stay focused on fitness, workouts, nutrition, meditation, or recovery topics.

User's question: "${userMessage}"
Fitness Context: ${fitnessContext}

Response:
`;

    try {
      const aiResponse = await this.generateContent(prompt);
      return {
        response:
          aiResponse ||
          `Let's keep pushing, ${
            profile?.firstName || "champ"
          }! What fitness goal should we tackle today? 💪`,
        source: "gemini",
      };
    } catch (error) {
      return {
        response:
          "Oops, something went wrong! Please try again or ask something else. 😅",
        source: "fallback",
      };
    }
  }

  handleSocket(io: Server) {
    io.on("connection", (socket: Socket) => {
      if (this.connectedClients.has(socket.id)) {
        socket.disconnect(true);
        return;
      }

      this.connectedClients.add(socket.id);

      socket.on("message", async (msg: { doubt: string; clientId: string }) => {
        try {
          const { response, source } = await this.generateResponse(
            msg.doubt,
            msg.clientId
          );
          socket.emit("response", { message: response, source });
        } catch (error) {
          socket.emit("response", {
            message: "Something went wrong! Let’s try again! 😅",
            source: "error",
          });
        }
      });

      socket.on("disconnect", () => {
        this.connectedClients.delete(socket.id);
      });

      socket.on("ping", () => {
        socket.emit("pong");
      });
    });
  }
}

export default ChatbotService;
