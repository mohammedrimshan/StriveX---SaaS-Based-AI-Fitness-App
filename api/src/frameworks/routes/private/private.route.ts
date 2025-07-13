import { BaseRoute } from "../base.route";

import { ClientRoutes } from "../client/client.route";
import { AdminRoutes } from "../admin/admin.route";
import { TrainerRoutes } from "../trainer/trainer.route";
import { PaymentRoutes } from "../payment/payment.route";

export class PrivateRoutes extends BaseRoute {
  constructor() {
    super();
  }

  protected initializeRoutes(): void {
    this.router.use("/client", new ClientRoutes().router);
    this.router.use("/admin", new AdminRoutes().router);
    this.router.use("/trainer", new TrainerRoutes().router);
    this.router.use("/payment", new PaymentRoutes().router);
  }
}
