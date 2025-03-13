import { validateStore } from '@modules/store/domain/store.schema';
import mongoose from 'mongoose';

describe('Store Schema Validation', () => {
  const validStoreData = {
    name: 'Test Store',
    ownerId: new mongoose.Types.ObjectId().toString(),
    email: 'store@test.com',
    phone: '1234567890',
    address: '123 Test St'
  };

  it('should validate a correct store object', () => {
    const { error } = validateStore(validStoreData);
    expect(error).toBeUndefined();
  });

  it('should require name', () => {
    const { error } = validateStore({ ...validStoreData, name: undefined });
    expect(error?.details[0].message).toContain('"name" is required');
  });

  it('should require ownerId', () => {
    const { error } = validateStore({ ...validStoreData, ownerId: undefined });
    expect(error?.details[0].message).toContain('"ownerId" is required');
  });

  it('should require a valid email', () => {
    const { error } = validateStore({ ...validStoreData, email: 'invalid-email' });
    expect(error?.details[0].message).toContain('"email" must be a valid email');
  });

  it('should require phone', () => {
    const { error } = validateStore({ ...validStoreData, phone: undefined });
    expect(error?.details[0].message).toContain('"phone" is required');
  });

  it('should require address', () => {
    const { error } = validateStore({ ...validStoreData, address: undefined });
    expect(error?.details[0].message).toContain('"address" is required');
  });
}); 