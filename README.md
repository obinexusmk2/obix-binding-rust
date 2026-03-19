# @obinexusltd/obix-binding-rust

TypeScript bindings for OBIX Rust runtime integration through the libpolycall ABI bridge, targeting WebAssembly.

## Overview

`@obinexusltd/obix-binding-rust` provides a modular bridge API for:

- Creating and initializing a Rust/WASM binding configuration
- Invoking ABI-backed polyglot functions with structured envelopes
- Returning consistent typed invocation errors
- Tracking WebAssembly memory growth and heap allocation across the binding lifecycle
- Managing crate feature flags via a feature registry
- Resolving schema capabilities per `SchemaMode` (WASM, bindgen, LTO)

## Installation

```bash
npm install @obinexusltd/obix-binding-rust
```

## Usage

```ts
import { createRustBinding } from '@obinexusltd/obix-binding-rust';

const binding = createRustBinding({
  ffiPath: '/path/to/libpolycall.so',
  schemaMode: 'hybrid',
  memoryModel: 'manual',
  wasmTarget: 'wasm32-unknown-unknown',
  optimizationLevel: 'release',
  ltoEnabled: true,
  crateFeatures: ['serde', 'tokio'],
});

await binding.initialize();

// Invoke a polyglot function
const result = await binding.invoke('process_frame', [width, height]);
console.log(result);

// Register an additional crate feature at runtime
binding.registerCrateFeature('rayon');
console.log(binding.getCrateStats());

// Track WASM memory growth
binding.wasmMemoryTracker.recordGrow(2);
const mem = binding.getMemoryUsage();
console.log(mem.wasmMemoryPages, mem.wasmMemoryBytes);

// Compile and deploy a WASM module (stub — grows memory tracker by 1 page)
await binding.compileAndDeploy(wasmBuffer);

await binding.destroy();
```

## API

### `createRustBinding(config: RustBindingConfig): RustBindingBridge`

Creates a binding bridge with lifecycle and invocation methods.

#### Lifecycle

| Method | Description |
|--------|-------------|
| `initialize()` | Validates `ffiPath` and `schemaMode`, registers configured crate features |
| `invoke(fn, args)` | Invokes a polyglot function through the libpolycall ABI |
| `destroy()` | Tears down all sub-modules and marks binding uninitialized |
| `isInitialized()` | Returns whether the binding is ready |

#### Memory

| Method | Description |
|--------|-------------|
| `getMemoryUsage()` | Returns `RustWasmMemoryStats` snapshot |

#### Crate features

| Method | Description |
|--------|-------------|
| `registerCrateFeature(name)` | Registers a crate feature (no-op if not initialized) |
| `getCrateStats()` | Returns `CrateRegistryStats` with registered/removed counts |

#### WASM deployment

| Method | Description |
|--------|-------------|
| `compileAndDeploy(wasmBuffer)` | Stub — records 1 page of WASM memory growth |

#### Sub-module accessors

| Accessor | Type | Description |
|----------|------|-------------|
| `ffiTransport` | `FFITransportAPI` | Raw envelope builder and dispatcher |
| `wasmMemoryTracker` | `WasmMemoryTrackerAPI` | WASM page-based memory tracker |
| `crateRegistry` | `CrateRegistryAPI` | Crate feature flag registry |
| `schemaResolver` | `RustSchemaResolverAPI` | Schema mode resolver and validator |

### `RustBindingConfig`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `ffiPath` | `string` | required | Path to the libpolycall shared library |
| `schemaMode` | `'monoglot' \| 'polyglot' \| 'hybrid'` | required | Polyglot interop mode |
| `memoryModel` | `'gc' \| 'manual' \| 'hybrid'` | required | Memory management strategy |
| `wasmTarget` | `RustWasmTarget` | `undefined` | WASM compile target triple |
| `crateFeatures` | `string[]` | `[]` | Crate features registered on `initialize()` |
| `optimizationLevel` | `'dev' \| 'release'` | `undefined` | Rust optimization profile |
| `ltoEnabled` | `boolean` | `undefined` | Link-time optimization |
| `bindgenConfig` | `object` | `undefined` | wasm-bindgen configuration options |
| `crateRegistryMaxSize` | `number` | unlimited | Maximum registered feature entries |

## Error model

Invocation errors are returned as typed objects (never thrown):

| Code | Meaning |
|------|---------|
| `NOT_INITIALIZED` | `invoke` called before `initialize()` |
| `MISSING_SYMBOL` | No `__obixAbiInvoker` registered, or function identifier missing |
| `INVOCATION_FAILED` | The ABI invoker threw during dispatch |

Each error includes the full `InvocationEnvelope` for debugging at ABI boundaries.

## Schema capabilities by mode

| Capability | `monoglot` | `hybrid` | `polyglot` |
|-----------|-----------|---------|-----------|
| `wasmEnabled` | No | Yes | Yes |
| `bindgenEnabled` | No | Yes | Yes |
| `ltoEnabled` | No | Yes | Yes |
| `supportsMultiLanguage` | No | Yes | Yes |

## Development

```bash
npm run build
npm test
```

## License

MIT
