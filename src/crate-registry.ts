import type { CrateFeature, CrateRegistryAPI, CrateRegistryStats } from './types.js';

export function createCrateRegistry(): CrateRegistryAPI {
  const features = new Map<string, CrateFeature>();
  let totalRegistered = 0;
  let totalRemoved = 0;

  return {
    registerFeature(name: string): void {
      if (features.has(name)) return; // idempotent
      features.set(name, { name, registeredAtMs: Date.now() });
      totalRegistered++;
    },

    removeFeature(name: string): void {
      if (!features.has(name)) return; // idempotent
      features.delete(name);
      totalRemoved++;
    },

    hasFeature(name: string): boolean {
      return features.has(name);
    },

    listFeatures(): string[] {
      return Array.from(features.keys());
    },

    getStats(): CrateRegistryStats {
      return {
        featureCount: features.size,
        totalRegistered,
        totalRemoved,
      };
    },

    destroy(): void {
      features.clear();
    },
  };
}
