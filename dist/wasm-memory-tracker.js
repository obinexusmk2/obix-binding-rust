const WASM_PAGE_BYTES = 65536;
export function createWasmMemoryTracker() {
    let wasmMemoryPages = 0;
    let wasmMemoryBytes = 0;
    let heapAllocationBytes = 0;
    let peakMemoryBytes = 0;
    function updatePeak() {
        const current = wasmMemoryBytes + heapAllocationBytes;
        if (current > peakMemoryBytes) {
            peakMemoryBytes = current;
        }
    }
    return {
        recordGrow(pages) {
            wasmMemoryPages += pages;
            wasmMemoryBytes += pages * WASM_PAGE_BYTES;
            updatePeak();
        },
        recordUsed(bytes) {
            heapAllocationBytes += bytes;
            updatePeak();
        },
        snapshot() {
            return {
                wasmMemoryPages,
                wasmMemoryBytes,
                heapAllocationBytes,
                stackBytes: 0,
                peakMemoryBytes,
            };
        },
        reset() {
            wasmMemoryPages = 0;
            wasmMemoryBytes = 0;
            heapAllocationBytes = 0;
            // peakMemoryBytes is preserved across reset
        },
        destroy() {
            this.reset();
        },
    };
}
//# sourceMappingURL=wasm-memory-tracker.js.map