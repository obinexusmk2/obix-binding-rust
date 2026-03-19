/**
 * OBIX Rust Binding
 * Performance-critical components, WebAssembly target
 * Connects libpolycall FFI/polyglot bridge to Rust runtime
 */

export type {
  BindingAbiInvoker,
  BindingInvokeError,
  CrateFeature,
  CrateRegistryAPI,
  CrateRegistryStats,
  FFITransportAPI,
  FFITransportConfig,
  InvocationEnvelope,
  RustBindingBridge,
  RustBindingConfig,
  RustFFIDescriptor,
  RustOptimizationLevel,
  RustResolvedSchema,
  RustSchemaResolverAPI,
  RustSchemaResolverConfig,
  RustWasmMemoryStats,
  RustWasmTarget,
  SchemaMode,
  WasmMemoryTrackerAPI,
} from './types.js';

export { normalizeFunctionIdentifier, createFFITransport } from './ffi-transport.js';
export { createWasmMemoryTracker } from './wasm-memory-tracker.js';
export { createCrateRegistry } from './crate-registry.js';
export { createSchemaResolver } from './schema-resolver.js';

import type {
  BindingInvokeError,
  CrateRegistryStats,
  FFITransportAPI,
  CrateRegistryAPI,
  RustBindingBridge,
  RustBindingConfig,
  RustWasmMemoryStats,
  RustSchemaResolverAPI,
  SchemaMode,
  WasmMemoryTrackerAPI,
} from './types.js';
import { normalizeFunctionIdentifier, createFFITransport } from './ffi-transport.js';
import { createWasmMemoryTracker } from './wasm-memory-tracker.js';
import { createCrateRegistry } from './crate-registry.js';
import { createSchemaResolver } from './schema-resolver.js';

export function createRustBinding(config: RustBindingConfig): RustBindingBridge {
  let initialized = false;

  const ffiTransport: FFITransportAPI = createFFITransport({
    ffiPath: config.ffiPath,
    schemaMode: config.schemaMode,
    bindingName: 'rust',
  });

  const wasmMemoryTracker: WasmMemoryTrackerAPI = createWasmMemoryTracker();

  const crateRegistry: CrateRegistryAPI = createCrateRegistry();

  const schemaResolver: RustSchemaResolverAPI = createSchemaResolver({
    schemaMode: config.schemaMode,
    wasmTarget: config.wasmTarget,
  });

  return {
    async initialize(): Promise<void> {
      if (typeof config.ffiPath !== 'string' || config.ffiPath.trim().length === 0) {
        throw new Error(`Invalid ffiPath: ${config.ffiPath}`);
      }
      if (!schemaResolver.validate(config.schemaMode)) {
        throw new Error(`Invalid schemaMode: ${config.schemaMode}`);
      }
      for (const feature of config.crateFeatures ?? []) {
        crateRegistry.registerFeature(feature);
      }
      initialized = true;
    },

    async invoke(fn: string | object, args: unknown[]): Promise<unknown> {
      const functionId = normalizeFunctionIdentifier(fn);
      const envelope = ffiTransport.buildEnvelope(functionId ?? '<unknown>', args);

      if (!initialized) {
        return {
          code: 'NOT_INITIALIZED',
          message: 'Binding is not initialized',
          envelope,
        } satisfies BindingInvokeError;
      }

      if (!functionId) {
        return {
          code: 'MISSING_SYMBOL',
          message: 'Function identifier was not provided',
          envelope,
        } satisfies BindingInvokeError;
      }

      return ffiTransport.dispatch(envelope);
    },

    async destroy(): Promise<void> {
      ffiTransport.destroy();
      wasmMemoryTracker.destroy();
      crateRegistry.destroy();
      schemaResolver.destroy();
      initialized = false;
    },

    getMemoryUsage(): RustWasmMemoryStats {
      return wasmMemoryTracker.snapshot();
    },

    getSchemaMode(): SchemaMode {
      return schemaResolver.getMode();
    },

    isInitialized(): boolean {
      return initialized;
    },

    async compileAndDeploy(_wasmBuffer: ArrayBuffer): Promise<void> {
      if (!initialized) {
        return;
      }
      wasmMemoryTracker.recordGrow(1);
    },

    registerCrateFeature(name: string): void {
      if (!initialized) {
        return;
      }
      crateRegistry.registerFeature(name);
    },

    getCrateStats(): CrateRegistryStats {
      return crateRegistry.getStats();
    },

    get ffiTransport(): FFITransportAPI {
      return ffiTransport;
    },

    get wasmMemoryTracker(): WasmMemoryTrackerAPI {
      return wasmMemoryTracker;
    },

    get crateRegistry(): CrateRegistryAPI {
      return crateRegistry;
    },

    get schemaResolver(): RustSchemaResolverAPI {
      return schemaResolver;
    },
  };
}
