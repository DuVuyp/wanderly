import express from 'express'

import USER_ROLES from '../constants/roles.js'
import * as userController from '../controllers/userController.js'
import auth from '../middlewares/authMiddleware.js'
import validate from '../middlewares/validateMiddleware.js'
import { updateUserRoleSchema } from '../validations/userValidation.js'

const router = express.Router()

// All admin user routes require ADMIN role
router.use(auth(USER_ROLES.ADMIN))

router.get('/', userController.getUsersAdmin)
router.get('/:id', userController.getUserById)
router.put('/:id/role', validate(updateUserRoleSchema), userController.updateUserRole)
router.delete('/:id', userController.deleteUser)

export default router
