import { Request, Express } from 'express'
import multer, { FileFilterCallback } from 'multer'
import crypto from 'crypto'
import { mkdirSync } from 'fs'
import { basename, extname, join } from 'path'
import BadRequestError from '../errors/bad-request-error'

type DestinationCallback = (error: Error | null, destination: string) => void
type FileNameCallback = (error: Error | null, filename: string) => void

const storage = multer.diskStorage({
    destination: (
        _req: Request,
        _file: Express.Multer.File,
        cb: DestinationCallback
    ) => {
        const destinationPath = join(
            __dirname,
            process.env.UPLOAD_PATH_TEMP
                ? `../public/${process.env.UPLOAD_PATH_TEMP}`
                : '../public'
        )

        mkdirSync(destinationPath, { recursive: true })

        cb(null, destinationPath)
    },

    filename: (
        _req: Request,
        file: Express.Multer.File,
        cb: FileNameCallback
    ) => {
        const extension = extname(file.originalname).toLowerCase()
        const safeName = `${crypto.randomUUID()}${extension}`

        cb(null, safeName)
    },
})

const mimeToExtension: Record<string, string> = {
    'image/png': '.png',
    'image/jpg': '.jpg',
    'image/jpeg': '.jpeg',
    'image/gif': '.gif',
    'image/webp': '.webp',
}

const fileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
) => {
    const extension = extname(basename(file.originalname)).toLowerCase()
    const expectedExtension = mimeToExtension[file.mimetype]

    if (!expectedExtension || extension !== expectedExtension) {
        return cb(
            new BadRequestError('Можно загружать только png, jpg, jpeg, gif и webp')
        )
    }

    return cb(null, true)
}

export default multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 1,
        parts: 10,
    },
})
