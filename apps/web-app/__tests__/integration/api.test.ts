import { NextRequest } from 'next/server'
import { POST as loginPOST } from '../../app/api/auth/login/route'

// Mock Prisma
const mockPrisma = {
  user: {
    findFirst: jest.fn(),
  },
  client: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
  invoice: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
}

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrisma),
}))

// Mock auth functions
jest.mock('../../lib/auth', () => ({
  authenticateUser: jest.fn(),
  generateToken: jest.fn(),
}))

describe('API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/auth/login', () => {
    it('should return JWT token for valid credentials', async () => {
      const { authenticateUser, generateToken } = require('../../lib/auth')
      
      // Mock successful authentication
      authenticateUser.mockResolvedValue({
        id: 1,
        username: 'dev',
        passwordHash: 'hashedPassword',
      })
      
      // Mock token generation
      generateToken.mockReturnValue('mock.jwt.token')

      const request = new NextRequest('http://localhost:3001/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: 'dev',
          password: 'dev',
        }),
      })

      const response = await loginPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('token')
      expect(data.token).toBe('mock.jwt.token')
      expect(authenticateUser).toHaveBeenCalledWith('dev', 'dev')
    })

    it('should return 401 for invalid credentials', async () => {
      const { authenticateUser } = require('../../lib/auth')
      
      // Mock failed authentication
      authenticateUser.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3001/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: 'dev',
          password: 'wrongpassword',
        }),
      })

      const response = await loginPOST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Invalid credentials')
    })

    it('should return 400 for missing credentials', async () => {
      const request = new NextRequest('http://localhost:3001/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: 'dev',
          // password missing
        }),
      })

      const response = await loginPOST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Username and password are required')
    })

    it('should return 500 for server error', async () => {
      const { authenticateUser } = require('../../lib/auth')
      
      // Mock server error
      authenticateUser.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3001/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: 'dev',
          password: 'dev',
        }),
      })

      const response = await loginPOST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })
  })
}) 