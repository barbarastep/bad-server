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
import ForbiddenError from './errors/forbidden-error'
import routes from './routes'

const { PORT = 3000 } = process.env
const app = express()
const defaultCorsOrigin = 'http://localhost:5173'
const allowedOrigins = new Set([
    ORIGIN_ALLOW,
    defaultCorsOrigin,
    'http://localhost',
    'https://localhost',
])
const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        if (!origin || allowedOrigins.has(origin)) {
            return callback(null, true)
        }

        return callback(new ForbiddenError('Запрос с этого источника запрещен'))
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'CSRF-Token', 'X-XSRF-Token'],
}

mongoose.set('sanitizeFilter', true)
mongoose.set('strictQuery', true)

app.disable('x-powered-by')
app.use(cookieParser())

app.use(
    cors(corsOptions)
)

app.use((_req, res, next) => {
    if (!res.getHeader('Access-Control-Allow-Origin')) {
        res.header('Access-Control-Allow-Origin', defaultCorsOrigin)
    }

    return next()
})

app.use(serveStatic(path.join(__dirname, 'public')))

app.use(rateLimitMiddleware)
app.use(ensureCsrfCookie)
app.use(json({ limit: '10kb' }))
app.use(urlencoded({ extended: true, limit: '10kb' }))
app.use(requireCsrfToken)

app.options('*', cors(corsOptions))
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
