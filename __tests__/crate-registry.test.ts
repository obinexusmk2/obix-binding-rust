import { describe, expect, it } from 'vitest';
import { createCrateRegistry } from '../src/crate-registry.js';

describe('createCrateRegistry', () => {
  it('getStats returns zero counts initially', () => {
    const registry = createCrateRegistry();
    expect(registry.getStats()).toEqual({
      featureCount: 0,
      totalRegistered: 0,
      totalRemoved: 0,
    });
  });

  it('hasFeature returns false for unregistered name', () => {
    const registry = createCrateRegistry();
    expect(registry.hasFeature('serde')).toBe(false);
  });

  it('registerFeature registers the feature', () => {
    const registry = createCrateRegistry();
    registry.registerFeature('serde');
    expect(registry.hasFeature('serde')).toBe(true);
    expect(registry.getStats().featureCount).toBe(1);
    expect(registry.getStats().totalRegistered).toBe(1);
  });

  it('registerFeature is idempotent — double-registering does not increment totalRegistered twice', () => {
    const registry = createCrateRegistry();
    registry.registerFeature('tokio');
    registry.registerFeature('tokio');
    expect(registry.getStats().featureCount).toBe(1);
    expect(registry.getStats().totalRegistered).toBe(1);
  });

  it('removeFeature removes the feature', () => {
    const registry = createCrateRegistry();
    registry.registerFeature('serde');
    registry.removeFeature('serde');
    expect(registry.hasFeature('serde')).toBe(false);
    expect(registry.getStats().featureCount).toBe(0);
    expect(registry.getStats().totalRemoved).toBe(1);
  });

  it('removeFeature is idempotent — removing absent feature does not increment totalRemoved', () => {
    const registry = createCrateRegistry();
    registry.removeFeature('nonexistent');
    expect(registry.getStats().totalRemoved).toBe(0);
  });

  it('listFeatures returns all registered feature names', () => {
    const registry = createCrateRegistry();
    registry.registerFeature('serde');
    registry.registerFeature('tokio');
    registry.registerFeature('anyhow');
    expect(registry.listFeatures().sort()).toEqual(['anyhow', 'serde', 'tokio']);
  });

  it('listFeatures excludes removed features', () => {
    const registry = createCrateRegistry();
    registry.registerFeature('serde');
    registry.registerFeature('tokio');
    registry.removeFeature('serde');
    expect(registry.listFeatures()).toEqual(['tokio']);
  });

  it('getStats.featureCount reflects current live count', () => {
    const registry = createCrateRegistry();
    registry.registerFeature('serde');
    registry.registerFeature('tokio');
    registry.removeFeature('serde');
    expect(registry.getStats().featureCount).toBe(1);
    expect(registry.getStats().totalRegistered).toBe(2);
    expect(registry.getStats().totalRemoved).toBe(1);
  });

  it('destroy clears all entries', () => {
    const registry = createCrateRegistry();
    registry.registerFeature('serde');
    registry.registerFeature('tokio');
    registry.destroy();
    expect(registry.getStats().featureCount).toBe(0);
    expect(registry.listFeatures()).toEqual([]);
  });
});
