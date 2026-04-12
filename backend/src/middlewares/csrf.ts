import crypto from 'crypto'
import { CookieOptions, NextFunction, Request, Response } from 'express'
import { COOKIE_SECURE } from '../config'
import ForbiddenError from '../errors/forbidden-error'

export const CSRF_COOKIE_NAME = 'csrfToken'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

const cookieOptions: CookieOptions = {
    httpOnly: false,
    sameSite: 'strict',
    secure: COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
    path: '/',
}

export const ensureCsrfCookie = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const currentToken = req.cookies?.[CSRF_COOKIE_NAME]

    if (currentToken) {
        return next()
    }

    const csrfToken = crypto.randomBytes(32).toString('hex')
    res.cookie(CSRF_COOKIE_NAME, csrfToken, cookieOptions)

    return next()
}

export const requireCsrfToken = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    if (SAFE_METHODS.has(req.method)) {
        return next()
    }

    const cookieToken = req.cookies?.[CSRF_COOKIE_NAME]
    const headerToken = req.header('X-CSRF-Token')

    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
        return next(new ForbiddenError('CSRF токен отсутствует или невалиден'))
    }

    return next()
}
