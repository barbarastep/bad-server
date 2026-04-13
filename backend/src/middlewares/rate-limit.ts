import { NextFunction, Request, Response } from 'express'
import TooManyRequestsError from '../errors/too-many-requests-error'

type Bucket = {
    count: number
    resetAt: number
}

const WINDOW_MS = 60 * 1000
const GLOBAL_LIMIT = 20
const AUTH_LIMIT = 10
const CSRF_LIMIT = 100

function getScope(req: Request) {
    if (req.path === '/auth/csrf-token') {
        return 'csrf'
    }

    if (req.path.startsWith('/auth/')) {
        return 'auth'
    }

    return 'global'
}

const buckets = new Map<string, Bucket>()

function getBucketKey(req: Request) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown'
    const scope = getScope(req)

    return `${scope}:${ip}`
}

function getLimit(req: Request) {
    const scope = getScope(req)

    if (scope === 'csrf') {
        return CSRF_LIMIT
    }

    if (scope === 'auth') {
        return AUTH_LIMIT
    }

    return GLOBAL_LIMIT
}

export default function rateLimitMiddleware(
    req: Request,
    _res: Response,
    next: NextFunction
) {
    const key = getBucketKey(req)
    const now = Date.now()
    const limit = getLimit(req)
    const bucket = buckets.get(key)

    if (!bucket || bucket.resetAt <= now) {
        buckets.set(key, {
            count: 1,
            resetAt: now + WINDOW_MS,
        })
        return next()
    }

    if (bucket.count >= limit) {
        return next(new TooManyRequestsError())
    }

    bucket.count += 1
    buckets.set(key, bucket)

    return next()
}
