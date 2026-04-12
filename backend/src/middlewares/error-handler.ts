import { ErrorRequestHandler } from 'express'

const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
    const statusCode =
        err.statusCode ||
        err.status ||
        (err.code === 'LIMIT_FILE_SIZE' ? 413 : undefined) ||
        500
    const message =
        statusCode === 500 ? 'На сервере произошла ошибка' : err.message

    console.error(
        `[error] ${req.method} ${req.originalUrl} -> ${statusCode}: ${message}`
    )

    res.status(statusCode).send({ message })
}

export default errorHandler
