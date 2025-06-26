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
exports.WorkoutRepository = void 0;
const tsyringe_1 = require("tsyringe");
const workout_model_1 = require("@/frameworks/database/mongoDB/models/workout.model");
const base_repository_1 = require("../base.repository");
let WorkoutRepository = class WorkoutRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(workout_model_1.WorkoutModel);
    }
    create(workout) {
        return __awaiter(this, void 0, void 0, function* () {
            const entity = yield this.model.create(workout);
            return this.mapToEntity(entity.toObject());
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const workout = yield this.model
                .findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true })
                .populate("category", "title")
                .lean()
                .exec();
            if (!workout)
                return null;
            return this.mapToEntity(workout);
        });
    }
    findAll(skip, limit, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const [workouts, total] = yield Promise.all([
                this.model
                    .find(filter)
                    .skip(skip)
                    .limit(limit)
                    .populate("category", "title")
                    .lean(),
                this.model.countDocuments(filter),
            ]);
            const transformedWorkouts = workouts.map((w) => this.mapToEntity(Object.assign(Object.assign({}, w), { category: w.category })));
            console.log(transformedWorkouts, `transformedWorkouts`);
            const page = Math.floor(skip / limit) + 1;
            const totalPages = Math.ceil(total / limit);
            return {
                data: transformedWorkouts,
                total,
                page,
                limit,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
                totalPages,
            };
        });
    }
    findByCategory(categoryId) {
        return __awaiter(this, void 0, void 0, function* () {
            const workouts = yield this.model
                .find({ category: categoryId, status: true })
                .lean()
                .exec();
            return workouts.map((w) => this.mapToEntity(w));
        });
    }
    updateStatus(id, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const workout = yield this.model
                .findByIdAndUpdate(id, { status }, { new: true })
                .lean({ virtuals: true })
                .exec();
            if (!workout)
                return null;
            return this.mapToEntity(workout);
        });
    }
    count(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.countDocuments(filter);
        });
    }
    updateExercises(workoutId, exerciseId, exerciseData) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateFields = {};
            for (const [key, value] of Object.entries(exerciseData)) {
                if (value !== undefined) {
                    updateFields[`exercises.$.${key}`] = value;
                }
            }
            const workout = yield this.model
                .findOneAndUpdate({ _id: workoutId, "exercises._id": exerciseId }, { $set: updateFields }, { new: true, runValidators: true }).populate("category", "title")
                .lean()
                .exec();
            if (!workout)
                return null;
            return this.mapToEntity(workout);
        });
    }
    deleteExercise(workoutId, exerciseId) {
        return __awaiter(this, void 0, void 0, function* () {
            const workout = yield this.model
                .findByIdAndUpdate(workoutId, { $pull: { exercises: { _id: exerciseId } } }, { new: true })
                .populate("category", "title")
                .lean()
                .exec();
            if (!workout)
                return null;
            return this.mapToEntity(workout);
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.model
                .findById(id)
                .populate("category", "title")
                .lean()
                .exec()
                .then((doc) => (doc ? this.mapToEntity(doc) : null));
        });
    }
};
exports.WorkoutRepository = WorkoutRepository;
exports.WorkoutRepository = WorkoutRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], WorkoutRepository);
