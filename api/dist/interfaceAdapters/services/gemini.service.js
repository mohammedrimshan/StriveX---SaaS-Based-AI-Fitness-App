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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiService = void 0;
const tsyringe_1 = require("tsyringe");
const generative_ai_1 = require("@google/generative-ai");
const config_1 = require("@/shared/config");
const ioredis_1 = __importDefault(require("ioredis"));
const cron_1 = require("cron");
const jsonrepair_1 = require("jsonrepair");
let GeminiService = class GeminiService {
    constructor() {
        this.cronJobs = new Map();
        this.genAI = new generative_ai_1.GoogleGenerativeAI(config_1.config.gemini.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
            },
        });
        try {
            this.redis = new ioredis_1.default({
                host: config_1.config.redis.REDIS_HOST,
                port: config_1.config.redis.REDIS_PORT,
                password: config_1.config.redis.REDIS_PASS,
                connectTimeout: 10000,
                maxRetriesPerRequest: 3,
            });
            console.log("Redis connection initialized");
        }
        catch (error) {
            console.error("Failed to initialize Redis:", error);
            throw error;
        }
        this.setupCleanupJob();
    }
    generateDietPlan(client) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Entering generateDietPlan for client:", client.clientId);
            const cacheKey = `diet:${client.clientId}`;
            try {
                const cached = yield this.getCachedPlan(cacheKey, client);
                if (cached) {
                    console.log("Returning cached diet plan for client:", client.clientId, JSON.stringify(cached, null, 2));
                    return cached;
                }
            }
            catch (error) {
                console.error("Error checking diet cache:", error);
            }
            if (yield this.checkDuplicateRequest(cacheKey)) {
                console.error("Duplicate diet request detected for client:", client.clientId);
                throw new Error("Duplicate request detected. Please wait for the previous request to complete.");
            }
            try {
                yield this.setRequestInProgress(cacheKey);
                const prompt = this.createDietPrompt(client);
                console.log("Sending diet prompt for client:", client.clientId, prompt);
                const result = yield this.retryGenerateContent(prompt);
                const rawResponse = result.response.text();
                console.log("Raw diet response for client:", client.clientId, rawResponse);
                const { response: cleanedResponse, wasRepaired } = yield this.cleanAndValidateResponse(rawResponse);
                const parsedPlan = this.parseDietResponse(cleanedResponse);
                if (wasRepaired) {
                    console.warn("Diet response required repair for client:", client.clientId);
                }
                console.log("Final diet plan structure for client:", client.clientId, JSON.stringify(parsedPlan, null, 2));
                const plan = this.formatDietPlan(client, parsedPlan);
                yield this.cachePlan(cacheKey, plan);
                this.setupAutoRegeneration(client, "diet");
                console.log("Diet plan generated successfully for client:", client.clientId);
                return plan;
            }
            catch (error) {
                console.error("Error in generateDietPlan, attempting fallback for client:", client.clientId, error);
                const defaultPlan = this.createDefaultDietPlan(client);
                yield this.cachePlan(cacheKey, defaultPlan);
                console.log("Fallback diet plan generated for client:", client.clientId);
                return defaultPlan;
            }
            finally {
                try {
                    yield this.clearRequestInProgress(cacheKey);
                }
                catch (error) {
                    console.error("Error clearing diet in-progress flag:", error);
                }
            }
        });
    }
    generateWorkoutPlan(client) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Entering generateWorkoutPlan for client:", client.clientId);
            const cacheKey = `workout:${client.clientId}`;
            try {
                const cached = yield this.getCachedPlan(cacheKey, client);
                if (cached) {
                    console.log("Returning cached workout plan for client:", client.clientId, JSON.stringify(cached, null, 2));
                    return cached;
                }
            }
            catch (error) {
                console.error("Error checking workout cache:", error);
            }
            if (yield this.checkDuplicateRequest(cacheKey)) {
                console.error("Duplicate workout request detected for client:", client.clientId);
                throw new Error("Duplicate request detected. Please wait for the previous request to complete.");
            }
            try {
                yield this.setRequestInProgress(cacheKey);
                const prompt = this.createWorkoutPrompt(client);
                console.log("Sending workout prompt for client:", client.clientId, prompt);
                const result = yield this.retryGenerateContent(prompt);
                const rawResponse = result.response.text();
                console.log("Raw workout response for client:", client.clientId, rawResponse);
                const { response: cleanedResponse, wasRepaired } = yield this.cleanAndValidateResponse(rawResponse);
                const parsedPlan = this.parseWorkoutResponse(cleanedResponse);
                if (wasRepaired) {
                    console.warn("Workout response required repair for client:", client.clientId);
                }
                console.log("Final workout plan structure for client:", client.clientId, JSON.stringify(parsedPlan, null, 2));
                const plan = this.formatWorkoutPlan(client, parsedPlan);
                yield this.cachePlan(cacheKey, plan);
                this.setupAutoRegeneration(client, "workout");
                console.log("Workout plan generated successfully for client:", client.clientId);
                return plan;
            }
            catch (error) {
                this.logError(error, "workout", client);
                throw this.createServiceError(error, "workout plan");
            }
            finally {
                try {
                    yield this.clearRequestInProgress(cacheKey);
                }
                catch (error) {
                    console.error("Error clearing workout in-progress flag:", error);
                }
            }
        });
    }
    createDietPrompt(client) {
        var _a, _b;
        const calorieTarget = Number(client.calorieTarget) || 2000;
        const healthConditions = ((_a = client.healthConditions) === null || _a === void 0 ? void 0 : _a.join(", ")) || "None";
        const dietaryRestrictions = healthConditions.includes("diabetes") ||
            healthConditions.includes("heart-disease")
            ? "Ensure meals are low in added sugars, saturated fats, and sodium, suitable for diabetes and heart-disease management."
            : "Follow standard balanced diet guidelines.";
        const prompt = JSON.stringify({
            instruction: `Generate a detailed 7-day diet plan for a client. Ensure the response is valid JSON with a non-empty weeklyPlan containing exactly 7 days, each with at least 3 meals (breakfast, lunch, dinner). ${dietaryRestrictions}`,
            requirements: {
                format: "strict JSON",
                structure: {
                    weeklyPlan: [
                        {
                            day: "string",
                            meals: [
                                {
                                    name: "string",
                                    time: "string",
                                    foods: ["string"],
                                    calories: "number",
                                    protein: "number",
                                    carbs: "number",
                                    fats: "number",
                                    notes: "string",
                                },
                            ],
                            totalCalories: "number",
                            totalProtein: "number",
                            totalCarbs: "number",
                            totalFats: "number",
                            waterIntake: "number",
                            notes: "string",
                        },
                    ],
                },
                additionalRequirements: {
                    dietaryPreference: client.dietPreference || "balanced",
                    calorieTarget: `Strictly ${calorieTarget} calories per day, even with ${healthConditions}`,
                    foodVariety: "Include diverse foods to prevent boredom",
                    nonEmpty: "Ensure weeklyPlan contains exactly 7 days with at least 3 meals per day (breakfast, lunch, dinner)",
                    jsonValidity: "Ensure the response is valid JSON with no unescaped quotes, missing commas, or trailing commas",
                    mandatoryFields: "Include totalCarbs and totalFats as numeric values (in grams) for each day, calculated as the sum of carbs and fats from meals. These fields are required and must not be null or undefined.",
                },
            },
            client: {
                height: `${client.height} cm`,
                weight: `${client.weight} kg`,
                fitnessGoal: client.fitnessGoal,
                activityLevel: client.activityLevel,
                dietPreference: client.dietPreference || "balanced",
                healthConditions: healthConditions,
                waterIntakeGoal: `${client.waterIntake || 2000} ml`,
                foodAllergies: ((_b = client.foodAllergies) === null || _b === void 0 ? void 0 : _b.join(", ")) || "None",
                calorieTarget: calorieTarget,
            },
            examples: {
                validResponse: {
                    weeklyPlan: [
                        {
                            day: "Monday",
                            meals: [
                                {
                                    name: "Breakfast",
                                    time: "8:00 AM",
                                    foods: ["Oatmeal", "Banana", "Almond Butter"],
                                    calories: 400,
                                    protein: 15,
                                    carbs: 60,
                                    fats: 10,
                                    notes: "Use almond milk for oatmeal, no added sugar",
                                },
                                {
                                    name: "Lunch",
                                    time: "12:00 PM",
                                    foods: ["Grilled Chicken Salad", "Olive Oil Dressing"],
                                    calories: 500,
                                    protein: 30,
                                    carbs: 20,
                                    fats: 25,
                                    notes: "Include mixed greens, use low-sodium dressing",
                                },
                                {
                                    name: "Dinner",
                                    time: "6:00 PM",
                                    foods: ["Salmon", "Quinoa", "Steamed Broccoli"],
                                    calories: 600,
                                    protein: 35,
                                    carbs: 50,
                                    fats: 20,
                                    notes: "Season with lemon, avoid butter",
                                },
                            ],
                            totalCalories: calorieTarget,
                            totalProtein: 80,
                            totalCarbs: 130,
                            totalFats: 55,
                            waterIntake: 3800,
                            notes: "Ensure adequate hydration",
                        },
                    ],
                },
            },
        });
        console.log("Created diet prompt:", prompt);
        return prompt;
    }
    createWorkoutPrompt(client) {
        var _a, _b, _c, _d, _e, _f;
        const preferredWorkout = ((_a = client.preferredWorkout) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || "general";
        const isTimeBasedCategory = ["yoga", "meditation", "pilates"].includes(preferredWorkout);
        const isMixedCategory = [
            "cardio",
            "calisthenics",
            "weighttraining",
            "general",
        ].includes(preferredWorkout);
        const equipmentInstruction = preferredWorkout === "yoga"
            ? "Exercises must not require any equipment except a yoga mat. Focus on bodyweight yoga poses and flows suitable for the client's experience level."
            : preferredWorkout === "meditation"
                ? "Exercises must not require any equipment. Focus on mindfulness and breathing techniques."
                : preferredWorkout === "pilates"
                    ? "Exercises may use a mat or small equipment like resistance bands. Focus on controlled movements and core engagement."
                    : preferredWorkout === "cardio"
                        ? "Exercises may include bodyweight movements or equipment like treadmills or bikes if specified. Focus on endurance and interval-based activities."
                        : preferredWorkout === "calisthenics"
                            ? "Exercises must be bodyweight-based, with optional use of pull-up bars or parallel bars. Focus on strength and functional movements."
                            : preferredWorkout === "weighttraining"
                                ? "Exercises may use weights, barbells, or machines if specified. Focus on strength and hypertrophy."
                                : `Exercises may use available equipment: ${((_b = client.equipmentAvailable) === null || _b === void 0 ? void 0 : _b.join(", ")) || "Basic"}.`;
        const repsInstruction = isTimeBasedCategory
            ? "Reps must be specified as a string in the format 'X seconds', 'X minutes', or descriptive (e.g., '100 pulses' for Pilates). Ensure clarity in notes if needed."
            : `Reps must be specified as a number (e.g., 10) or a range (e.g., '10-12') for most exercises. For time-based exercises (e.g., planks, isometric holds, or cardio intervals in ${preferredWorkout}), use a string like 'X seconds' or 'X minutes' and include details in the notes field (e.g., 'Hold for 30 seconds'). For exercises performed per leg (e.g., lunges), include 'per leg' in the notes field, not in reps. Do not use phrases like 'As many as' or 'AMRAP'; instead, use a numeric value or range and add 'As many reps as possible' to the notes field if applicable.`;
        const categoryInstruction = isTimeBasedCategory
            ? `Generate a comprehensive 7-day ${preferredWorkout} plan. All days must focus exclusively on ${preferredWorkout}, with progressive difficulty and variety suitable for ${preferredWorkout}. ${equipmentInstruction} ${repsInstruction}`
            : `Generate a balanced 7-day ${preferredWorkout} plan with varied focus areas. Allow time-based reps for specific exercises like planks, isometric holds, or cardio intervals, following the reps rules above. ${equipmentInstruction} ${repsInstruction}`;
        const prompt = JSON.stringify({
            instruction: `Generate a detailed 7-day workout plan in strict JSON format for a client with the following details. ${categoryInstruction}`,
            requirements: {
                format: "strict JSON",
                structure: {
                    weeklyPlan: [
                        {
                            day: "string",
                            focus: "string",
                            exercises: [
                                {
                                    name: "string",
                                    sets: "number",
                                    reps: isTimeBasedCategory ? "string" : "number | string",
                                    restTime: "string",
                                    notes: "string",
                                },
                            ],
                            warmup: "string",
                            cooldown: "string",
                            duration: "string",
                            intensity: "string",
                        },
                    ],
                },
                additionalRequirements: isTimeBasedCategory
                    ? {
                        consistency: `All days must be ${preferredWorkout} focused`,
                        progression: "Include progressive difficulty through the week",
                        variety: `Include different styles/variations of ${preferredWorkout}`,
                        equipment: preferredWorkout === "yoga"
                            ? "No equipment except a yoga mat; focus on yoga poses and flows"
                            : preferredWorkout === "meditation"
                                ? "No equipment; focus on mindfulness techniques"
                                : preferredWorkout === "pilates"
                                    ? "Use a mat or small equipment; focus on controlled movements"
                                    : `Use available equipment: ${((_c = client.equipmentAvailable) === null || _c === void 0 ? void 0 : _c.join(", ")) || "Basic"}`,
                        jsonValidity: "Ensure the response is valid JSON with no unescaped quotes, missing commas, or trailing commas. Reps may include descriptive strings (e.g., '100 pulses') for yoga, meditation, or pilates.",
                    }
                    : {
                        variety: preferredWorkout === "cardio"
                            ? "Include a mix of steady-state and interval-based cardio exercises"
                            : preferredWorkout === "calisthenics"
                                ? "Include a mix of bodyweight strength and isometric exercises"
                                : preferredWorkout === "weighttraining"
                                    ? "Include a mix of compound and isolation strength exercises"
                                    : "Include a mix of strength, cardio, and flexibility exercises, with yoga/pilates/cardio exercises allowing time-based reps where applicable",
                        equipment: `Use available equipment: ${((_d = client.equipmentAvailable) === null || _d === void 0 ? void 0 : _d.join(", ")) || "Basic"}`,
                        jsonValidity: "Ensure the response is valid JSON with no unescaped quotes, missing commas, or trailing commas. Reps must be a number (e.g., 10) or a range (e.g., '10-12') unless the exercise is a time-based movement (e.g., plank, cardio interval), where strings like 'X seconds' are allowed.",
                    },
            },
            client: {
                height: `${client.height} cm`,
                weight: `${client.weight} kg`,
                fitnessGoal: client.fitnessGoal,
                experienceLevel: client.experienceLevel,
                preferredWorkout: preferredWorkout,
                activityLevel: client.activityLevel,
                healthConditions: ((_e = client.healthConditions) === null || _e === void 0 ? void 0 : _e.join(", ")) || "None",
                availableEquipment: preferredWorkout === "yoga"
                    ? ["yoga mat"]
                    : preferredWorkout === "pilates"
                        ? ["mat", "resistance bands"]
                        : preferredWorkout === "calisthenics"
                            ? ["pull-up bar", "parallel bars"]
                            : preferredWorkout === "weighttraining"
                                ? ["dumbbells", "barbells", "bench"]
                                : ((_f = client.equipmentAvailable) === null || _f === void 0 ? void 0 : _f.join(", ")) || "Basic",
            },
            examples: {
                validResponse: {
                    weeklyPlan: [
                        {
                            day: "Monday",
                            focus: isTimeBasedCategory
                                ? `${preferredWorkout} Basics`
                                : preferredWorkout === "cardio"
                                    ? "Cardio Endurance"
                                    : preferredWorkout === "calisthenics"
                                        ? "Bodyweight Strength"
                                        : preferredWorkout === "weighttraining"
                                            ? "Strength Training"
                                            : "Full Body Strength",
                            exercises: this.getCategoryExerciseExample(preferredWorkout),
                            warmup: isTimeBasedCategory
                                ? `5 min gentle ${preferredWorkout} stretches`
                                : "10 min dynamic stretching",
                            cooldown: isTimeBasedCategory
                                ? `5 min ${preferredWorkout}-specific relaxation`
                                : "5 min static stretching",
                            duration: isTimeBasedCategory ? "45 minutes" : "60 minutes",
                            intensity: "Moderate",
                        },
                    ],
                },
            },
        });
        console.log("Created workout prompt:", prompt);
        return prompt;
    }
    parseDietResponse(response) {
        console.log("Parsing diet response:", response);
        try {
            const parsed = JSON.parse(response);
            if (!parsed.weeklyPlan ||
                !Array.isArray(parsed.weeklyPlan) ||
                parsed.weeklyPlan.length !== 7) {
                console.warn("Diet response has invalid weeklyPlan:", parsed);
                throw new Error("Diet plan must contain exactly 7 days");
            }
            for (let i = 0; i < parsed.weeklyPlan.length; i++) {
                const day = parsed.weeklyPlan[i];
                if (!day.day || typeof day.day !== "string") {
                    console.warn(`Day ${i} missing valid day field:`, day);
                    throw new Error(`Day ${i} must have a valid day string`);
                }
                if (!day.meals || !Array.isArray(day.meals) || day.meals.length < 3) {
                    console.warn(`Day ${day.day} has insufficient meals:`, day.meals);
                    throw new Error(`Day ${day.day} must have at least 3 meals`);
                }
                if (typeof day.totalCalories !== "number" ||
                    typeof day.totalProtein !== "number" ||
                    typeof day.totalCarbs !== "number" ||
                    typeof day.totalFats !== "number" ||
                    typeof day.waterIntake !== "number") {
                    console.warn(`Day ${day.day} missing required numeric fields:`, day);
                    throw new Error(`Day ${day.day} missing totalCalories, totalProtein, totalCarbs, totalFats, or waterIntake`);
                }
                for (const meal of day.meals) {
                    if (!meal.name ||
                        !meal.time ||
                        !Array.isArray(meal.foods) ||
                        typeof meal.calories !== "number" ||
                        typeof meal.protein !== "number" ||
                        typeof meal.carbs !== "number" ||
                        typeof meal.fats !== "number") {
                        console.warn(`Invalid meal in day ${day.day}:`, meal);
                        throw new Error(`Invalid meal structure in day ${day.day}`);
                    }
                }
            }
            console.log("Diet response parsed successfully:", parsed);
            return parsed;
        }
        catch (error) {
            console.error("Failed to parse diet response:", error, "Response:", response);
            throw error;
        }
    }
    parseWorkoutResponse(response) {
        console.log("Parsing workout response:", response);
        try {
            const parsed = JSON.parse(response);
            if (!parsed.weeklyPlan ||
                !Array.isArray(parsed.weeklyPlan) ||
                parsed.weeklyPlan.length === 0) {
                console.warn("Workout response has empty or invalid weeklyPlan:", parsed);
                throw new Error("Empty or invalid workout plan received");
            }
            for (let i = 0; i < parsed.weeklyPlan.length; i++) {
                const day = parsed.weeklyPlan[i];
                if (!day.day || typeof day.day !== "string") {
                    console.warn(`Day ${i} missing valid day field:`, day);
                    throw new Error(`Day ${i} must have a valid day string`);
                }
                if (!day.exercises || !Array.isArray(day.exercises)) {
                    console.warn(`Day ${day.day || i} has invalid exercises array:`, day);
                    throw new Error(`Day ${day.day || i} must have a valid exercises array`);
                }
                // Allow empty exercises array for rest days
                if (day.exercises.length === 0 &&
                    !["Rest", "Active Rest"].includes(day.focus)) {
                    console.warn(`Day ${day.day || i} has no exercises and is not a rest day:`, day);
                    throw new Error(`Day ${day.day || i} must have at least one exercise unless it is a Rest or Active Rest day`);
                }
                const isTimeBasedDay = [
                    "yoga",
                    "meditation",
                    "pilates",
                    "core",
                    "flexibility",
                ].some((type) => (day.focus || "").toLowerCase().includes(type));
                const timeBasedExercises = [
                    "plank",
                    "side plank",
                    "hold",
                    "mountain climbers",
                    "high knees",
                    "burpees",
                    "sprint",
                    "interval",
                    "wall sit",
                    "hundred",
                ];
                for (let j = 0; j < day.exercises.length; j++) {
                    const exercise = day.exercises[j];
                    if (!exercise.name ||
                        typeof exercise.sets !== "number" ||
                        !exercise.reps ||
                        !exercise.restTime) {
                        console.warn(`Invalid exercise in day ${day.day || i}, index ${j}:`, exercise);
                        throw new Error(`Invalid exercise structure in day ${day.day || i}`);
                    }
                    // Validate and fix reps
                    const isTimeBasedExercise = timeBasedExercises.some((ex) => exercise.name.toLowerCase().includes(ex));
                    if (typeof exercise.reps === "string") {
                        if ((isTimeBasedDay || isTimeBasedExercise) &&
                            /^\d+\s*(seconds|minutes|pulses)$|^\d+-\d+\s*(seconds|minutes)$|^\d+\s*reps$/.test(exercise.reps)) {
                            // Allow time-based or descriptive reps for Yoga, Meditation, Pilates, or specific exercises
                            continue;
                        }
                        else if (/^\d+$|^\d+-\d+$/.test(exercise.reps)) {
                            // Valid number or range
                            continue;
                        }
                        else if (exercise.reps.toLowerCase() === "amrap") {
                            exercise.notes =
                                (exercise.notes || "") + " As many reps as possible";
                            exercise.reps = "10-12"; // Default range for AMRAP
                            console.warn(`Fixed AMRAP reps in day ${day.day || i}, exercise ${j}:`, exercise);
                        }
                        else {
                            const match = exercise.reps.match(/^(\d+)/); // Try to extract a number
                            if (match) {
                                exercise.reps = parseInt(match[1]);
                                exercise.notes =
                                    (exercise.notes || "") + ` (originally ${exercise.reps})`;
                            }
                            else {
                                exercise.reps = "10-12"; // Default range
                                exercise.notes =
                                    (exercise.notes || "") + ` (invalid reps: ${exercise.reps})`;
                            }
                            console.warn(`Fixed invalid reps in day ${day.day || i}, exercise ${j}:`, exercise);
                        }
                    }
                }
            }
            console.log("Workout response parsed successfully:", parsed);
            return parsed;
        }
        catch (error) {
            console.error("Failed to parse workout response:", error, "Response:", response);
            throw error;
        }
    }
    formatDietPlan(client, planData) {
        const weeklyPlan = planData.weeklyPlan.map((day, index) => {
            var _a, _b, _c, _d;
            const calculatedCarbs = ((_a = day.meals) === null || _a === void 0 ? void 0 : _a.reduce((sum, meal) => sum + (Number(meal.carbs) || 0), 0)) || 100;
            const calculatedFats = ((_b = day.meals) === null || _b === void 0 ? void 0 : _b.reduce((sum, meal) => sum + (Number(meal.fats) || 0), 0)) || 50;
            const calculatedCalories = ((_c = day.meals) === null || _c === void 0 ? void 0 : _c.reduce((sum, meal) => sum + (Number(meal.calories) || 0), 0)) || 2000;
            const calculatedProtein = ((_d = day.meals) === null || _d === void 0 ? void 0 : _d.reduce((sum, meal) => sum + (Number(meal.protein) || 0), 0)) || 80;
            if (typeof day.totalCarbs !== "number") {
                console.warn(`Day ${day.day || index} missing totalCarbs, using calculated: ${calculatedCarbs}`);
                day.totalCarbs = calculatedCarbs;
            }
            if (typeof day.totalFats !== "number") {
                console.warn(`Day ${day.day || index} missing totalFats, using calculated: ${calculatedFats}`);
                day.totalFats = calculatedFats;
            }
            if (typeof day.totalCalories !== "number") {
                console.warn(`Day ${day.day || index} missing totalCalories, using calculated: ${calculatedCalories}`);
                day.totalCalories = calculatedCalories;
            }
            if (typeof day.totalProtein !== "number") {
                console.warn(`Day ${day.day || index} missing totalProtein, using calculated: ${calculatedProtein}`);
                day.totalProtein = calculatedProtein;
            }
            const meals = day.meals.map((meal) => ({
                name: meal.name || "Unnamed Meal",
                time: meal.time || "12:00 PM",
                foods: Array.isArray(meal.foods) ? meal.foods : ["Unknown Food"],
                calories: Number(meal.calories) || 300,
                protein: Number(meal.protein) || 10,
                carbs: Number(meal.carbs) || 30,
                fats: Number(meal.fats) || 10,
                notes: meal.notes || "",
            }));
            return {
                day: day.day || `Day ${index + 1}`,
                meals,
                totalCalories: Number(day.totalCalories),
                totalProtein: Number(day.totalProtein),
                totalCarbs: Number(day.totalCarbs),
                totalFats: Number(day.totalFats),
                waterIntake: Number(day.waterIntake) || 2000,
                notes: day.notes || "Generated diet plan",
            };
        });
        if (weeklyPlan.length !== 7) {
            console.warn(`Weekly plan has ${weeklyPlan.length} days, expected 7. Falling back to default for missing days.`);
            const defaultPlan = this.createDefaultDietPlan(client);
            while (weeklyPlan.length < 7) {
                weeklyPlan.push(defaultPlan.weeklyPlan[weeklyPlan.length % 7]);
            }
        }
        const plan = {
            clientId: client.clientId,
            title: `${client.firstName || "Client"}'s ${client.dietPreference ? client.dietPreference + " " : ""}Diet Plan`,
            description: `Custom diet plan based on ${client.fitnessGoal || "general health"} goal`,
            weeklyPlan,
            createdAt: new Date(),
            updatedAt: new Date(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        };
        console.log("Formatted diet plan:", JSON.stringify(plan, null, 2));
        return plan;
    }
    formatWorkoutPlan(client, planData) {
        const category = client.preferredWorkout || "General";
        const weeklyPlan = planData.weeklyPlan.map((day) => (Object.assign(Object.assign({}, day), { exercises: day.exercises.map((exercise) => ({
                name: exercise.name || "Unnamed Exercise",
                sets: Number(exercise.sets) || 3,
                reps: exercise.reps || "10",
                restTime: exercise.restTime || "60 seconds",
                notes: exercise.notes || "",
            })), warmup: day.warmup || "5 min light stretching", cooldown: day.cooldown || "5 min static stretching", duration: day.duration || "45 minutes", intensity: day.intensity || "Moderate" })));
        const plan = {
            clientId: client.clientId,
            title: `${client.firstName || "Client"}'s ${category} Workout Plan`,
            description: `Custom ${category} workout plan based on ${client.fitnessGoal || "general fitness"} goal`,
            weeklyPlan,
            createdAt: new Date(),
            updatedAt: new Date(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        };
        console.log("Formatted workout plan:", JSON.stringify(plan, null, 2));
        return plan;
    }
    createDefaultDietPlan(client) {
        console.log("Generating default diet plan for client:", client.clientId);
        const calorieTarget = Number(client.calorieTarget) || 2000;
        const daysOfWeek = [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
        ];
        const weeklyPlan = daysOfWeek.map((day) => {
            const meals = [
                {
                    name: "Breakfast",
                    time: "8:00 AM",
                    foods: ["Oatmeal", "Fresh Berries", "Almond Milk"],
                    calories: 350,
                    protein: 12,
                    carbs: 55,
                    fats: 8,
                    notes: "Use unsweetened almond milk, no added sugar",
                },
                {
                    name: "Lunch",
                    time: "12:00 PM",
                    foods: [
                        "Grilled Chicken Salad",
                        "Olive Oil Dressing",
                        "Whole Grain Bread",
                    ],
                    calories: 450,
                    protein: 25,
                    carbs: 35,
                    fats: 15,
                    notes: "Use low-sodium dressing, include mixed greens",
                },
                {
                    name: "Dinner",
                    time: "6:00 PM",
                    foods: ["Baked Salmon", "Quinoa", "Steamed Broccoli"],
                    calories: 500,
                    protein: 30,
                    carbs: 40,
                    fats: 20,
                    notes: "Season with herbs, avoid butter",
                },
            ];
            return {
                day,
                meals,
                totalCalories: meals.reduce((sum, meal) => sum + meal.calories, 0),
                totalProtein: meals.reduce((sum, meal) => sum + meal.protein, 0),
                totalCarbs: meals.reduce((sum, meal) => sum + meal.carbs, 0),
                totalFats: meals.reduce((sum, meal) => sum + meal.fats, 0),
                waterIntake: client.waterIntake || 2000,
                notes: `Default plan for ${day}, suitable for diabetes and heart-disease`,
            };
        });
        const plan = {
            clientId: client.clientId,
            title: `${client.firstName || "Client"}'s Default Diet Plan`,
            description: `Default diet plan for ${client.fitnessGoal || "general health"}`,
            weeklyPlan,
            createdAt: new Date(),
            updatedAt: new Date(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        };
        console.log("Default diet plan created:", JSON.stringify(plan, null, 2));
        return plan;
    }
    cleanAndValidateResponse(rawResponse_1) {
        return __awaiter(this, arguments, void 0, function* (rawResponse, retries = 3) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            console.log("Cleaning and validating response:", rawResponse);
            try {
                const parsed = JSON.parse(rawResponse);
                console.log("Response is valid JSON");
                return { response: rawResponse, wasRepaired: false };
            }
            catch (initialError) {
                console.error("Initial JSON parse failed:", initialError, "Position:", (_a = initialError.message.match(/position (\d+)/)) === null || _a === void 0 ? void 0 : _a[1]);
                console.error("Error context:", rawResponse.substring(Math.max(0, Number((_b = initialError.message.match(/position (\d+)/)) === null || _b === void 0 ? void 0 : _b[1]) - 50), Number((_c = initialError.message.match(/position (\d+)/)) === null || _c === void 0 ? void 0 : _c[1]) + 50));
            }
            let cleaned = rawResponse
                .replace(/```(json)?\s*/g, "") // Remove code block markers
                .replace(/```\s*/g, "")
                .replace(/\n\s*/g, "") // Remove newlines
                .trim();
            console.log("Cleaned response:", cleaned);
            try {
                const repaired = (0, jsonrepair_1.jsonrepair)(cleaned);
                const parsed = JSON.parse(repaired);
                console.log("Cleaned response is valid JSON");
                return { response: cleaned, wasRepaired: true };
            }
            catch (cleaningError) {
                console.error("Cleaned JSON parse failed:", cleaningError, "Position:", (_d = cleaningError.message.match(/position (\d+)/)) === null || _d === void 0 ? void 0 : _d[1]);
                console.error("Error context:", cleaned.substring(Math.max(0, Number((_e = cleaningError.message.match(/position (\d+)/)) === null || _e === void 0 ? void 0 : _e[1]) - 50), Number((_f = cleaningError.message.match(/position (\d+)/)) === null || _f === void 0 ? void 0 : _f[1]) + 50));
            }
            if (retries > 0) {
                console.log(`Retrying JSON validation, ${retries} attempts left`);
                return this.cleanAndValidateResponse(rawResponse, retries - 1);
            }
            const repaired = this.repairMalformedJson(cleaned);
            console.log("Repaired response:", repaired);
            try {
                const parsed = JSON.parse(repaired);
                if (!parsed.weeklyPlan ||
                    !Array.isArray(parsed.weeklyPlan) ||
                    parsed.weeklyPlan.length === 0) {
                    console.error("Repaired JSON is valid but has empty or invalid weeklyPlan:", parsed);
                    throw new Error("Invalid plan structure");
                }
                console.log("Repaired response is valid JSON");
                return { response: repaired, wasRepaired: true };
            }
            catch (repairError) {
                console.error("JSON repair failed:", repairError, "Position:", (_g = repairError.message.match(/position (\d+)/)) === null || _g === void 0 ? void 0 : _g[1]);
                console.error("Error context:", repaired.substring(Math.max(0, Number((_h = repairError.message.match(/position (\d+)/)) === null || _h === void 0 ? void 0 : _h[1]) - 50), Number((_j = repairError.message.match(/position (\d+)/)) === null || _j === void 0 ? void 0 : _j[1]) + 50));
                throw new Error("Invalid JSON response from Gemini API");
            }
        });
    }
    repairMalformedJson(jsonString) {
        console.log("Attempting to repair JSON:", jsonString.substring(0, 1000) + (jsonString.length > 1000 ? "..." : ""));
        try {
            const jsonStart = jsonString.indexOf("{");
            const jsonEnd = jsonString.lastIndexOf("}") + 1;
            if (jsonStart >= 0 && jsonEnd > jsonStart) {
                jsonString = jsonString.substring(jsonStart, jsonEnd);
            }
            let repaired = jsonString;
            repaired = repaired.replace(/"reps":\s*"(\d+)\s*per\s*leg"/g, (match, num) => {
                return `"reps": ${num}, "notes": "Per leg"`;
            });
            repaired = repaired
                .replace(/([{,\[]\s*)([a-zA-Z_][a-zA-Z0-9_]*)(\s*:)/g, '$1"$2"$3') // Quote unquoted keys
                .replace(/'([^']+)'/g, '"$1"') // Replace single quotes with double quotes
                .replace(/,\s*([}\]])/g, "$1") // Remove trailing commas
                .replace(/([}\]])\s*([{\[])/g, "$1,$2") // Add missing commas between objects/arrays
                .replace(/\/\/.*?[\r\n]/g, "") // Remove comments
                .replace(/\/\*[\s\S]*?\*\//g, "") // Remove multi-line comments
                .replace(/\\"/g, '"') // Unescape quotes
                .replace(/}\s*{/g, "},{") // Add commas between objects
                .replace(/,+/g, ",") // Replace multiple commas with single
                .replace(/\]\s*\[/g, "],["); // Add commas between arrays
            // Specifically handle invalid reps values like "As many as"
            repaired = repaired.replace(/"reps":\s*"As many as[^"]*"/g, `"reps": "AMRAP", "notes": "As many reps as possible"`);
            repaired = repaired.replace(/"reps":\s*"[^0-9][^"]*"/g, (match) => {
                var _a;
                const notes = ((_a = match.match(/"reps":\s*"(.*?)"/)) === null || _a === void 0 ? void 0 : _a[1]) || "Invalid reps";
                return `"reps": "10", "notes": "Originally ${notes}"`;
            });
            try {
                const parsed = JSON.parse(repaired);
                if (!parsed.weeklyPlan || !Array.isArray(parsed.weeklyPlan)) {
                    console.error("Repaired JSON lacks valid weeklyPlan:", parsed);
                    throw new Error("Invalid repaired JSON structure");
                }
                return repaired;
            }
            catch (validationError) {
                console.error("Validation of repaired JSON failed:", validationError);
                const weeklyPlanMatch = jsonString.match(/"weeklyPlan"\s*:\s*\[([\s\S]*?)\]/);
                if (weeklyPlanMatch && weeklyPlanMatch[1]) {
                    const weeklyPlanContent = weeklyPlanMatch[1].trim();
                    repaired = `{"weeklyPlan": [${weeklyPlanContent}]}`;
                    JSON.parse(repaired);
                    console.log("Simplified repair succeeded");
                    return repaired;
                }
                throw validationError;
            }
        }
        catch (error) {
            console.error("JSON repair failed:", error);
            throw error;
        }
    }
    checkDuplicateRequest(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.redis.get(`${key}:in_progress`);
                console.log(`Checking duplicate request for key ${key}:`, result === "true");
                return result === "true";
            }
            catch (error) {
                console.error("Error checking duplicate request:", error);
                return false;
            }
        });
    }
    setRequestInProgress(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.redis.setex(`${key}:in_progress`, 300, "true");
                console.log(`Set in-progress flag for key ${key}`);
            }
            catch (error) {
                console.error("Error setting in-progress flag:", error);
            }
        });
    }
    clearRequestInProgress(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.redis.del(`${key}:in_progress`);
                console.log(`Cleared in-progress flag for key ${key}`);
            }
            catch (error) {
                console.error("Error clearing in-progress flag:", error);
            }
        });
    }
    cachePlan(key, plan) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.redis.setex(key, 604800, JSON.stringify(plan));
                console.log(`Cached plan for key ${key}`);
            }
            catch (error) {
                console.error("Error caching plan:", error);
            }
        });
    }
    getCachedPlan(key, client) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const cached = yield this.redis.get(key);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (parsed.weeklyPlan &&
                        Array.isArray(parsed.weeklyPlan) &&
                        parsed.weeklyPlan.length > 0) {
                        if (key.startsWith("diet:")) {
                            for (let i = 0; i < parsed.weeklyPlan.length; i++) {
                                const day = parsed.weeklyPlan[i];
                                if (typeof day.totalCarbs !== "number" ||
                                    typeof day.totalFats !== "number") {
                                    console.warn(`Invalid cached diet plan for key ${key}: Day ${day.day || i} missing totalCarbs or totalFats`);
                                    yield this.redis.del(key);
                                    return null;
                                }
                            }
                        }
                        else if (key.startsWith("workout:") && (client === null || client === void 0 ? void 0 : client.preferredWorkout)) {
                            const category = client.preferredWorkout.toLowerCase();
                            if (category === "yoga") {
                                for (let i = 0; i < parsed.weeklyPlan.length; i++) {
                                    const day = parsed.weeklyPlan[i];
                                    // Check if focus explicitly includes 'yoga' or related terms
                                    const focusLower = (day.focus || "").toLowerCase();
                                    if (!focusLower.includes("yoga") &&
                                        !focusLower.includes("vinyasa") &&
                                        !focusLower.includes("asana")) {
                                        console.warn(`Invalid cached workout plan for key ${key}: Day ${day.day || i} focus (${day.focus}) does not match yoga category`);
                                        yield this.redis.del(key);
                                        return null;
                                    }
                                    // Check for equipment-based exercises
                                    for (const exercise of day.exercises || []) {
                                        const nameLower = (exercise.name || "").toLowerCase();
                                        const equipmentTerms = [
                                            "dumbbell",
                                            "barbell",
                                            "machine",
                                            "weight",
                                            "kettlebell",
                                            "resistance band",
                                            "bench",
                                            "cable",
                                        ];
                                        if (equipmentTerms.some((term) => nameLower.includes(term))) {
                                            console.warn(`Invalid cached workout plan for key ${key}: Day ${day.day || i} includes equipment-based exercise: ${exercise.name}`);
                                            yield this.redis.del(key);
                                            return null;
                                        }
                                    }
                                }
                            }
                        }
                        console.log(`Retrieved valid cached plan for key ${key}`);
                        return parsed;
                    }
                    console.warn(`Cached plan for key ${key} is empty or invalid, clearing cache`);
                    yield this.redis.del(key);
                }
                console.log(`No valid cache found for key ${key}`);
                return null;
            }
            catch (error) {
                console.error("Error retrieving cached plan:", error);
                yield this.redis.del(key);
                return null;
            }
        });
    }
    setupCleanupJob() {
        const job = new cron_1.CronJob("0 3 * * *", () => __awaiter(this, void 0, void 0, function* () {
            try {
                const keys = yield this.redis.keys("*:in_progress");
                const pipeline = this.redis.pipeline();
                for (const key of keys) {
                    const ttl = yield this.redis.ttl(key);
                    if (ttl < 0) {
                        pipeline.del(key);
                    }
                }
                yield pipeline.exec();
                console.log(`Cleaned up ${keys.length} stale Redis keys`);
            }
            catch (error) {
                console.error("Failed to clean up Redis keys:", error);
            }
        }));
        job.start();
        console.log("Cleanup job scheduled");
    }
    setupAutoRegeneration(client, type) {
        const jobKey = `${type}:${client.clientId}:regeneration`;
        if (this.cronJobs.has(jobKey)) {
            console.log(`Auto-regeneration job already exists for ${jobKey}`);
            return;
        }
        const job = new cron_1.CronJob("0 6 */7 * *", () => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(`Starting auto-regeneration of ${type} plan for client ${client.clientId}`);
                if (type === "workout") {
                    yield this.generateWorkoutPlan(client);
                }
                else {
                    yield this.generateDietPlan(client);
                }
                console.log(`Successfully auto-regenerated ${type} plan for client ${client.clientId}`);
            }
            catch (error) {
                console.error(`Failed to auto-regenerate ${type} plan for client ${client.clientId}:`, error);
                setTimeout(() => {
                    this.setupAutoRegeneration(client, type);
                }, 3600000);
            }
        }), null, true, "UTC");
        this.cronJobs.set(jobKey, job);
        console.log(`Auto-regeneration job scheduled for ${jobKey}`);
    }
    retryGenerateContent(prompt_1) {
        return __awaiter(this, arguments, void 0, function* (prompt, maxRetries = 5) {
            console.log("Attempting to generate content with prompt:", prompt);
            let attempts = 0;
            let lastError;
            while (attempts < maxRetries) {
                try {
                    const result = yield this.model.generateContent(prompt);
                    console.log("Gemini API response received:", result.response.text());
                    return result;
                }
                catch (error) {
                    lastError = error;
                    attempts++;
                    console.error(`Generate content attempt ${attempts}/${maxRetries} failed:`, error);
                    if (this.isRateLimitError(error)) {
                        const delay = this.getRetryDelay(error);
                        console.warn(`Rate limited, retrying in ${delay}ms (attempt ${attempts}/${maxRetries})`);
                        yield this.sleep(delay);
                    }
                    else {
                        break;
                    }
                }
            }
            console.error("All retry attempts failed:", lastError);
            throw lastError || new Error("Failed to generate content");
        });
    }
    isRateLimitError(error) {
        const typedError = error;
        const isRateLimit = (typedError === null || typedError === void 0 ? void 0 : typedError.status) === 429;
        console.log("Checking rate limit error:", isRateLimit);
        return isRateLimit;
    }
    getRetryDelay(error) {
        var _a;
        const typedError = error;
        const retryInfo = (_a = typedError.errorDetails) === null || _a === void 0 ? void 0 : _a.find((d) => d["@type"] === "type.googleapis.com/google.rpc.RetryInfo");
        const delay = (retryInfo === null || retryInfo === void 0 ? void 0 : retryInfo.retryDelay)
            ? this.parseRetryDelay(retryInfo.retryDelay)
            : 5000;
        console.log("Calculated retry delay:", delay);
        return delay;
    }
    parseRetryDelay(delay) {
        const value = parseFloat(delay);
        if (delay.endsWith("s"))
            return value * 1000;
        if (delay.endsWith("ms"))
            return value;
        return value * 1000;
    }
    sleep(ms) {
        console.log(`Sleeping for ${ms}ms`);
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    logError(error, planType, client) {
        console.error(`Error generating ${planType} plan for client ${client.clientId}:`, {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            clientDetails: {
                id: client.clientId,
                height: client.height,
                weight: client.weight,
                goal: client.fitnessGoal,
            },
        });
    }
    createServiceError(error, planType) {
        const message = error instanceof Error ? error.message : `Failed to generate ${planType}`;
        const serviceError = new Error(message);
        serviceError.name = "GeminiServiceError";
        console.error("Service error created:", message);
        return serviceError;
    }
    getCategoryExerciseExample(category) {
        switch (category.toLowerCase()) {
            case "yoga":
                return [
                    {
                        name: "Downward Dog",
                        sets: 3,
                        reps: "30 seconds",
                        restTime: "15 seconds",
                        notes: "Focus on breath and alignment; use yoga mat",
                    },
                ];
            case "meditation":
                return [
                    {
                        name: "Mindful Breathing",
                        sets: 1,
                        reps: "10 minutes",
                        restTime: "N/A",
                        notes: "Focus on deep, steady breaths",
                    },
                ];
            case "pilates":
                return [
                    {
                        name: "The Hundred",
                        sets: 3,
                        reps: "100 pulses",
                        restTime: "30 seconds",
                        notes: "Engage core throughout",
                    },
                ];
            case "cardio":
                return [
                    {
                        name: "High Knees",
                        sets: 3,
                        reps: "30 seconds",
                        restTime: "30 seconds",
                        notes: "Maintain high intensity",
                    },
                    {
                        name: "Jumping Jacks",
                        sets: 3,
                        reps: "20",
                        restTime: "30 seconds",
                        notes: "Keep arms and legs coordinated",
                    },
                ];
            case "calisthenics":
                return [
                    {
                        name: "Plank",
                        sets: 3,
                        reps: "60 seconds",
                        restTime: "30 seconds",
                        notes: "Keep core engaged",
                    },
                    {
                        name: "Push-ups",
                        sets: 3,
                        reps: "10-12",
                        restTime: "60 seconds",
                        notes: "Use controlled motion",
                    },
                ];
            case "weighttraining":
                return [
                    {
                        name: "Deadlifts",
                        sets: 3,
                        reps: "8-10",
                        restTime: "90 seconds",
                        notes: "Maintain proper form",
                    },
                    {
                        name: "Isometric Squat Hold",
                        sets: 3,
                        reps: "30 seconds",
                        restTime: "60 seconds",
                        notes: "Hold at 90-degree knee angle",
                    },
                ];
            default:
                return [
                    {
                        name: "Squats",
                        sets: 3,
                        reps: "10-12",
                        restTime: "60 seconds",
                        notes: "Maintain proper form",
                    },
                    {
                        name: "Plank",
                        sets: 3,
                        reps: "30 seconds",
                        restTime: "60 seconds",
                        notes: "Keep core engaged",
                    },
                ];
        }
    }
    shutdown() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Shutting down GeminiService");
            for (const [_, job] of this.cronJobs) {
                job.stop();
            }
            this.cronJobs.clear();
            try {
                yield this.redis.quit();
                console.log("Redis connection closed");
            }
            catch (error) {
                console.error("Error closing Redis connection:", error);
            }
        });
    }
};
exports.GeminiService = GeminiService;
exports.GeminiService = GeminiService = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], GeminiService);
