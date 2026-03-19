/**
 * OBIX Rust Binding
 * Performance-critical components, WebAssembly target
 * Connects libpolycall FFI/polyglot bridge to Rust runtime
 */
export type { BindingAbiInvoker, BindingInvokeError, CrateFeature, CrateRegistryAPI, CrateRegistryStats, FFITransportAPI, FFITransportConfig, InvocationEnvelope, RustBindingBridge, RustBindingConfig, RustFFIDescriptor, RustOptimizationLevel, RustResolvedSchema, RustSchemaResolverAPI, RustSchemaResolverConfig, RustWasmMemoryStats, RustWasmTarget, SchemaMode, WasmMemoryTrackerAPI, } from './types.js';
export { normalizeFunctionIdentifier, createFFITransport } from './ffi-transport.js';
export { createWasmMemoryTracker } from './wasm-memory-tracker.js';
export { createCrateRegistry } from './crate-registry.js';
export { createSchemaResolver } from './schema-resolver.js';
import type { RustBindingBridge, RustBindingConfig } from './types.js';
export declare function createRustBinding(config: RustBindingConfig): RustBindingBridge;
//# sourceMappingURL=index.d.ts.map