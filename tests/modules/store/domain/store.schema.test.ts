import { validateStore } from '@modules/store/domain/store.schema';
import mongoose from 'mongoose';

describe('Store Schema Validation', () => {
  const validStoreData = {
    name: 'Test Store',
    ownerId: new mongoose.Types.ObjectId(),
    email: 'store@test.com',
    phone: '1234567890',
    address: '123 Test St',
    logo: 'uploads/stores/logo.png',
    social: {
      instagram: 'https://instagram.com/teststore',
      facebook: 'https://facebook.com/teststore',
      twitter: 'https://twitter.com/teststore',
    },
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

  it('should accept a valid logo path', () => {
    const { error } = validateStore(validStoreData);
    expect(error).toBeUndefined();
  });

  it('should accept valid social media URLs', () => {
    const { error } = validateStore(validStoreData);
    expect(error).toBeUndefined();
  });

  it('should validate social media URLs format', () => {
    const invalidData = {
      ...validStoreData,
      social: {
        instagram: 'not-a-url',
        facebook: 'not-a-url',
        twitter: 'not-a-url',
      },
    };
    const { error } = validateStore(invalidData);
    expect(error?.details[0].message).toContain('must be a valid uri');
  });

  it('should accept a store without logo', () => {
    const { error } = validateStore({
      ...validStoreData,
      logo: undefined,
    });
    expect(error).toBeUndefined();
  });

  it('should accept a store without social media', () => {
    const { error } = validateStore({
      ...validStoreData,
      social: undefined,
    });
    expect(error).toBeUndefined();
  });

  it('should accept a store with partial social media links', () => {
    const { error } = validateStore({
      ...validStoreData,
      social: {
        instagram: 'https://instagram.com/teststore',
      },
    });
    expect(error).toBeUndefined();
  });
});
