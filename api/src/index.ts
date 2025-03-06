import 'reflect-metadata'

import { Server } from './frameworks/http/server'
import { config } from './shared/config'
import { MongoConnect } from './frameworks/database/mongoDB/mongoConnect'

const server = new Server()
const mongoConnect = new MongoConnect()

mongoConnect.connectDB()

server.getApp().listen(config.server.PORT,()=>{
    console.log(`Server running on port ${config.server.PORT}`)
})