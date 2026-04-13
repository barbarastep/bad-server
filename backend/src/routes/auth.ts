import { Router } from 'express'
import {
    getCsrfToken,
    getCurrentUser,
    getCurrentUserRoles,
    login,
    logout,
    refreshAccessToken,
    register,
    updateCurrentUser,
} from '../controllers/auth'
import auth from '../middlewares/auth'
import {
    validateAuthentication,
    validateCurrentUserUpdateBody,
    validateUserBody,
} from '../middlewares/validations'

const authRouter = Router()

authRouter.get('/csrf-token', getCsrfToken)
authRouter.get('/user', auth, getCurrentUser)
authRouter.patch('/me', auth, validateCurrentUserUpdateBody, updateCurrentUser)
authRouter.get('/user/roles', auth, getCurrentUserRoles)
authRouter.post('/login', validateAuthentication, login)
authRouter.post('/token', refreshAccessToken)
authRouter.post('/logout', logout)
authRouter.post('/register', validateUserBody, register)

export default authRouter
