import 'module-alias/register';
import 'reflect-metadata';
import "./frameworks/di/resolver";
import './frameworks/config/firebase';
import { createServer } from "http";
import { Server } from './frameworks/http/server';
import { config } from './shared/config';
import { MongoConnect } from './frameworks/database/mongoDB/mongoConnect';
import { container } from "tsyringe";
import { SocketService } from './interfaceAdapters/services/socket.service';
import { VideoSocketService } from './interfaceAdapters/services/video-socket.service';
import { NotificationService } from './interfaceAdapters/services/notification.service';
import { subscriptionProcessor, processor as slotExpiryProcessor } from './frameworks/di/resolver';
import { dailyUnusedSessionProcessor } from './frameworks/di/resolver';

import "@/frameworks/queue/bull/handleexpiredinvitations";


const mongoConnect = new MongoConnect();
mongoConnect.connectDB();

const server = new Server();
const app = server.getApp();
const httpServer = createServer(app);

const socketService = container.resolve(SocketService);
const videoSocketService = container.resolve(VideoSocketService);
const notificationService = container.resolve(NotificationService);

socketService.initialize(httpServer);
videoSocketService.initialize(httpServer);

subscriptionProcessor.start();
dailyUnusedSessionProcessor.start();

httpServer.listen(config.server.PORT, () => {
  console.log(`Server running on port ${config.server.PORT}`);
});
