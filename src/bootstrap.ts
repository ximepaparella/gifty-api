/**
 * This file is used to bootstrap the application during the migration from JavaScript to TypeScript.
 * It sets up module aliases for both JavaScript and TypeScript files.
 */

import path from 'path';
import moduleAlias from 'module-alias';

// Define the base directory
const baseDir = path.resolve(__dirname);

// Register module aliases
moduleAlias.addAliases({
  '@modules': path.join(baseDir, 'modules'),
  '@shared': path.join(baseDir, 'shared'),
  '@validation': path.join(baseDir, 'shared/application/validation'),
  '@errors': path.join(baseDir, 'shared/infrastructure/errors'),
  '@middleware': path.join(baseDir, 'shared/infrastructure/middleware'),
  '@logging': path.join(baseDir, 'shared/infrastructure/logging'),
  '@database': path.join(baseDir, 'shared/infrastructure/database'),
  '@cache': path.join(baseDir, 'shared/infrastructure/cache'),
  '@user-model': path.join(baseDir, 'modules/user/infrastructure/user.model'),
  '@user-repository': path.join(baseDir, 'modules/user/infrastructure/user.repository'),
  '@user-service': path.join(baseDir, 'modules/user/application/user.service'),
  '@user-controller': path.join(baseDir, 'modules/user/interface/user.controller'),
  '@role-model': path.join(baseDir, 'modules/role/infrastructure/role.model'),
  '@role-repository': path.join(baseDir, 'modules/role/infrastructure/role.repository'),
  '@role-service': path.join(baseDir, 'modules/role/application/role.service'),
  '@role-controller': path.join(baseDir, 'modules/role/interface/role.controller'),
  '@utils': path.join(baseDir, 'shared/utils')
}); 