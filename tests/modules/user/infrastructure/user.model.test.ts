import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { UserModel } from '../../../../src/modules/user/infrastructure/user.model';
import { UserRole } from '../../../../src/modules/user/domain/user.entity';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('User Model', () => {
  beforeAll(async () => {
    // Connect to MongoDB memory server (setup in tests/setup.ts)
  });

  afterAll(async () => {
    // Disconnect from MongoDB memory server (teardown in tests/setup.ts)
  });

  afterEach(async () => {
    // Clear the users collection after each test
    await UserModel.deleteMany({});
  });

  it('should create a user successfully', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: UserRole.CUSTOMER,
    };

    const user = await UserModel.create(userData);

    expect(user).toBeDefined();
    expect(user.name).toBe(userData.name);
    expect(user.email).toBe(userData.email);
    expect(user.role).toBe(userData.role);
    expect(user.password).toBe('hashedPassword'); // Mocked hash
    expect(user.createdAt).toBeDefined();
    expect(user.updatedAt).toBeDefined();
  });

  it('should hash the password before saving', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: UserRole.CUSTOMER,
    };

    await UserModel.create(userData);

    expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'salt');
  });

  it('should not hash the password if it is not modified', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: UserRole.CUSTOMER,
    };

    const user = await UserModel.create(userData);

    // Clear mock calls
    (bcrypt.genSalt as jest.Mock).mockClear();
    (bcrypt.hash as jest.Mock).mockClear();

    user.name = 'Updated Name';
    await user.save();

    expect(bcrypt.genSalt).not.toHaveBeenCalled();
    expect(bcrypt.hash).not.toHaveBeenCalled();
  });

  it('should compare passwords correctly', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: UserRole.CUSTOMER,
    };

    const user = await UserModel.create(userData);
    const isMatch = await user.comparePassword('password123');

    expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
    expect(isMatch).toBe(true);
  });

  it('should create a password reset token', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: UserRole.CUSTOMER,
    };

    const user = await UserModel.create(userData);
    const resetToken = user.createPasswordResetToken();

    expect(resetToken).toBeDefined();
    expect(typeof resetToken).toBe('string');
    expect(user.passwordResetToken).toBeDefined();
    expect(user.passwordResetExpires).toBeDefined();
    expect(user.passwordResetExpires).toBeInstanceOf(Date);

    // Check that the expiry is in the future (1 hour)
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 3600000);
    expect(user.passwordResetExpires!.getTime()).toBeLessThanOrEqual(oneHourFromNow.getTime());
    expect(user.passwordResetExpires!.getTime()).toBeGreaterThan(now.getTime());
  });

  it('should transform the user document to JSON correctly', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: UserRole.CUSTOMER,
    };

    const user = await UserModel.create(userData);
    const userJson = user.toJSON();

    expect(userJson.id).toBeDefined();
    expect(userJson._id).toBeUndefined();
    expect(userJson.__v).toBeUndefined();
    expect(userJson.password).toBeUndefined();
    expect(userJson.passwordResetToken).toBeUndefined();
    expect(userJson.passwordResetExpires).toBeUndefined();
  });

  it('should validate required fields', async () => {
    const invalidUser = new UserModel({
      // Missing required fields
    });

    await expect(invalidUser.validate()).rejects.toThrow();
  });

  it('should validate email format', async () => {
    const invalidUser = new UserModel({
      name: 'Test User',
      email: 'invalid-email',
      password: 'password123',
      role: UserRole.CUSTOMER,
    });

    await expect(invalidUser.validate()).rejects.toThrow();
  });

  it('should validate role enum values', async () => {
    const invalidUser = new UserModel({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'invalid_role',
    });

    await expect(invalidUser.validate()).rejects.toThrow();
  });
});
