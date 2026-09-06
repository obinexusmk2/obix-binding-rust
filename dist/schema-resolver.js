const VALID_MODES = ['monoglot', 'polyglot', 'hybrid'];
export function createSchemaResolver(config) {
    return {
        resolve() {
            const { schemaMode, wasmTarget } = config;
            const isPolyglot = schemaMode !== 'monoglot';
            return {
                mode: schemaMode,
                wasmTarget: wasmTarget ?? 'unknown',
                supportsMultiLanguage: isPolyglot,
                wasmEnabled: isPolyglot,
                bindgenEnabled: schemaMode === 'polyglot' || schemaMode === 'hybrid',
                ltoEnabled: isPolyglot,
            };
        },
        validate(mode) {
            return VALID_MODES.includes(mode);
        },
        getMode() {
            return config.schemaMode;
        },
        destroy() {
        },
    };
}
//# sourceMappingURL=schema-resolver.js.map