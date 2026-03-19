export function createCrateRegistry() {
    const features = new Map();
    let totalRegistered = 0;
    let totalRemoved = 0;
    return {
        registerFeature(name) {
            if (features.has(name))
                return; // idempotent
            features.set(name, { name, registeredAtMs: Date.now() });
            totalRegistered++;
        },
        removeFeature(name) {
            if (!features.has(name))
                return; // idempotent
            features.delete(name);
            totalRemoved++;
        },
        hasFeature(name) {
            return features.has(name);
        },
        listFeatures() {
            return Array.from(features.keys());
        },
        getStats() {
            return {
                featureCount: features.size,
                totalRegistered,
                totalRemoved,
            };
        },
        destroy() {
            features.clear();
        },
    };
}
//# sourceMappingURL=crate-registry.js.map