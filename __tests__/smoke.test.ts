import { afterEach, describe, expect, it } from 'vitest';
import { createRustBinding } from '../src/index.js';

describe('rust binding smoke', () => {
  afterEach(() => {
    delete (globalThis as any).__obixAbiInvoker;
  });

  it('toggles initialize/destroy state and uses shared invocation envelope', async () => {
    const ffiPath = '/tmp/obix-rust-ffi.mock';

    const binding = createRustBinding({
      ffiPath,
      schemaMode: 'hybrid',
      memoryModel: 'hybrid',
    });

    expect(binding.isInitialized()).toBe(false);

    const beforeInit = await binding.invoke('ping', [1]);
    expect(beforeInit).toMatchObject({ code: 'NOT_INITIALIZED' });

    await binding.initialize();
    expect(binding.isInitialized()).toBe(true);

    const noSymbol = await binding.invoke('ping', [1]);
    expect(noSymbol).toMatchObject({ code: 'MISSING_SYMBOL' });

    (globalThis as any).__obixAbiInvoker = {
      invoke: (payload: string) => {
        const envelope = JSON.parse(payload);
        return { ok: true, echo: envelope };
      },
    };

    const result = await binding.invoke('ping', [1, 2, 3]);
    expect(result).toMatchObject({
      ok: true,
      echo: {
        functionId: 'ping',
        args: [1, 2, 3],
        metadata: { binding: 'rust', ffiPath },
      },
    });

    await binding.destroy();
    expect(binding.isInitialized()).toBe(false);
  });

  it('getMemoryUsage returns RustWasmMemoryStats shape', async () => {
    const binding = createRustBinding({
      ffiPath: '/tmp/test.so',
      schemaMode: 'polyglot',
      memoryModel: 'manual',
    });
    const mem = binding.getMemoryUsage();
    expect(mem).toMatchObject({
      wasmMemoryPages: 0,
      wasmMemoryBytes: 0,
      heapAllocationBytes: 0,
      stackBytes: 0,
      peakMemoryBytes: 0,
    });
  });

  it('getSchemaMode returns configured mode', async () => {
    const binding = createRustBinding({
      ffiPath: '/tmp/test.so',
      schemaMode: 'polyglot',
      memoryModel: 'manual',
    });
    expect(binding.getSchemaMode()).toBe('polyglot');
  });

  it('sub-module accessors are defined', async () => {
    const binding = createRustBinding({
      ffiPath: '/tmp/test.so',
      schemaMode: 'hybrid',
      memoryModel: 'hybrid',
    });
    expect(binding.ffiTransport).toBeDefined();
    expect(binding.wasmMemoryTracker).toBeDefined();
    expect(binding.crateRegistry).toBeDefined();
    expect(binding.schemaResolver).toBeDefined();
  });

  it('registerCrateFeature before init is a no-op', async () => {
    const binding = createRustBinding({
      ffiPath: '/tmp/test.so',
      schemaMode: 'hybrid',
      memoryModel: 'hybrid',
    });
    binding.registerCrateFeature('serde');
    expect(binding.getCrateStats().featureCount).toBe(0);
  });

  it('registerCrateFeature after init registers the feature', async () => {
    const binding = createRustBinding({
      ffiPath: '/tmp/test.so',
      schemaMode: 'hybrid',
      memoryModel: 'hybrid',
    });
    await binding.initialize();
    binding.registerCrateFeature('serde');
    expect(binding.getCrateStats().featureCount).toBe(1);
    await binding.destroy();
  });

  it('crateFeatures in config are registered on initialize', async () => {
    const binding = createRustBinding({
      ffiPath: '/tmp/test.so',
      schemaMode: 'hybrid',
      memoryModel: 'hybrid',
      crateFeatures: ['serde', 'tokio'],
    });
    await binding.initialize();
    expect(binding.getCrateStats().featureCount).toBe(2);
    await binding.destroy();
  });
});
