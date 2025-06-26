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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
const tsyringe_1 = require("tsyringe");
const mongoose_1 = require("mongoose");
let BaseRepository = class BaseRepository {
    constructor(model) {
        this.model = model;
    }
    save(data, session) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const entity = new this.model(data);
                const savedEntity = yield entity.save({ session });
                console.log(`[${new Date().toISOString()}] Saved entity to ${this.model.modelName}: ${entity._id}`);
                return this.mapToEntity(savedEntity.toObject());
            }
            catch (error) {
                console.error(`[${new Date().toISOString()}] Error saving entity to ${this.model.modelName}: ${error.message}`);
                throw error;
            }
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const entity = yield this.model.findById(id).lean();
            if (!entity)
                return null;
            return this.mapToEntity(entity);
        });
    }
    update(id, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            const entity = yield this.model
                .findByIdAndUpdate(id, { $set: updates }, { new: true })
                .lean();
            if (!entity)
                return null;
            return this.mapToEntity(entity);
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.model.deleteOne({ _id: id });
            return result.deletedCount > 0;
        });
    }
    find(filter, skip, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const [items, total] = yield Promise.all([
                this.model
                    .find(filter)
                    .select('-password')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                this.model.countDocuments(filter),
            ]);
            const transformedItems = items.map((item) => this.mapToEntity(item));
            return { items: transformedItems, total };
        });
    }
    findOneAndMap(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield this.model.findOne(filter).lean();
            return doc ? this.mapToEntity(doc) : null;
        });
    }
    findOneAndUpdateAndMap(filter_1, update_1) {
        return __awaiter(this, arguments, void 0, function* (filter, update, options = { new: true }) {
            const doc = yield this.model
                .findOneAndUpdate(filter, update, options)
                .lean();
            return doc ? this.mapToEntity(doc) : null;
        });
    }
    count(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.model.countDocuments(filter);
        });
    }
    updateRaw(id, update) {
        return __awaiter(this, void 0, void 0, function* () {
            const entity = yield this.model
                .findByIdAndUpdate(id, update, { new: true })
                .lean();
            return entity ? this.mapToEntity(entity) : null;
        });
    }
    mapToEntity(doc) {
        const { _id, __v, category } = doc, rest = __rest(doc, ["_id", "__v", "category"]);
        return Object.assign(Object.assign({}, rest), { id: _id === null || _id === void 0 ? void 0 : _id.toString(), category: (category === null || category === void 0 ? void 0 : category.title) || category || undefined });
    }
};
exports.BaseRepository = BaseRepository;
exports.BaseRepository = BaseRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [mongoose_1.Model])
], BaseRepository);
