# TypeScript Migration Guide

This document provides guidance on migrating the Gifty API from JavaScript to TypeScript.

## Migration Steps

1. **Setup TypeScript**
   - ✅ Install TypeScript and type definitions
   - ✅ Create tsconfig.json
   - ✅ Update package.json scripts

2. **Convert Core Files**
   - ✅ Convert server.js to server.ts
   - ✅ Convert database connection
   - ✅ Convert logger
   - ✅ Convert cloudinary config

3. **Create Type Definitions**
   - ✅ Create shared types
   - ⬜ Create domain entity interfaces
   - ⬜ Create repository interfaces
   - ⬜ Create service interfaces

4. **Convert Modules**
   - ⬜ Convert user module
   - ⬜ Convert role module
   - ⬜ Convert other modules

5. **Update Imports**
   - ⬜ Replace require() with import
   - ⬜ Replace module.exports with export

6. **Testing**
   - ⬜ Update test files to TypeScript
   - ⬜ Run tests to ensure functionality

## File Conversion Process

For each JavaScript file:

1. Rename from `.js` to `.ts`
2. Convert CommonJS imports/exports to ES modules
3. Add type annotations
4. Fix any TypeScript errors

You can use the script at `scripts/migrate-to-ts.js` to automate the renaming process.

## Common Patterns

### Converting CommonJS to ES Modules

```javascript
// Before (CommonJS)
const express = require('express');
const { someFunction } = require('./someModule');

module.exports = { exportedFunction };
```

```typescript
// After (ES Modules)
import express from 'express';
import { someFunction } from './someModule';

export { exportedFunction };
```

### Adding Types to Functions

```javascript
// Before
function getUserById(id) {
  return User.findById(id);
}
```

```typescript
// After
function getUserById(id: string): Promise<IUser | null> {
  return User.findById(id);
}
```

### Adding Types to Mongoose Models

```javascript
// Before
const userSchema = new mongoose.Schema({
  name: String,
  email: String
});
```

```typescript
// After
interface IUser extends Document {
  name: string;
  email: string;
}

const userSchema = new mongoose.Schema<IUser>({
  name: String,
  email: String
});
```

## Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [TypeScript with Express.js](https://blog.logrocket.com/typescript-with-node-js-and-express/)
- [Mongoose with TypeScript](https://mongoosejs.com/docs/typescript.html) 