class TooManyRequestsError extends Error {
    public statusCode: number

    constructor(message = 'Слишком много запросов, попробуйте позже') {
        super(message)
        this.statusCode = 429
    }
}

export default TooManyRequestsError
