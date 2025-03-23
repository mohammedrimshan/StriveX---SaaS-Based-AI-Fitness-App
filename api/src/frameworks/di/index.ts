import { RepositoryRegistry } from "./repository.registry";
import { UseCaseRegistry } from "./usecase.registry";
export class DependancyInjection {
  static registerAll(): void {
    RepositoryRegistry.registerRepositories();
    UseCaseRegistry.registerUseCases();
  }
}
