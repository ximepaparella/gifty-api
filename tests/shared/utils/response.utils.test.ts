import { Response } from 'express';
import { AppError } from '@shared/types/appError';
import {
  createSuccessResponse,
  createPaginatedResponse,
  createErrorResponse,
  sendSuccessResponse,
  sendPaginatedResponse,
  sendErrorResponse,
} from '@shared/utils/response.utils';

describe('Response Utilities', () => {
  let mockResponse: Partial<Response>;
  let jsonSpy: jest.Mock;
  let statusSpy: jest.Mock;

  beforeEach(() => {
    jsonSpy = jest.fn();
    statusSpy = jest.fn().mockReturnThis();
    mockResponse = {
      status: statusSpy,
      json: jsonSpy,
    };
  });

  describe('createSuccessResponse', () => {
    it('should create a success response with data', () => {
      const data = { id: 1, name: 'Test' };
      const response = createSuccessResponse(data);
      expect(response).toEqual({
        status: 'success',
        data,
      });
    });

    it('should include message when provided', () => {
      const data = { id: 1 };
      const message = 'Operation successful';
      const response = createSuccessResponse(data, message);
      expect(response).toEqual({
        status: 'success',
        data,
        message,
      });
    });
  });

  describe('createPaginatedResponse', () => {
    it('should create a paginated response', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const response = createPaginatedResponse(data, 1, 10, 20);
      expect(response).toEqual({
        status: 'success',
        data,
        pagination: {
          page: 1,
          limit: 10,
          total: 20,
          hasMore: true,
        },
      });
    });

    it('should set hasMore correctly', () => {
      const data = [{ id: 1 }];
      const response = createPaginatedResponse(data, 2, 10, 15);
      expect(response.pagination.hasMore).toBeFalsy();
    });
  });

  describe('createErrorResponse', () => {
    it('should create an error response from AppError', () => {
      const appError = new AppError('Test error', 400);
      const response = createErrorResponse(appError);
      expect(response).toEqual({
        status: 'fail',
        message: 'Test error',
        code: 'ERR_400',
      });
    });

    it('should create an error response from standard Error', () => {
      const error = new Error('Standard error');
      const response = createErrorResponse(error);
      expect(response).toEqual({
        status: 'error',
        message: 'Standard error',
        code: 'ERR_INTERNAL',
      });
    });

    it('should include stack trace in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new Error('Test error');
      const response = createErrorResponse(error);

      expect(response.stack).toBeDefined();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('sendSuccessResponse', () => {
    it('should send a success response with correct status', () => {
      const data = { id: 1 };
      sendSuccessResponse(mockResponse as Response, data, 201);

      expect(statusSpy).toHaveBeenCalledWith(201);
      expect(jsonSpy).toHaveBeenCalledWith({
        status: 'success',
        data,
      });
    });
  });

  describe('sendPaginatedResponse', () => {
    it('should send a paginated response', () => {
      const data = [{ id: 1 }];
      sendPaginatedResponse(mockResponse as Response, data, 1, 10, 20);

      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith({
        status: 'success',
        data,
        pagination: {
          page: 1,
          limit: 10,
          total: 20,
          hasMore: true,
        },
      });
    });
  });

  describe('sendErrorResponse', () => {
    it('should send an error response with correct status code', () => {
      const error = new AppError('Test error', 400);
      sendErrorResponse(mockResponse as Response, error);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Test error',
        code: 'ERR_400',
      });
    });

    it('should send 500 status for standard errors', () => {
      const error = new Error('Standard error');
      sendErrorResponse(mockResponse as Response, error);

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        status: 'error',
        message: 'Standard error',
        code: 'ERR_INTERNAL',
      });
    });
  });
});
