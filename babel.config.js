module.exports = {
  presets: ['@babel/preset-env'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@modules': './src/modules',
          '@shared': './src/shared',
          '@validation': './src/shared/application/validation',
          '@errors': './src/shared/infrastructure/errors',
          '@middleware': './src/shared/infrastructure/middleware',
          '@logging': './src/shared/infrastructure/logging',
          '@database': './src/shared/infrastructure/database',
          '@cache': './src/shared/infrastructure/cache',
          '@user-model': './src/modules/user/infrastructure/user.model',
          '@role-model': './src/modules/role/infrastructure/role.model',
          '@property-model': './src/modules/property/infrastructure/property.model',
          '@publication-model': './src/modules/publication/infrastructure/publication.model',
          '@user-repository': './src/modules/user/infrastructure/user.repository',
          '@role-repository': './src/modules/role/infrastructure/role.repository',
          '@owner-model': './src/modules/owner/infrastructure/owner.model',
          '@owner-repository': './src/modules/owner/infrastructure/owner.repository',
          '@owner-schema': './src/modules/owner/domain/owner.schema',
          '@owner-entity': './src/modules/owner/domain/owner.entity',
          '@owner-service': './src/modules/owner/application/owner.service',
          '@owner-controller': './src/modules/owner/interface/owner.controller',
          '@property-repository': './src/modules/property/infrastructure/property.repository',
          '@publication-repository':
            './src/modules/publication/infrastructure/publication.repository',
          '@user-service': './src/modules/user/application/user.service',
          '@role-service': './src/modules/role/application/role.service',
          '@publication-service': './src/modules/publication/application/publication.service',
          '@property-service': './src/modules/property/application/property.service',
          '@user-controller': './src/modules/user/interface/user.controller',
          '@role-controller': './src/modules/role/interface/role.controller',
          '@publication-controller': './src/modules/publication/interface/publication.controller',
          '@property-controller': './src/modules/property/interface/property.controller',
          '@utils': './src/shared/utils',
        },
      },
    ],
  ],
};
