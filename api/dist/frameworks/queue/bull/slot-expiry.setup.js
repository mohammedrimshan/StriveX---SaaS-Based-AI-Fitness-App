"use strict";
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
exports.initializeSlotExpiryQueue = void 0;
const tsyringe_1 = require("tsyringe");
const slot_expiry_queue_1 = __importDefault(require("./slot-expiry.queue"));
const slot_expiry_processor_1 = require("./slot-expiry.processor");
const initializeSlotExpiryQueue = () => {
    console.log("Initializing slot expiry queue");
    const processor = tsyringe_1.container.resolve(slot_expiry_processor_1.SlotExpiryProcessor);
    slot_expiry_queue_1.default.process((job) => __awaiter(void 0, void 0, void 0, function* () {
        yield processor.process(job);
    }));
};
exports.initializeSlotExpiryQueue = initializeSlotExpiryQueue;
exports.default = slot_expiry_queue_1.default;
