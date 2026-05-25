import express from 'express'
import auth from '../middlewares/authMiddleware.js'
import validate from '../middlewares/validateMiddleware.js'
import USER_ROLES from '../constants/roles.js'
import {
  createProperty,
  getProperties,
  getProperty,
  updateProperty,
  deleteProperty,
} from '../controllers/propertyController.js'
import { createRoomType, getRoomTypes } from '../controllers/roomTypeController.js'
import { createPropertySchema, updatePropertySchema } from '../validations/propertyValidation.js'
import { createRoomTypeSchema } from '../validations/roomTypeValidation.js'

const router = express.Router()

// All routes require authentication
router.use(auth())

// Property CRUD
router.post('/', auth(USER_ROLES.PROVIDER), validate(createPropertySchema), createProperty)
router.get('/', getProperties)
router.get('/:id', getProperty)
router.put('/:id', auth(USER_ROLES.PROVIDER), validate(updatePropertySchema), updateProperty)
router.delete('/:id', auth(USER_ROLES.PROVIDER), deleteProperty)

// Room type nested routes
router.post('/:propertyId/room-types', auth(USER_ROLES.PROVIDER), validate(createRoomTypeSchema), createRoomType)
router.get('/:propertyId/room-types', getRoomTypes)

export default router
