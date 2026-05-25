import express from 'express'
import auth from '../middlewares/authMiddleware.js'
import USER_ROLES from '../constants/roles.js'
import * as userController from '../controllers/userController.js'

const router = express.Router()

// All admin user routes require ADMIN role
router.use(auth(USER_ROLES.ADMIN))

router.get('/', userController.getUsersAdmin)
router.get('/:id', userController.getUserById)
router.put('/:id/role', userController.updateUserRole)
router.delete('/:id', userController.deleteUser)

export default router
