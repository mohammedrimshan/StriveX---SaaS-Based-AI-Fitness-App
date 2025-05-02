import 'module-alias/register';
import 'reflect-metadata';
import "./frameworks/di/resolver";
import { createServer } from "http";
import { Server } from './frameworks/http/server';
import { config } from './shared/config';
import { MongoConnect } from './frameworks/database/mongoDB/mongoConnect';
import { container } from "tsyringe";
import { SocketService } from './interfaceAdapters/services/socket.service';

const mongoConnect = new MongoConnect();
mongoConnect.connectDB();

const server = new Server();
const app = server.getApp();
const httpServer = createServer(app);

const socketService = container.resolve(SocketService);
socketService.initialize(httpServer);


httpServer.listen(config.server.PORT, () => {
  console.log(`Server running on port ${config.server.PORT}`);
});