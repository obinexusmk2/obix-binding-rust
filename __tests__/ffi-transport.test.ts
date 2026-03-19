import { afterEach, describe, expect, it } from 'vitest';
import { createFFITransport, normalizeFunctionIdentifier } from '../src/ffi-transport.js';

describe('normalizeFunctionIdentifier', () => {
  it('returns string as-is when non-empty', () => {
    expect(normalizeFunctionIdentifier('myFunc')).toBe('myFunc');
  });

  it('returns undefined for empty string', () => {
    expect(normalizeFunctionIdentifier('')).toBeUndefined();
  });

  it('returns undefined for whitespace-only string', () => {
    expect(normalizeFunctionIdentifier('   ')).toBeUndefined();
  });

  it('reads functionId from object', () => {
    expect(normalizeFunctionIdentifier({ functionId: 'greet' })).toBe('greet');
  });

  it('falls back to id then name', () => {
    expect(normalizeFunctionIdentifier({ id: 'myId' })).toBe('myId');
    expect(normalizeFunctionIdentifier({ name: 'myName' })).toBe('myName');
  });

  it('returns undefined for empty object', () => {
    expect(normalizeFunctionIdentifier({})).toBeUndefined();
  });
});

describe('createFFITransport', () => {
  const config = { ffiPath: '/tmp/librust.so', schemaMode: 'hybrid' as const, bindingName: 'rust' };

  afterEach(() => {
    delete (globalThis as any).__obixAbiInvoker;
  });

  it('buildEnvelope produces correct shape', () => {
    const transport = createFFITransport(config);
    const env = transport.buildEnvelope('fn1', [1, 2]);
    expect(env).toMatchObject({
      functionId: 'fn1',
      args: [1, 2],
      metadata: {
        schemaMode: 'hybrid',
        binding: 'rust',
        ffiPath: '/tmp/librust.so',
      },
    });
    expect(typeof env.metadata.timestampMs).toBe('number');
  });

  it('dispatch returns MISSING_SYMBOL when no ABI invoker registered', async () => {
    const transport = createFFITransport(config);
    const env = transport.buildEnvelope('fn1', []);
    const result = await transport.dispatch(env);
    expect(result).toMatchObject({ code: 'MISSING_SYMBOL' });
  });

  it('dispatch returns result from ABI invoker', async () => {
    (globalThis as any).__obixAbiInvoker = {
      invoke: (payload: string) => ({ parsed: JSON.parse(payload) }),
    };
    const transport = createFFITransport(config);
    const env = transport.buildEnvelope('greet', ['world']);
    const result = await transport.dispatch(env);
    expect(result).toMatchObject({ parsed: { functionId: 'greet', args: ['world'] } });
  });

  it('dispatch returns INVOCATION_FAILED when ABI invoker throws', async () => {
    (globalThis as any).__obixAbiInvoker = {
      invoke: () => { throw new Error('ABI fault'); },
    };
    const transport = createFFITransport(config);
    const env = transport.buildEnvelope('boom', []);
    const result = await transport.dispatch(env);
    expect(result).toMatchObject({ code: 'INVOCATION_FAILED' });
  });

  it('destroy does not throw', () => {
    const transport = createFFITransport(config);
    expect(() => transport.destroy()).not.toThrow();
  });
});
