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
  getPropertyRoomTypes,
} from '../controllers/propertyController.js'
import { createRoomType } from '../controllers/roomTypeController.js'
import { createPropertySchema, updatePropertySchema } from '../validations/propertyValidation.js'
import { createRoomTypeSchema } from '../validations/roomTypeValidation.js'

const router = express.Router()

// Property CRUD (Public endpoints)
router.get('/', getProperties)
router.get('/:id', getProperty)
router.get('/:id/room-types', getPropertyRoomTypes)

// Property CRUD (Provider only endpoints)
router.post('/', auth(USER_ROLES.PROVIDER), validate(createPropertySchema), createProperty)
router.put('/:id', auth(USER_ROLES.PROVIDER), validate(updatePropertySchema), updateProperty)
router.delete('/:id', auth(USER_ROLES.PROVIDER), deleteProperty)

// Room type nested routes (Provider only creation)
router.post('/:propertyId/room-types', auth(USER_ROLES.PROVIDER), validate(createRoomTypeSchema), createRoomType)

export default router
