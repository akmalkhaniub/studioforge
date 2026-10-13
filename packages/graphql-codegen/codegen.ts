import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: '../api-graphql/schema.graphql',
  documents: ['src/operations/**/*.graphql'],
  generates: {
    './src/generated/types.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
      config: {
        withHooks: true,
        withComponent: false,
        withHOC: false,
        useIndexSignature: true,
        scalars: {
          ID: 'string',
          String: 'string',
          Boolean: 'boolean',
          Int: 'number',
          Float: 'number',
        },
      },
    },
  },
};

export default config;
