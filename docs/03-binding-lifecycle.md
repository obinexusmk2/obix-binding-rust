# Binding Lifecycle and Configuration

## Factory

```ts
const binding = createRustBinding(config);
```

## `RustBindingConfig`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `ffiPath` | `string` | **required** | Path to the libpolycall shared library |
| `schemaMode` | `'monoglot' \| 'polyglot' \| 'hybrid'` | **required** | Polyglot interop mode |
| `wasmTarget` | `RustWasmTarget` | — | Target triple / wasm flavour for the schema resolver |
| `crateFeatures` | `CrateFeature[]` | `[]` | Cargo features registered at `initialize()` |
| `optimizationLevel` | `RustOptimizationLevel` | — | Optimisation-level hint |

## Lifecycle methods

| Method | Description |
|--------|-------------|
| `initialize(): Promise<void>` | Validates `ffiPath` (non-empty string) and `schemaMode` (valid enum). **Throws** on invalid input. Marks the binding ready. |
| `invoke(fn, args): Promise<unknown>` | Build an envelope for `fn` and dispatch it. Returns the native result, or a `BindingInvokeError` object — **never throws**. |
| `destroy(): Promise<void>` | Tear down every sub-module and mark the binding uninitialised. Not reusable afterwards. |
| `isInitialized(): boolean` | Ready state. |
| `getSchemaMode(): SchemaMode` | The resolved schema mode. |
| `getMemoryUsage()` | Rust memory snapshot (`RustWasmMemoryStats`). |

`fn` may be a string, or an object with `functionId` / `id` / `name` — see
[04-ffi-transport-and-abi.md](04-ffi-transport-and-abi.md).

## Rust-specific bridge methods

| Method | Description |
|--------|-------------|
| `compileAndDeploy(wasmBuffer: ArrayBuffer): Promise<void>` | Record a wasm module deploy (grows the tracked linear memory); no-op before `initialize()` |
| `registerCrateFeature(name: string): void` | Add a Cargo feature to the registry |
| `getCrateStats(): CrateRegistryStats` | Registered feature count and names |

## Sub-module accessors

```ts
binding.ffiTransport        // FFITransportAPI
binding.wasmMemoryTracker   // WasmMemoryTrackerAPI
binding.crateRegistry       // CrateRegistryAPI
binding.schemaResolver      // RustSchemaResolverAPI
```

## Example

```ts
const binding = createRustBinding({
  ffiPath: '/opt/lib/libpolycall.so',
  schemaMode: 'polyglot',
  memoryModel: 'hybrid',
});

await binding.initialize();
const result = await binding.invoke('renderFrame', [1920, 1080]);
console.log(binding.getMemoryUsage());
await binding.destroy();
```
