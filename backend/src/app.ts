import { errors } from 'celebrate'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'
import express, { json, urlencoded } from 'express'
import mongoose from 'mongoose'
import path from 'path'
import { DB_ADDRESS, ORIGIN_ALLOW } from './config'
import { ensureCsrfCookie, requireCsrfToken } from './middlewares/csrf'
import errorHandler from './middlewares/error-handler'
import rateLimitMiddleware from './middlewares/rate-limit'
import serveStatic from './middlewares/serverStatic'
import routes from './routes'

const { PORT = 3000 } = process.env
const app = express()
const allowedOrigins = new Set([
    ORIGIN_ALLOW,
    'http://localhost',
    'https://localhost',
])

mongoose.set('sanitizeFilter', true)
mongoose.set('strictQuery', true)

app.disable('x-powered-by')
app.use(cookieParser())

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.has(origin)) {
                return callback(null, true)
            }

            return callback(new Error('Запрос с этого источника запрещен'))
        },
        credentials: true,
    })
)

app.use(serveStatic(path.join(__dirname, 'public')))

app.use(rateLimitMiddleware)
app.use(ensureCsrfCookie)
app.use(json({ limit: '32kb' }))
app.use(urlencoded({ extended: true, limit: '32kb' }))
app.use(requireCsrfToken)

app.options('*', cors({ origin: true, credentials: true }))
app.use(routes)
app.use(errors())
app.use(errorHandler)

// eslint-disable-next-line no-console

const bootstrap = async () => {
    try {
        await mongoose.connect(DB_ADDRESS)
        await app.listen(PORT, () => console.log('ok'))
    } catch (error) {
        const message =
            error instanceof Error ? error.message : 'Unknown startup error'
        console.error(`[startup] failed to start application: ${message}`)
    }
}

bootstrap()
