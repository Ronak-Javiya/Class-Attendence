const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

/**
 * Configuration Loader
 * 
 * Loads configuration from YAML files with the following priority (later overrides earlier):
 * 1. config/default.yaml - Base defaults
 * 2. config/{NODE_ENV}.yaml - Environment-specific overrides
 * 3. config/secrets/{NODE_ENV}.yaml - Secret values (gitignored)
 * 
 * Supports environment variable substitution with ${VAR:-default} syntax.
 */

const CONFIG_DIR = path.join(__dirname, '..', '..', 'config');
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Deep merge two objects
 * @param {Object} target - Target object
 * @param {Object} source - Source object to merge
 * @returns {Object} Merged object
 */
function deepMerge(target, source) {
    const output = Object.assign({}, target);
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
                if (!(key in target)) {
                    Object.assign(output, { [key]: source[key] });
                } else {
                    output[key] = deepMerge(target[key], source[key]);
                }
            } else {
                Object.assign(output, { [key]: source[key] });
            }
        });
    }
    return output;
}

/**
 * Check if value is an object
 * @param {*} item - Value to check
 * @returns {Boolean}
 */
function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Substitute environment variables in a string
 * Supports ${VAR:-default} syntax for defaults
 * @param {String} str - String containing variables
 * @returns {String} String with variables substituted
 */
function substituteEnvVars(str) {
    if (typeof str !== 'string') return str;
    
    return str.replace(/\$\{([^}]+)\}/g, (match, expr) => {
        // Support ${VAR:-default} syntax
        const parts = expr.split(':-');
        const varName = parts[0];
        const defaultValue = parts[1] || '';
        
        return process.env[varName] !== undefined ? process.env[varName] : defaultValue;
    });
}

/**
 * Recursively substitute environment variables in an object
 * @param {*} obj - Object or value to process
 * @returns {*} Processed object/value
 */
function substituteEnvVarsDeep(obj) {
    if (typeof obj === 'string') {
        return substituteEnvVars(obj);
    }
    if (Array.isArray(obj)) {
        return obj.map(substituteEnvVarsDeep);
    }
    if (isObject(obj)) {
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
            result[key] = substituteEnvVarsDeep(value);
        }
        return result;
    }
    return obj;
}

/**
 * Load a YAML file if it exists
 * @param {String} filePath - Path to YAML file
 * @returns {Object|null} Parsed YAML content or null
 */
function loadYamlFile(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            return yaml.load(content) || {};
        }
    } catch (error) {
        console.warn(`[Config] Warning: Failed to load ${filePath}:`, error.message);
    }
    return null;
}

/**
 * Load and merge configuration
 * @returns {Object} Merged configuration object
 */
function loadConfig() {
    console.log(`[Config] Loading configuration for environment: ${NODE_ENV}`);
    
    // Load default configuration
    let config = loadYamlFile(path.join(CONFIG_DIR, 'default.yaml')) || {};
    
    // Load environment-specific configuration
    const envConfig = loadYamlFile(path.join(CONFIG_DIR, `${NODE_ENV}.yaml`));
    if (envConfig) {
        config = deepMerge(config, envConfig);
    }
    
    // Load secrets configuration (gitignored)
    const secretsConfig = loadYamlFile(path.join(CONFIG_DIR, 'secrets', `${NODE_ENV}.yaml`));
    if (secretsConfig) {
        config = deepMerge(config, secretsConfig);
        console.log(`[Config] Loaded secrets from secrets/${NODE_ENV}.yaml`);
    } else {
        console.warn(`[Config] Warning: No secrets file found at config/secrets/${NODE_ENV}.yaml`);
        console.warn(`[Config] Create it by copying from config/secrets/${NODE_ENV}.yaml.example`);
    }
    
    // Substitute environment variables
    config = substituteEnvVarsDeep(config);
    
    // Validate required configuration
    validateConfig(config);
    
    return config;
}

/**
 * Validate required configuration fields
 * @param {Object} config - Configuration object
 * @throws {Error} If required fields are missing
 */
function validateConfig(config) {
    const requiredPaths = [
        'server.port',
        'server.env',
        'database.mongodb.uri',
        'jwt.access.secret',
        'jwt.refresh.secret',
        'jwt.access.expiry',
        'jwt.refresh.expiry',
    ];
    
    const errors = [];
    
    for (const path of requiredPaths) {
        const value = getValueByPath(config, path);
        if (value === undefined || value === null || value === '') {
            errors.push(`Missing required config: ${path}`);
        }
    }
    
    if (errors.length > 0) {
        console.error('[Config] Validation failed:');
        errors.forEach(err => console.error(`  - ${err}`));
        throw new Error('Configuration validation failed');
    }
}

/**
 * Get value from object by dot-separated path
 * @param {Object} obj - Object to query
 * @param {String} path - Dot-separated path
 * @returns {*} Value at path or undefined
 */
function getValueByPath(obj, path) {
    return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
}

// Load and export configuration
const config = loadConfig();

// Freeze the config to prevent modifications
module.exports = Object.freeze(config);
