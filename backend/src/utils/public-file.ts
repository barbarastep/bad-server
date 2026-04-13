import path from 'path'
import BadRequestError from '../errors/bad-request-error'

const PUBLIC_FILE_PATH = /^\/[a-z0-9_-]+\/[a-z0-9-]+\.(png|jpe?g|gif|webp)$/i

export function assertPublicFilePath(filePath: string) {
    if (!PUBLIC_FILE_PATH.test(filePath)) {
        throw new BadRequestError('Передан невалидный путь к файлу')
    }

    return filePath
}

export function resolvePublicFilePath(baseDir: string, filePath: string) {
    const safeFilePath = assertPublicFilePath(filePath)
    const normalizedBaseDir = path.resolve(baseDir)
    const absolutePath = path.resolve(normalizedBaseDir, `.${safeFilePath}`)

    if (!absolutePath.startsWith(normalizedBaseDir)) {
        throw new BadRequestError('Передан невалидный путь к файлу')
    }

    return absolutePath
}
