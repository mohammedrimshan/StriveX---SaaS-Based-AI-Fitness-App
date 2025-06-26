"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependancyInjection = void 0;
const repository_registry_1 = require("./repository.registry");
const usecase_registry_1 = require("./usecase.registry");
class DependancyInjection {
    static registerAll() {
        repository_registry_1.RepositoryRegistry.registerRepositories();
        usecase_registry_1.UseCaseRegistry.registerUseCases();
    }
}
exports.DependancyInjection = DependancyInjection;
