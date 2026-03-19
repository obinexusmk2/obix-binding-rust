import { describe, expect, it } from 'vitest';
import { createWasmMemoryTracker } from '../src/wasm-memory-tracker.js';

const PAGE_BYTES = 65536;

describe('createWasmMemoryTracker', () => {
  it('snapshot returns all zeros initially', () => {
    const tracker = createWasmMemoryTracker();
    expect(tracker.snapshot()).toEqual({
      wasmMemoryPages: 0,
      wasmMemoryBytes: 0,
      heapAllocationBytes: 0,
      stackBytes: 0,
      peakMemoryBytes: 0,
    });
  });

  it('recordGrow increases pages and bytes', () => {
    const tracker = createWasmMemoryTracker();
    tracker.recordGrow(2);
    const snap = tracker.snapshot();
    expect(snap.wasmMemoryPages).toBe(2);
    expect(snap.wasmMemoryBytes).toBe(2 * PAGE_BYTES);
  });

  it('recordGrow updates peakMemoryBytes', () => {
    const tracker = createWasmMemoryTracker();
    tracker.recordGrow(3);
    expect(tracker.snapshot().peakMemoryBytes).toBe(3 * PAGE_BYTES);

    tracker.recordGrow(1);
    expect(tracker.snapshot().peakMemoryBytes).toBe(4 * PAGE_BYTES);
  });

  it('recordUsed increases heapAllocationBytes', () => {
    const tracker = createWasmMemoryTracker();
    tracker.recordUsed(512);
    expect(tracker.snapshot().heapAllocationBytes).toBe(512);
  });

  it('recordUsed updates peakMemoryBytes', () => {
    const tracker = createWasmMemoryTracker();
    tracker.recordUsed(1024);
    expect(tracker.snapshot().peakMemoryBytes).toBe(1024);

    tracker.recordUsed(2048);
    expect(tracker.snapshot().peakMemoryBytes).toBe(3072);
  });

  it('stackBytes is always 0', () => {
    const tracker = createWasmMemoryTracker();
    tracker.recordGrow(1);
    tracker.recordUsed(100);
    expect(tracker.snapshot().stackBytes).toBe(0);
  });

  it('reset zeroes counts but preserves peakMemoryBytes', () => {
    const tracker = createWasmMemoryTracker();
    tracker.recordGrow(2);
    tracker.recordUsed(1000);
    const peakBefore = tracker.snapshot().peakMemoryBytes;

    tracker.reset();
    const snap = tracker.snapshot();
    expect(snap.wasmMemoryPages).toBe(0);
    expect(snap.wasmMemoryBytes).toBe(0);
    expect(snap.heapAllocationBytes).toBe(0);
    expect(snap.peakMemoryBytes).toBe(peakBefore);
  });

  it('destroy calls reset', () => {
    const tracker = createWasmMemoryTracker();
    tracker.recordGrow(4);
    tracker.destroy();
    const snap = tracker.snapshot();
    expect(snap.wasmMemoryPages).toBe(0);
    expect(snap.wasmMemoryBytes).toBe(0);
  });
});
