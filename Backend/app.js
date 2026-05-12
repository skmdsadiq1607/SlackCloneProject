import exp from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { config } from 'dotenv'
import helmet from 'helmet'
import morgan from 'morgan'
import { errorHandler } from './middleware/error.js'
import { authApp } from './APIs/auth.js'
import { userApp } from './APIs/user.js'
import { channelApp } from './APIs/channel.js'
import { messageApp } from './APIs/message.js'
import { dmApp } from './APIs/dm.js'
import { fileApp } from './APIs/file.js'
import { callApp } from './APIs/call.js'
config()
export const app = exp()
app.use(helmet({ crossOriginResourcePolicy: false })) // allows serving static files cross-origin
app.use(morgan('dev'))
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(exp.json())
app.use(cookieParser())
app.use('/uploads', exp.static('uploads'))
app.get('/favicon.ico', (req, res) => res.status(204).end())
// routes
app.use("/api/auth", authApp)
app.use("/api/user", userApp)
app.use("/api", channelApp)
app.use("/api", messageApp)
app.use("/api", dmApp)
app.use("/api", fileApp)
app.use("/api", callApp)
// global error handler
app.use(errorHandler)