import { injectable } from "tsyringe";
import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { IClientEntity } from "@/entities/models/client.entity";
import { IWorkoutPlan } from "@/entities/models/ai-workout-plan.entity";
import { IDietPlan } from "@/entities/models/ai-diet-plan.entity";
import { config } from "@/shared/config";
import Redis from "ioredis";
import { CronJob } from "cron";

@injectable()
export class GeminiService {
    private genAI: GoogleGenerativeAI;
    private model: GenerativeModel;
    private redis: Redis;
    private cronJobs: Map<string, CronJob> = new Map();

    constructor() {
        this.genAI = new GoogleGenerativeAI(config.gemini.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ 
            model: "gemini-1.5-pro",
            generationConfig: {
                responseMimeType: "application/json"
            }
        });
        
        this.redis = new Redis({
            host: config.redis.REDIS_HOST,
            port: config.redis.REDIS_PORT,
            password: config.redis.REDIS_PASS,
            connectTimeout: 10000,
            maxRetriesPerRequest: 3
        });
        
        this.setupCleanupJob();
    }

    async generateWorkoutPlan(client: IClientEntity): Promise<IWorkoutPlan> {
        const cacheKey = `workout:${client.clientId}`;
        
        // Check cache first
        const cached = await this.getCachedPlan<IWorkoutPlan>(cacheKey);
        if (cached) {
            return cached;
        }

        // Check for duplicate request
        if (await this.checkDuplicateRequest(cacheKey)) {
            throw new Error("Duplicate request detected. Please wait for the previous request to complete.");
        }
        
        try {
            await this.setRequestInProgress(cacheKey);
            
            const prompt = this.createWorkoutPrompt(client);
            console.log("Sending workout prompt:", prompt);
            
            const result = await this.retryGenerateContent(prompt);
            const rawResponse = result.response.text();
            console.log("Raw workout response:", rawResponse);
            
            const { response: cleanedResponse, wasRepaired } = this.cleanAndValidateResponse(rawResponse);
            const parsedPlan = this.parseWorkoutResponse(cleanedResponse);
            
            if (wasRepaired) {
                console.warn("Response required repair to become valid JSON");
            }
            
            console.log("Final workout plan structure:", JSON.stringify(parsedPlan, null, 2));
            
            const plan = this.formatWorkoutPlan(client, parsedPlan);
            
            await this.cachePlan(cacheKey, plan);
            this.setupAutoRegeneration(client, 'workout');
            
            return plan;
        } catch (error: unknown) {
            this.logError(error, "workout", client);
            throw this.createServiceError(error, "workout plan");
        } finally {
            await this.clearRequestInProgress(cacheKey);
        }
    }

    async generateDietPlan(client: IClientEntity): Promise<IDietPlan> {
        const cacheKey = `diet:${client.clientId}`;
        
        // Check cache first
        const cached = await this.getCachedPlan<IDietPlan>(cacheKey);
        if (cached) {
            return cached;
        }

        // Check for duplicate request
        if (await this.checkDuplicateRequest(cacheKey)) {
            throw new Error("Duplicate request detected. Please wait for the previous request to complete.");
        }
        
        try {
            await this.setRequestInProgress(cacheKey);
            
            const prompt = this.createDietPrompt(client);
            console.log("Sending diet prompt:", prompt);
            
            const result = await this.retryGenerateContent(prompt);
            const rawResponse = result.response.text();
            console.log("Raw diet response:", rawResponse);
            
            const { response: cleanedResponse, wasRepaired } = this.cleanAndValidateResponse(rawResponse);
            const parsedPlan = this.parseDietResponse(cleanedResponse);
            
            if (wasRepaired) {
                console.warn("Response required repair to become valid JSON");
            }
            
            console.log("Final diet plan structure:", JSON.stringify(parsedPlan, null, 2));
            
            const plan = this.formatDietPlan(client, parsedPlan);
            
            await this.cachePlan(cacheKey, plan);
            this.setupAutoRegeneration(client, 'diet');
            
            return plan;
        } catch (error: unknown) {
            this.logError(error, "diet", client);
            throw this.createServiceError(error, "diet plan");
        } finally {
            await this.clearRequestInProgress(cacheKey);
        }
    }

    private async checkDuplicateRequest(key: string): Promise<boolean> {
        return (await this.redis.get(`${key}:in_progress`)) === "true";
    }

    private async setRequestInProgress(key: string): Promise<void> {
        await this.redis.setex(`${key}:in_progress`, 300, "true"); // 5 minute timeout
    }

    private async clearRequestInProgress(key: string): Promise<void> {
        await this.redis.del(`${key}:in_progress`);
    }

    private async cachePlan<T>(key: string, plan: T): Promise<void> {
        await this.redis.setex(key, 604800, JSON.stringify(plan)); // 7 days cache
    }

    private async getCachedPlan<T>(key: string): Promise<T | null> {
        const cached = await this.redis.get(key);
        return cached ? JSON.parse(cached) : null;
    }

    private setupCleanupJob(): void {
        // Daily cleanup job at 3 AM
        const job = new CronJob('0 3 * * *', async () => {
            try {
                const keys = await this.redis.keys('*:in_progress');
                const pipeline = this.redis.pipeline();
                
                for (const key of keys) {
                    const ttl = await this.redis.ttl(key);
                    if (ttl < 0) {
                        pipeline.del(key);
                    }
                }
                
                await pipeline.exec();
                console.log(`Cleaned up ${keys.length} stale Redis keys`);
            } catch (error) {
                console.error("Failed to clean up Redis keys:", error);
            }
        });
        
        job.start();
    }

    private setupAutoRegeneration(client: IClientEntity, type: 'workout' | 'diet'): void {
        const jobKey = `${type}:${client.clientId}:regeneration`;
        
        if (this.cronJobs.has(jobKey)) {
            return; // Job already exists
        }
        
        const job = new CronJob('0 6 */7 * *', async () => {
            try {
                console.log(`Starting auto-regeneration of ${type} plan for client ${client.clientId}`);
                
                if (type === 'workout') {
                    await this.generateWorkoutPlan(client);
                } else {
                    await this.generateDietPlan(client);
                }
                
                console.log(`Successfully auto-regenerated ${type} plan for client ${client.clientId}`);
            } catch (error) {
                console.error(`Failed to auto-regenerate ${type} plan for client ${client.clientId}:`, error);
                
                // Retry in 1 hour if failed
                setTimeout(() => {
                    this.setupAutoRegeneration(client, type);
                }, 3600000);
            }
        }, null, true, 'UTC');
        
        this.cronJobs.set(jobKey, job);
    }

    private cleanAndValidateResponse(rawResponse: string): { response: string; wasRepaired: boolean } {
        try {
            JSON.parse(rawResponse);
            return { response: rawResponse, wasRepaired: false };
        } catch (initialError) {
            console.log("Initial JSON parse failed, attempting cleaning...");
        }

        let cleaned = rawResponse
            .replace(/```(json)?\s*/g, '')
            .replace(/```\s*/g, '')
            .trim();

        try {
            JSON.parse(cleaned);
            return { response: cleaned, wasRepaired: true };
        } catch (cleaningError) {
            console.log("Cleaned JSON parse failed, attempting repair...");
        }

        const repaired = this.repairMalformedJson(cleaned);
        try {
            JSON.parse(repaired);
            return { response: repaired, wasRepaired: true };
        } catch (repairError) {
            console.error("All JSON repair attempts failed, returning minimal structure");
            return { response: '{"weeklyPlan":[]}', wasRepaired: true };
        }
    }

    private repairMalformedJson(jsonString: string): string {
        const jsonStart = jsonString.indexOf('{');
        const jsonEnd = jsonString.lastIndexOf('}') + 1;
        
        if (jsonStart >= 0 && jsonEnd > jsonStart) {
            jsonString = jsonString.substring(jsonStart, jsonEnd);
        }
    
        return jsonString
            .replace(/([{,\[]\s*)([a-zA-Z_][a-zA-Z0-9_]*)(\s*:)/g, '$1"$2"$3')
            .replace(/'([^']+)'/g, '"$1"')
            .replace(/,\s*([}\]])/g, '$1')
            .replace(/(["}\]\w])\s*(["{\[a-zA-Z])/g, '$1,$2')
            .replace(/\\"/g, '"')
            .replace(/\/\/.*?[\r\n]/g, '')
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/\\n/g, '\\n');
    }
  
    private parseWorkoutResponse(response: string): any {
        try {
            const parsed = JSON.parse(response);
            
            if (!parsed.weeklyPlan || !Array.isArray(parsed.weeklyPlan)) {
                parsed.weeklyPlan = [];
            }
            
            return parsed;
        } catch (error) {
            console.error("Failed to parse workout response:", error);
            return { weeklyPlan: [] };
        }
    }

    private parseDietResponse(response: string): any {
        try {
            const parsed = JSON.parse(response);
            
            if (!parsed.weeklyPlan || !Array.isArray(parsed.weeklyPlan)) {
                parsed.weeklyPlan = [];
            }
            
            return parsed;
        } catch (error) {
            console.error("Failed to parse diet response:", error);
            return { weeklyPlan: [] };
        }
    }

    private formatWorkoutPlan(client: IClientEntity, planData: any): IWorkoutPlan {
        return {
            clientId: client.clientId,
            title: `${client.firstName}'s ${client.preferredWorkout ? client.preferredWorkout + ' ' : ''}Workout Plan`,
            description: `Custom ${client.preferredWorkout ? client.preferredWorkout + ' ' : ''}workout plan based on ${client.fitnessGoal} goal`,
            weeklyPlan: planData.weeklyPlan,
            createdAt: new Date(),
            updatedAt: new Date(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        };
    }

    private formatDietPlan(client: IClientEntity, planData: any): IDietPlan {
        return {
            clientId: client.clientId,
            title: `${client.firstName}'s ${client.dietPreference ? client.dietPreference + ' ' : ''}Diet Plan`,
            description: `Custom diet plan based on ${client.fitnessGoal} goal`,
            weeklyPlan: planData.weeklyPlan,
            createdAt: new Date(),
            updatedAt: new Date(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        };
    }

    private async retryGenerateContent(prompt: string, maxRetries = 3): Promise<any> {
        let attempts = 0;
        let lastError: unknown;

        while (attempts < maxRetries) {
            try {
                return await this.model.generateContent(prompt);
            } catch (error: unknown) {
                lastError = error;
                attempts++;
                
                if (this.isRateLimitError(error)) {
                    const delay = this.getRetryDelay(error);
                    console.warn(`Rate limited, retrying in ${delay}ms (attempt ${attempts}/${maxRetries})`);
                    await this.sleep(delay);
                } else {
                    break;
                }
            }
        }

        throw lastError || new Error("Failed to generate content");
    }

    private isRateLimitError(error: unknown): boolean {
        const typedError = error as { status?: number };
        return typedError?.status === 429;
    }

    private getRetryDelay(error: unknown): number {
        const typedError = error as { errorDetails?: Array<{ '@type': string; retryDelay?: string }> };
        const retryInfo = typedError.errorDetails?.find(d => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo');
        return retryInfo?.retryDelay ? this.parseRetryDelay(retryInfo.retryDelay) : 5000;
    }

    private parseRetryDelay(delay: string): number {
        const value = parseFloat(delay);
        if (delay.endsWith('s')) return value * 1000;
        if (delay.endsWith('ms')) return value;
        return value * 1000;
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private logError(error: unknown, planType: string, client: IClientEntity): void {
        console.error(`Error generating ${planType} plan for client ${client.clientId}:`, {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            clientDetails: {
                id: client.clientId,
                height: client.height,
                weight: client.weight,
                goal: client.fitnessGoal
            }
        });
    }

    private createServiceError(error: unknown, planType: string): Error {
        const message = error instanceof Error ? error.message : `Failed to generate ${planType}`;
        const serviceError = new Error(message);
        serviceError.name = 'GeminiServiceError';
        return serviceError;
    }

    private createWorkoutPrompt(client: IClientEntity): string {
        const isSpecificWorkout = client.preferredWorkout && 
            ['yoga', 'pilates', 'crossfit', 'calisthenics'].includes(client.preferredWorkout.toLowerCase());
        
        const workoutSpecificInstruction = isSpecificWorkout
            ? `Generate a comprehensive 7-day ${client.preferredWorkout} plan. All days should focus exclusively on ${client.preferredWorkout}, with progressive difficulty and variety.`
            : `Generate a balanced 7-day workout plan with varied focus areas.`;
        
        return JSON.stringify({
            instruction: `Generate a detailed 7-day workout plan for a client with the following details. ${workoutSpecificInstruction}`,
            requirements: {
                format: "strict JSON",
                structure: {
                    weeklyPlan: [{
                        day: "string",
                        focus: "string",
                        exercises: [{
                            name: "string",
                            sets: "number",
                            reps: "number|string",
                            restTime: "string",
                            notes: "string"
                        }],
                        warmup: "string",
                        cooldown: "string",
                        duration: "string",
                        intensity: "string"
                    }]
                },
                additionalRequirements: isSpecificWorkout ? {
                    consistency: `All days must be ${client.preferredWorkout} focused`,
                    progression: "Include progressive difficulty through the week",
                    variety: "Include different styles/variations of the preferred workout"
                } : {}
            },
            client: {
                height: `${client.height} cm`,
                weight: `${client.weight} kg`,
                fitnessGoal: client.fitnessGoal,
                experienceLevel: client.experienceLevel,
                preferredWorkout: client.preferredWorkout || 'Not specified',
                activityLevel: client.activityLevel,
                healthConditions: client.healthConditions?.join(', ') || 'None',
                availableEquipment: client.equipmentAvailable?.join(', ') || 'Basic'
            },
            examples: {
                validResponse: isSpecificWorkout ? {
                    weeklyPlan: [{
                        day: "Monday",
                        focus: "Yoga Fundamentals",
                        exercises: [{
                            name: "Sun Salutation A",
                            sets: 3,
                            reps: "5 rounds",
                            restTime: "30 seconds between rounds",
                            notes: "Focus on breath synchronization"
                        }],
                        warmup: "5 min gentle stretching",
                        cooldown: "5 min Savasana",
                        duration: "45 minutes",
                        intensity: "Moderate"
                    }]
                } : {
                    weeklyPlan: [{
                        day: "Monday",
                        focus: "Upper Body Strength",
                        exercises: [{
                            name: "Bench Press",
                            sets: 4,
                            reps: 8,
                            restTime: "90 seconds",
                            notes: "Use challenging weight"
                        }],
                        warmup: "10 min dynamic stretching",
                        cooldown: "5 min static stretching",
                        duration: "60 minutes",
                        intensity: "High"
                    }]
                }
            }
        });
    }

    private createDietPrompt(client: IClientEntity): string {
        return JSON.stringify({
            instruction: `Generate a detailed 7-day diet plan for a client with the following details:`,
            requirements: {
                format: "strict JSON",
                structure: {
                    weeklyPlan: [{
                        day: "string",
                        meals: [{
                            name: "string",
                            time: "string",
                            foods: ["string"],
                            calories: "number",
                            protein: "number",
                            carbs: "number",
                            fats: "number",
                            notes: "string"
                        }],
                        totalCalories: "number",
                        totalProtein: "number",
                        totalCarbs: "number",
                        totalFats: "number",
                        waterIntake: "number",
                        notes: "string"
                    }]
                },
                additionalRequirements: {
                    dietaryPreference: client.dietPreference || "None specified",
                    calorieTarget: `Approximately ${client.calorieTarget || "maintenance"} calories`,
                    foodVariety: "Include diverse foods to prevent boredom"
                }
            },
            client: {
                height: `${client.height} cm`,
                weight: `${client.weight} kg`,
                fitnessGoal: client.fitnessGoal,
                activityLevel: client.activityLevel,
                dietPreference: client.dietPreference || 'No specific preference',
                healthConditions: client.healthConditions?.join(', ') || 'None',
                waterIntakeGoal: `${client.waterIntake || 2000} ml`,
                foodAllergies: client.foodAllergies?.join(', ') || 'None',
                calorieTarget: client.calorieTarget || "Not specified"
            },
            examples: {
                validResponse: {
                    weeklyPlan: [{
                        day: "Monday",
                        meals: [{
                            name: "Breakfast",
                            time: "8:00 AM",
                            foods: ["Oatmeal", "Banana", "Almond Butter"],
                            calories: 400,
                            protein: 15,
                            carbs: 60,
                            fats: 10,
                            notes: "Use almond milk for oatmeal"
                        }],
                        totalCalories: 2000,
                        totalProtein: 150,
                        totalCarbs: 200,
                        totalFats: 70,
                        waterIntake: 2500,
                        notes: "Increase water intake if feeling thirsty"
                    }]
                }
            }
        });
    }

    public async shutdown(): Promise<void> {
        // Stop all cron jobs
        for (const [_, job] of this.cronJobs) {
            job.stop();
        }
        this.cronJobs.clear();
        
        // Disconnect Redis
        await this.redis.quit();
    }
}
function parseRetryDelay(delay: string): number {
    const value = parseFloat(delay);
    if (delay.endsWith('s')) return value * 1000;
    if (delay.endsWith('ms')) return value;
    return value * 1000; // Default to seconds
}