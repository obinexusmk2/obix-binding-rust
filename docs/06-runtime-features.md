# Wasm Memory and the Crate Registry

## Wasm memory tracker

`binding.getMemoryUsage()` returns `RustWasmMemoryStats` — linear-memory page
count, bytes, and grow events. `compileAndDeploy(buffer)` records a module
deployment and grows the tracked page count by one; it is a no-op until
`initialize()` succeeds. `binding.wasmMemoryTracker.recordGrow(pages)` is the
low-level hook.

## Crate registry

Cargo features listed in `config.crateFeatures` are registered during
`initialize()`; add more later with `registerCrateFeature(name)`.
`getCrateStats()` returns `{ count, features }`. The registry is metadata only —
it does not compile anything.
