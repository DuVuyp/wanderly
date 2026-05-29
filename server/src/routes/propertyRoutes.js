import express from 'express'
import * as propertyController from '../controllers/propertyController.js'

const router = express.Router()

// GET /api/properties
router.get('/', propertyController.getAllProperties)

// GET /api/properties/:id
router.get('/:id', propertyController.getPropertyById)

// GET /api/properties/:id/room-types
router.get('/:id/room-types', propertyController.getPropertyRoomTypes)

export default router
