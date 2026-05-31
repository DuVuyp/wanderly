import express from 'express'
import auth from '../middlewares/authMiddleware.js'
import validate from '../middlewares/validateMiddleware.js'
import USER_ROLES from '../constants/roles.js'
import { createRoom } from '../controllers/roomController.js'
import { createRoomSchema } from '../validations/roomValidation.js'

const router = express.Router()

router.use(auth())

// Physical room nested under room type
router.post('/:roomTypeId/rooms', auth(USER_ROLES.PROVIDER), validate(createRoomSchema), createRoom)

export default router
