import { describe, expect, it } from 'vitest';
import { createSchemaResolver } from '../src/schema-resolver.js';

describe('createSchemaResolver', () => {
  it('resolve returns correct shape for monoglot mode', () => {
    const resolver = createSchemaResolver({ schemaMode: 'monoglot', wasmTarget: 'wasm32-wasi' });
    expect(resolver.resolve()).toEqual({
      mode: 'monoglot',
      wasmTarget: 'wasm32-wasi',
      supportsMultiLanguage: false,
      wasmEnabled: false,
      bindgenEnabled: false,
      ltoEnabled: false,
    });
  });

  it('resolve returns correct shape for polyglot mode', () => {
    const resolver = createSchemaResolver({ schemaMode: 'polyglot', wasmTarget: 'wasm32-unknown-unknown' });
    expect(resolver.resolve()).toEqual({
      mode: 'polyglot',
      wasmTarget: 'wasm32-unknown-unknown',
      supportsMultiLanguage: true,
      wasmEnabled: true,
      bindgenEnabled: true,
      ltoEnabled: true,
    });
  });

  it('resolve returns correct shape for hybrid mode', () => {
    const resolver = createSchemaResolver({ schemaMode: 'hybrid' });
    expect(resolver.resolve()).toEqual({
      mode: 'hybrid',
      wasmTarget: 'unknown',
      supportsMultiLanguage: true,
      wasmEnabled: true,
      bindgenEnabled: true,
      ltoEnabled: true,
    });
  });

  it('wasmEnabled is false only for monoglot', () => {
    for (const mode of ['polyglot', 'hybrid'] as const) {
      const resolver = createSchemaResolver({ schemaMode: mode });
      expect(resolver.resolve().wasmEnabled).toBe(true);
    }
    const monoResolver = createSchemaResolver({ schemaMode: 'monoglot' });
    expect(monoResolver.resolve().wasmEnabled).toBe(false);
  });

  it('wasmTarget defaults to "unknown" when not configured', () => {
    const resolver = createSchemaResolver({ schemaMode: 'hybrid' });
    expect(resolver.resolve().wasmTarget).toBe('unknown');
  });

  it('validate returns true for valid schema modes', () => {
    const resolver = createSchemaResolver({ schemaMode: 'hybrid' });
    expect(resolver.validate('monoglot')).toBe(true);
    expect(resolver.validate('polyglot')).toBe(true);
    expect(resolver.validate('hybrid')).toBe(true);
  });

  it('validate returns false for invalid schema mode', () => {
    const resolver = createSchemaResolver({ schemaMode: 'hybrid' });
    expect(resolver.validate('unknown' as any)).toBe(false);
    expect(resolver.validate('' as any)).toBe(false);
  });

  it('getMode returns configured mode', () => {
    const resolver = createSchemaResolver({ schemaMode: 'polyglot' });
    expect(resolver.getMode()).toBe('polyglot');
  });

  it('destroy does not throw', () => {
    const resolver = createSchemaResolver({ schemaMode: 'hybrid' });
    expect(() => resolver.destroy()).not.toThrow();
  });
});
