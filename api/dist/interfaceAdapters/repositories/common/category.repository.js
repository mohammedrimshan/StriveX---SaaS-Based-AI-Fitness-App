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
exports.CategoryRepository = void 0;
const tsyringe_1 = require("tsyringe");
const category_model_1 = require("@/frameworks/database/mongoDB/models/category.model");
const base_repository_1 = require("../base.repository");
const mongoose_1 = __importDefault(require("mongoose"));
const custom_error_1 = require("@/entities/utils/custom.error");
const constants_1 = require("@/shared/constants");
let CategoryRepository = class CategoryRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(category_model_1.CategoryModel);
    }
    find(filter, skip, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const [items, total] = yield Promise.all([
                this.model.find(Object.assign(Object.assign({}, filter), { status: true })).skip(skip).limit(limit).lean(),
                this.model.countDocuments(Object.assign(Object.assign({}, filter), { status: true })),
            ]);
            const mappedItems = items.map((cat) => this.mapToEntity(cat));
            return { items: mappedItems, total };
        });
    }
    findByTitle(title) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield category_model_1.CategoryModel.findOne({
                title: { $regex: new RegExp(`^${title.trim()}$`, "i") },
            });
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield category_model_1.CategoryModel.findById(id);
        });
    }
    findPaginatedCategory(filter, skip, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const [categories, total, all] = yield Promise.all([
                category_model_1.CategoryModel.find(filter)
                    .select("status title _id description metValue")
                    .skip(skip)
                    .limit(limit),
                category_model_1.CategoryModel.countDocuments(filter),
                category_model_1.CategoryModel.countDocuments(),
            ]);
            return {
                categories,
                total,
                all,
            };
        });
    }
    updateCategoryStatus(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                throw new custom_error_1.CustomError("Invalid Category ID format", constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            const result = yield category_model_1.CategoryModel.findByIdAndUpdate(id, [
                { $set: { status: { $not: "$status" } } },
            ]);
            if (!result) {
                throw new custom_error_1.CustomError("Category not found", constants_1.HTTP_STATUS.NOT_FOUND);
            }
        });
    }
    updateCategory(id, title, metValue, description) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedCategory = yield category_model_1.CategoryModel.findByIdAndUpdate(id, {
                $set: {
                    title,
                    metValue,
                    description: description !== undefined ? description : undefined,
                    updatedAt: new Date().toISOString(),
                },
            }, { new: true, runValidators: true });
            if (!updatedCategory) {
                throw new Error(`Category with ID ${id} not found`);
            }
            return updatedCategory;
        });
    }
};
exports.CategoryRepository = CategoryRepository;
exports.CategoryRepository = CategoryRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], CategoryRepository);
