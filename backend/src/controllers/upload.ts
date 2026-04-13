import { NextFunction, Request, Response } from 'express'
import { unlink } from 'fs/promises'
import { constants } from 'http2'
import { basename } from 'path'
import sharp from 'sharp'
import BadRequestError from '../errors/bad-request-error'

export const uploadFile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.file) {
        return next(new BadRequestError('Файл не загружен'))
    }
    try {
        if (req.file.size < 2 * 1024) {
            await unlink(req.file.path).catch(() => undefined)
            return next(
                new BadRequestError('Размер файла должен быть не меньше 2kb')
            )
        }

        const metadata = await sharp(req.file.path).metadata()

        if (!metadata.format || !metadata.width || !metadata.height) {
            await unlink(req.file.path).catch(() => undefined)
            return next(new BadRequestError('Файл не является валидным изображением'))
        }

        const fileName = process.env.UPLOAD_PATH
            ? `/${process.env.UPLOAD_PATH}/${req.file.filename}`
            : `/${req.file?.filename}`
        return res.status(constants.HTTP_STATUS_CREATED).send({
            fileName,
            originalName: basename(req.file.originalname),
        })
    } catch (error) {
        await unlink(req.file.path).catch(() => undefined)
        if (error instanceof Error) {
            return next(new BadRequestError('Файл не является валидным изображением'))
        }
        return next(error)
    }
}

export default {}
