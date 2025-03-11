import { container } from "tsyringe";

import { DependancyInjection } from ".";


import { RegisterUserController } from "@/interfaceAdapters/controllers/auth/register.controller";


DependancyInjection.registerAll();



export const registerController = container.resolve(RegisterUserController);