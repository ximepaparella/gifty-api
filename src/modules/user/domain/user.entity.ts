import { Document } from 'mongoose';

/**
 * User roles in the system
 */
export enum UserRole {
  ADMIN = 'admin',
  STORE_MANAGER = 'store_manager',
  CUSTOMER = 'customer',
}

/**
 * User entity representing a user in the system
 */
export interface User {
  id?: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * User document interface for Mongoose
 */
export interface UserDocument extends Document, Omit<User, 'id'> {
  comparePassword(candidatePassword: string): Promise<boolean>;
  createPasswordResetToken(): string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
}

/**
 * User creation data transfer object
 */
export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

/**
 * User update data transfer object
 */
export interface UpdateUserDTO {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
}

/**
 * User data transfer object (without sensitive data)
 */
export interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Login credentials data transfer object
 */
export interface LoginCredentialsDTO {
  email: string;
  password: string;
}

/**
 * Login response data transfer object
 */
export interface LoginResponseDTO {
  token: string;
  user: UserDTO;
}
