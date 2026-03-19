/**
 * OBIX Rust Binding — shared types
 */

// ── Shared FFI / Envelope ─────────────────────────────────────────────────────

export type SchemaMode = 'monoglot' | 'polyglot' | 'hybrid';

export interface InvocationEnvelope {
  functionId: string;
  args: unknown[];
  metadata: {
    schemaMode: SchemaMode;
    binding: string;
    timestampMs: number;
    ffiPath: string;
  };
}

export interface BindingInvokeError {
  code: 'NOT_INITIALIZED' | 'MISSING_SYMBOL' | 'INVOCATION_FAILED';
  message: string;
  envelope: InvocationEnvelope;
  cause?: unknown;
}

export interface BindingAbiInvoker {
  invoke(envelopeJson: string): unknown | Promise<unknown>;
}

// ── FFI Transport ─────────────────────────────────────────────────────────────

export interface FFITransportConfig {
  ffiPath: string;
  schemaMode: SchemaMode;
  bindingName: string;
}

export interface FFITransportAPI {
  buildEnvelope(functionId: string, args: unknown[]): InvocationEnvelope;
  dispatch(envelope: InvocationEnvelope): Promise<unknown>;
  destroy(): void;
}

// ── Rust-specific descriptor ──────────────────────────────────────────────────

export type RustWasmTarget =
  | 'wasm32-unknown-unknown'
  | 'wasm32-wasi'
  | 'wasm32-unknown-emscripten';

export type RustOptimizationLevel = 'dev' | 'release';

export interface RustFFIDescriptor {
  ffiPath: string;
  wasmTarget: RustWasmTarget;
  rustVersion: string;
  bindgenConfig?: {
    useFfiUnwind: boolean;
    implementDefault: boolean;
  };
  crateFeatures: string[];
}

export interface RustBindingConfig {
  ffiPath: string;
  wasmTarget?: RustWasmTarget;
  schemaMode: SchemaMode;
  memoryModel: 'gc' | 'manual' | 'hybrid';
  crateFeatures?: string[];
  bindgenConfig?: {
    useFfiUnwind?: boolean;
    implementDefault?: boolean;
    useFfiPtrs?: boolean;
  };
  optimizationLevel?: RustOptimizationLevel;
  ltoEnabled?: boolean;
  wasmMemory?: WebAssembly.Memory;
  ffiDescriptor?: RustFFIDescriptor;
  crateRegistryMaxSize?: number;
}

// ── WASM Memory Tracker ───────────────────────────────────────────────────────

export interface RustWasmMemoryStats {
  wasmMemoryPages: number;
  wasmMemoryBytes: number;
  heapAllocationBytes: number;
  stackBytes: number;
  peakMemoryBytes: number;
}

export interface WasmMemoryTrackerAPI {
  recordGrow(pages: number): void;
  recordUsed(bytes: number): void;
  snapshot(): RustWasmMemoryStats;
  reset(): void;
  destroy(): void;
}

// ── Crate Registry ────────────────────────────────────────────────────────────

export interface CrateFeature {
  name: string;
  registeredAtMs: number;
}

export interface CrateRegistryStats {
  featureCount: number;
  totalRegistered: number;
  totalRemoved: number;
}

export interface CrateRegistryAPI {
  registerFeature(name: string): void;
  removeFeature(name: string): void;
  hasFeature(name: string): boolean;
  listFeatures(): string[];
  getStats(): CrateRegistryStats;
  destroy(): void;
}

// ── Schema Resolver ───────────────────────────────────────────────────────────

export interface RustSchemaResolverConfig {
  schemaMode: SchemaMode;
  wasmTarget?: RustWasmTarget;
  rustVersion?: string;
}

export interface RustResolvedSchema {
  mode: SchemaMode;
  wasmTarget: string;
  supportsMultiLanguage: boolean;
  wasmEnabled: boolean;
  bindgenEnabled: boolean;
  ltoEnabled: boolean;
}

export interface RustSchemaResolverAPI {
  resolve(): RustResolvedSchema;
  validate(mode: SchemaMode): boolean;
  getMode(): SchemaMode;
  destroy(): void;
}

// ── Main Bridge ───────────────────────────────────────────────────────────────

export interface RustBindingBridge {
  initialize(): Promise<void>;
  invoke(fn: string | object, args: unknown[]): Promise<unknown>;
  destroy(): Promise<void>;
  getMemoryUsage(): RustWasmMemoryStats;
  getSchemaMode(): SchemaMode;
  isInitialized(): boolean;
  compileAndDeploy(wasmBuffer: ArrayBuffer): Promise<void>;
  registerCrateFeature(name: string): void;
  getCrateStats(): CrateRegistryStats;

  readonly ffiTransport: FFITransportAPI;
  readonly wasmMemoryTracker: WasmMemoryTrackerAPI;
  readonly crateRegistry: CrateRegistryAPI;
  readonly schemaResolver: RustSchemaResolverAPI;
}
