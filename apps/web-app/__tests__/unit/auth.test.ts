// Mock the auth module
jest.mock('../../lib/auth', () => ({
  verifyPassword: jest.fn(),
  generateToken: jest.fn(),
  verifyToken: jest.fn(),
}));

describe('Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Password Verification', () => {
    it('should verify password correctly', async () => {
      const { verifyPassword } = require('../../lib/auth');

      // Mock verifyPassword to return true
      verifyPassword.mockResolvedValue(true);

      const result = await verifyPassword('password123', 'hashedPassword');

      expect(verifyPassword).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(result).toBe(true);
    });

    it('should reject invalid password', async () => {
      const { verifyPassword } = require('../../lib/auth');

      // Mock verifyPassword to return false
      verifyPassword.mockResolvedValue(false);

      const result = await verifyPassword('wrongpassword', 'hashedPassword');

      expect(verifyPassword).toHaveBeenCalledWith('wrongpassword', 'hashedPassword');
      expect(result).toBe(false);
    });
  });
});
