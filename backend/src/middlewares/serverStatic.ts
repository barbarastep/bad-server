import { NextFunction, Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import ForbiddenError from '../errors/forbidden-error'

export default function serveStatic(baseDir: string) {
    const normalizedBaseDir = path.resolve(baseDir)

    return (req: Request, res: Response, next: NextFunction) => {
        let relativePath = req.path

        try {
            relativePath = decodeURIComponent(req.path)
        } catch (error) {
            return next(error)
        }

        const filePath = path.resolve(normalizedBaseDir, `.${relativePath}`)

        if (!filePath.startsWith(normalizedBaseDir)) {
            return next(new ForbiddenError('Доступ к файлу запрещен'))
        }

        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                return next()
            }
            return res.sendFile(filePath, (sendFileError) => {
                if (sendFileError) {
                    next(sendFileError)
                }
            })
        })
    }
}
