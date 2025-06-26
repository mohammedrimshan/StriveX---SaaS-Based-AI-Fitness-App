"use strict";
// // D:\StriveX\api\src\interfaceAdapters\services\event.service.ts
// import { injectable, singleton } from 'tsyringe';
// import { EventEmitter } from 'events';
// @injectable()
// @singleton()
// export class EventService {
//   private emitter: EventEmitter;
//   private instanceId: string = Math.random().toString(36).substring(2); // Unique ID for debugging
//   constructor() {
//     this.emitter = new EventEmitter();
//     console.log(`[DEBUG] EventService instantiated, instanceId=${this.instanceId}`);
//   }
//   emit(event: string, ...args: any[]): boolean {
//     console.log(`[DEBUG] Emitting event: ${event}, args: ${JSON.stringify(args)}, instanceId=${this.instanceId}, listeners=${this.emitter.listenerCount(event)}`);
//     return this.emitter.emit(event, ...args);
//   }
//   on(event: string, listener: (...args: any[]) => void): void {
//     console.log(`[DEBUG] Registering listener for event: ${event}, instanceId=${this.instanceId}, listeners=${this.emitter.listenerCount(event) + 1}`);
//     this.emitter.on(event, listener);
//   }
// }
