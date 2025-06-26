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
Object.defineProperty(exports, "__esModule", { value: true });
// D:\StriveX\api\src\cron\handleExpiredInvitations.ts
const tsyringe_1 = require("tsyringe");
const cron_1 = require("cron");
const handleExpiredInvitations = () => __awaiter(void 0, void 0, void 0, function* () {
    const useCase = tsyringe_1.container.resolve("IHandleExpiredInvitationsUseCase");
    yield useCase.execute();
});
const job = new cron_1.CronJob("0 * * * *", () => {
    handleExpiredInvitations().catch((err) => {
        console.error("Error running handleExpiredInvitations cron job:", err);
    });
});
job.start();
exports.default = handleExpiredInvitations;
