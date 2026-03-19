/**
 * OBIX Rust Binding
 * Performance-critical components, WebAssembly target
 * Connects libpolycall FFI/polyglot bridge to Rust runtime
 */
export { normalizeFunctionIdentifier, createFFITransport } from './ffi-transport.js';
export { createWasmMemoryTracker } from './wasm-memory-tracker.js';
export { createCrateRegistry } from './crate-registry.js';
export { createSchemaResolver } from './schema-resolver.js';
import { normalizeFunctionIdentifier, createFFITransport } from './ffi-transport.js';
import { createWasmMemoryTracker } from './wasm-memory-tracker.js';
import { createCrateRegistry } from './crate-registry.js';
import { createSchemaResolver } from './schema-resolver.js';
export function createRustBinding(config) {
    let initialized = false;
    const ffiTransport = createFFITransport({
        ffiPath: config.ffiPath,
        schemaMode: config.schemaMode,
        bindingName: 'rust',
    });
    const wasmMemoryTracker = createWasmMemoryTracker();
    const crateRegistry = createCrateRegistry();
    const schemaResolver = createSchemaResolver({
        schemaMode: config.schemaMode,
        wasmTarget: config.wasmTarget,
    });
    return {
        async initialize() {
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
        async invoke(fn, args) {
            const functionId = normalizeFunctionIdentifier(fn);
            const envelope = ffiTransport.buildEnvelope(functionId ?? '<unknown>', args);
            if (!initialized) {
                return {
                    code: 'NOT_INITIALIZED',
                    message: 'Binding is not initialized',
                    envelope,
                };
            }
            if (!functionId) {
                return {
                    code: 'MISSING_SYMBOL',
                    message: 'Function identifier was not provided',
                    envelope,
                };
            }
            return ffiTransport.dispatch(envelope);
        },
        async destroy() {
            ffiTransport.destroy();
            wasmMemoryTracker.destroy();
            crateRegistry.destroy();
            schemaResolver.destroy();
            initialized = false;
        },
        getMemoryUsage() {
            return wasmMemoryTracker.snapshot();
        },
        getSchemaMode() {
            return schemaResolver.getMode();
        },
        isInitialized() {
            return initialized;
        },
        async compileAndDeploy(_wasmBuffer) {
            if (!initialized) {
                return;
            }
            wasmMemoryTracker.recordGrow(1);
        },
        registerCrateFeature(name) {
            if (!initialized) {
                return;
            }
            crateRegistry.registerFeature(name);
        },
        getCrateStats() {
            return crateRegistry.getStats();
        },
        get ffiTransport() {
            return ffiTransport;
        },
        get wasmMemoryTracker() {
            return wasmMemoryTracker;
        },
        get crateRegistry() {
            return crateRegistry;
        },
        get schemaResolver() {
            return schemaResolver;
        },
    };
}
//# sourceMappingURL=index.js.map