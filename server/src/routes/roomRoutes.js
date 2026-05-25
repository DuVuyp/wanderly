import express from 'express'
import auth from '../middlewares/authMiddleware.js'
import validate from '../middlewares/validateMiddleware.js'
import USER_ROLES from '../constants/roles.js'
import { updateRoom, deleteRoom } from '../controllers/roomController.js'
import { updateRoomSchema } from '../validations/roomValidation.js'

const router = express.Router()

router.use(auth())

// Room updates and deletions
router.put('/:roomId', auth(USER_ROLES.PROVIDER), validate(updateRoomSchema), updateRoom)
router.delete('/:roomId', auth(USER_ROLES.PROVIDER), deleteRoom)

export default router
