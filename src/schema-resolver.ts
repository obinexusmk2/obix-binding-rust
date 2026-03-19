import type {
  RustResolvedSchema,
  RustSchemaResolverAPI,
  RustSchemaResolverConfig,
  SchemaMode,
} from './types.js';

const VALID_MODES: SchemaMode[] = ['monoglot', 'polyglot', 'hybrid'];

export function createSchemaResolver(config: RustSchemaResolverConfig): RustSchemaResolverAPI {
  return {
    resolve(): RustResolvedSchema {
      const { schemaMode, wasmTarget } = config;
      const isPolyglot = schemaMode !== 'monoglot';
      return {
        mode: schemaMode,
        wasmTarget: wasmTarget ?? 'unknown',
        supportsMultiLanguage: isPolyglot,
        wasmEnabled: isPolyglot,
        bindgenEnabled: schemaMode === 'polyglot' || schemaMode === 'hybrid',
        ltoEnabled: isPolyglot,
      };
    },

    validate(mode: SchemaMode): boolean {
      return VALID_MODES.includes(mode);
    },

    getMode(): SchemaMode {
      return config.schemaMode;
    },

    destroy(): void {
      // Stateless — nothing to clean up
    },
  };
}
