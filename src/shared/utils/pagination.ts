/**
 * Pagination options interface
 */
interface PaginationInput {
  page?: number | string;
  limit?: number | string;
}

/**
 * Pagination result interface
 */
interface PaginationResult {
  page: number;
  limit: number;
  skip: number;
}

/**
 * Converts pagination input to pagination options with defaults
 * @param pagination - Pagination input from request query
 * @returns Pagination options with page, limit, and skip values
 */
export const getPaginationOptions = (pagination: PaginationInput = {}): PaginationResult => {
  const page = typeof pagination.page === 'string' 
    ? parseInt(pagination.page) 
    : (pagination.page || 1);
    
  const limit = typeof pagination.limit === 'string' 
    ? parseInt(pagination.limit) 
    : (pagination.limit || 10);
    
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip
  };
}; 