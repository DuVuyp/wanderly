import 'dotenv/config'
import { PrismaMssql } from '@prisma/adapter-mssql'
import { PrismaClient } from '@prisma/client'

const parseBoolean = (value, defaultValue) => {
  if (value === undefined) return defaultValue
  return String(value).toLowerCase() === 'true'
}

const parseSqlServerDatabaseUrl = (databaseUrl) => {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required')
  }

  if (!databaseUrl.startsWith('sqlserver://')) {
    throw new Error('DATABASE_URL must start with sqlserver://')
  }

  const trimmedUrl = databaseUrl.replace(/;+$/, '')
  const raw = trimmedUrl.slice('sqlserver://'.length)
  const [locationPart, ...rawParams] = raw.split(';').filter(Boolean)

  let user
  let password
  let serverAndPort = locationPart || ''

  if (serverAndPort.includes('@')) {
    const [credentials, host] = serverAndPort.split('@')
    serverAndPort = host

    const [urlUser, urlPassword] = credentials.split(':')
    user = urlUser ? decodeURIComponent(urlUser) : undefined
    password = urlPassword ? decodeURIComponent(urlPassword) : undefined
  }

  const [server, portText] = serverAndPort.split(':')

  const params = rawParams.reduce((accumulator, part) => {
    const separatorIndex = part.indexOf('=')
    if (separatorIndex === -1) return accumulator

    const key = part.slice(0, separatorIndex).trim().toLowerCase()
    const value = part.slice(separatorIndex + 1).trim()
    accumulator[key] = value
    return accumulator
  }, {})

  return {
    user: user || params.user,
    password: password || params.password,
    server,
    database: params.database,
    port: portText ? Number(portText) : 1433,
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
    options: {
      encrypt: parseBoolean(params.encrypt, false),
      trustServerCertificate: parseBoolean(params.trustservercertificate, true),
    },
  }
}

const sqlConfig = parseSqlServerDatabaseUrl(process.env.DATABASE_URL)

const adapter = new PrismaMssql(sqlConfig)
const prisma = globalThis.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

export default prisma
