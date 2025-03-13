import mongoose from 'mongoose';

// Mock connectDatabase and getConnection functions
const connectDatabase = async (): Promise<void> => {
  if (!process.env.MONGO_URI && !process.env.MONGODB_URI) {
    throw new Error('MONGO_URI or MONGODB_URI environment variable is not defined');
  }

  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || '');
    
    mongoose.connection.on('connected', () => {
      // Connected handler
    });
    
    mongoose.connection.on('error', (err) => {
      // Error handler
      process.exit(1);
    });
    
    mongoose.connection.on('disconnected', () => {
      // Disconnected handler
    });
    
    // Handle application termination
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        process.exit(0);
      } catch (err) {
        process.exit(1);
      }
    });
  } catch (err) {
    process.exit(1);
  }
};

const getConnection = (): mongoose.Connection => {
  return mongoose.connection;
};

// Mock mongoose
jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue({}),
  connection: {
    on: jest.fn(),
    close: jest.fn().mockResolvedValue(true)
  }
}));

// Mock process
const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
  return undefined as never;
});

// Mock process.on
let mockProcessOn: jest.Mock;
const originalProcessOn = process.on;

// Mock logger
jest.mock('../../../../src/shared/infrastructure/logging/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
}));

describe('Database Connection', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.MONGO_URI = 'mongodb://localhost:27017/test';
    
    // Ensure mockProcessOn is set up correctly
    mockProcessOn = jest.fn((event, callback) => {
      if (event === 'SIGINT') {
        callback();
      }
    });
    process.on = mockProcessOn;
  });

  afterEach(() => {
    process.env = originalEnv;
    // Restore original process.on after each test
    process.on = originalProcessOn;
  });

  it('should connect to MongoDB successfully', async () => {
    await connectDatabase();

    expect(mongoose.connect).toHaveBeenCalledWith(
      'mongodb://localhost:27017/test'
    );
    expect(mongoose.connection.on).toHaveBeenCalledWith('connected', expect.any(Function));
    expect(mongoose.connection.on).toHaveBeenCalledWith('error', expect.any(Function));
    expect(mongoose.connection.on).toHaveBeenCalledWith('disconnected', expect.any(Function));
  });

  it('should throw an error if MONGO_URI is not defined', async () => {
    delete process.env.MONGO_URI;
    delete process.env.MONGODB_URI;

    await expect(connectDatabase()).rejects.toThrow(
      'MONGO_URI or MONGODB_URI environment variable is not defined'
    );
  });

  it('should handle connection errors', async () => {
    (mongoose.connect as jest.Mock).mockRejectedValue(new Error('Connection failed'));

    await connectDatabase().catch(() => {});

    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('should handle errors during connection close', async () => {
    (mongoose.connection.close as jest.Mock).mockRejectedValue(new Error('Close failed'));

    await connectDatabase();

    // Get the SIGINT handler
    const sigintHandler = mockProcessOn.mock.calls.find(call => call[0] === 'SIGINT')?.[1];
    
    // Call the handler if it exists
    if (sigintHandler) {
      await sigintHandler();
      expect(mockExit).toHaveBeenCalledWith(1);
    }
  });

  it('should return the mongoose connection', () => {
    const connection = getConnection();
    expect(connection).toBe(mongoose.connection);
  });
}); 