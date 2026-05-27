import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import httpStatus from 'http-status'
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import profileRoutes from './routes/profileRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'
import { errorHandler } from './middlewares/errorMiddleware.js'
import ApiError from './utils/ApiError.js'

// Load env vars
dotenv.config()

// Init app
const app = express()

// Enhanced CORS configuration
const allowedOrigins = [
  process.env.ADMIN_URL,
  process.env.CLIENT_URL,
  // Add production URLs

  // Add localhost for development
  'http://localhost:3000',
  'http://localhost:5173',
].filter(Boolean)

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true)

      // In development, allow all origins for easier testing
      if (process.env.NODE_ENV === 'development') {
        return callback(null, true)
      }

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// Increase body size limit for JSON and URL-encoded payloads
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/upload', uploadRoutes)

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  })
})

app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Endpoint not found'))
})

app.use(errorHandler)

// Start server
const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
  console.log(`Server API is running!`)
  console.log(`Server URL: http://localhost:${PORT}`)
  console.log(`Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`)
  console.log(`Admin URL: ${process.env.ADMIN_URL || 'http://localhost:5173'}`)
  console.log(`Health Check: http://localhost:${PORT}/health`)
  console.log(`Project Info: http://localhost:${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`\nReady to start building your server API!`)
})
