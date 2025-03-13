import moduleAlias from 'module-alias';
import path from 'path';

// Register module aliases for runtime
moduleAlias.addAliases({
  '@modules': path.resolve(__dirname, 'modules'),
  '@shared': path.resolve(__dirname, 'shared'),
  '@validation': path.resolve(__dirname, 'shared/application/validation'),
  '@errors': path.resolve(__dirname, 'shared/infrastructure/errors'),
  '@middleware': path.resolve(__dirname, 'shared/infrastructure/middleware'),
  '@logging': path.resolve(__dirname, 'shared/infrastructure/logging'),
  '@database': path.resolve(__dirname, 'shared/infrastructure/database'),
  '@cache': path.resolve(__dirname, 'shared/infrastructure/cache'),
  '@user-model': path.resolve(__dirname, 'modules/user/infrastructure/user.model'),
  '@user-repository': path.resolve(__dirname, 'modules/user/infrastructure/user.repository'),
  '@user-service': path.resolve(__dirname, 'modules/user/application/user.service'),
  '@user-controller': path.resolve(__dirname, 'modules/user/interface/user.controller'),
  '@role-model': path.resolve(__dirname, 'modules/role/infrastructure/role.model'),
  '@role-repository': path.resolve(__dirname, 'modules/role/infrastructure/role.repository'),
  '@role-service': path.resolve(__dirname, 'modules/role/application/role.service'),
  '@role-controller': path.resolve(__dirname, 'modules/role/interface/role.controller'),
  '@utils': path.resolve(__dirname, 'shared/utils'),
  '@store-model': path.resolve(__dirname, 'modules/store/infrastructure/store.model'),
  '@store-repository': path.resolve(__dirname, 'modules/store/infrastructure/store.repository'),
  '@store-service': path.resolve(__dirname, 'modules/store/application/store.service'),
  '@store-controller': path.resolve(__dirname, 'modules/store/interface/store.controller')
}); 