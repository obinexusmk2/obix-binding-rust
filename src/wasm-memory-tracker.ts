import type { RustWasmMemoryStats, WasmMemoryTrackerAPI } from './types.js';

const WASM_PAGE_BYTES = 65536;

export function createWasmMemoryTracker(): WasmMemoryTrackerAPI {
  let wasmMemoryPages = 0;
  let wasmMemoryBytes = 0;
  let heapAllocationBytes = 0;
  let peakMemoryBytes = 0;

  function updatePeak(): void {
    const current = wasmMemoryBytes + heapAllocationBytes;
    if (current > peakMemoryBytes) {
      peakMemoryBytes = current;
    }
  }

  return {
    recordGrow(pages: number): void {
      wasmMemoryPages += pages;
      wasmMemoryBytes += pages * WASM_PAGE_BYTES;
      updatePeak();
    },

    recordUsed(bytes: number): void {
      heapAllocationBytes += bytes;
      updatePeak();
    },

    snapshot(): RustWasmMemoryStats {
      return {
        wasmMemoryPages,
        wasmMemoryBytes,
        heapAllocationBytes,
        stackBytes: 0,
        peakMemoryBytes,
      };
    },

    reset(): void {
      wasmMemoryPages = 0;
      wasmMemoryBytes = 0;
      heapAllocationBytes = 0;
      // peakMemoryBytes is preserved across reset
    },

    destroy(): void {
      this.reset();
    },
  };
}
