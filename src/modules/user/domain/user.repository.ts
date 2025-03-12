import { User, CreateUserDTO, UpdateUserDTO } from './user.entity';
import { PaginationOptions, PaginatedResult } from '@shared/types';

export interface UserRepository {
  /**
   * Find all users with optional filtering and pagination
   */
  findAll(filter?: Partial<User>, options?: PaginationOptions): Promise<PaginatedResult<User>>;
  
  /**
   * Find a user by ID
   */
  findById(id: string): Promise<User | null>;
  
  /**
   * Find a user by email
   */
  findByEmail(email: string): Promise<User | null>;
  
  /**
   * Create a new user
   */
  create(userData: CreateUserDTO): Promise<User>;
  
  /**
   * Update an existing user
   */
  update(id: string, userData: UpdateUserDTO): Promise<User | null>;
  
  /**
   * Delete a user
   */
  delete(id: string): Promise<boolean>;
  
  /**
   * Count users with optional filtering
   */
  count(filter?: Partial<User>): Promise<number>;
} 