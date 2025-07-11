import defineEnv from "../src/defineEnv";

// Corrected example showing how environment variables actually work
const schema = {
    // String type - environment variable: TEST_STRING="Hello from env"
    TEST_STRING: {
        type: 'string' as const,
        default: 'Hello, World!' // Default used if TEST_STRING is not set
    },

    // Number type - environment variable: TEST_NUMBER="8080" (always a string!)
    TEST_NUMBER: {
        type: 'number' as const,
        default: 42 // Default used if TEST_NUMBER is not set, then parsed to number
    },

    // Boolean type - environment variable: TEST_BOOLEAN="true" or "false"
    TEST_BOOLEAN: {
        type: 'boolean' as const,
        default: true // Default used if TEST_BOOLEAN is not set
    },

    // JSON type - environment variable: TEST_JSON='{"key":"value","count":123}'
    TEST_JSON: {
        type: 'json' as const,
        default: { message: 'This is a test' } // Default used if TEST_JSON is not set
    }
};

// Simulate some environment variables (these would normally be set in your shell)
process.env.TEST_STRING = 'Hello from environment!';
process.env.TEST_NUMBER = '8080'; // Note: this is a STRING
process.env.TEST_BOOLEAN = 'false'; // Note: this is a STRING
process.env.TEST_JSON = '{"message":"From environment","count":42}'; // Note: stringified JSON

console.log('Raw environment variables (all strings):');
console.log('TEST_STRING:', process.env.TEST_STRING, typeof process.env.TEST_STRING);
console.log('TEST_NUMBER:', process.env.TEST_NUMBER, typeof process.env.TEST_NUMBER);
console.log('TEST_BOOLEAN:', process.env.TEST_BOOLEAN, typeof process.env.TEST_BOOLEAN);
console.log('TEST_JSON:', process.env.TEST_JSON, typeof process.env.TEST_JSON);

console.log('\n---\n');

// Parse the environment (this converts strings to proper types)
const env = defineEnv(schema);

console.log('Parsed environment variables (converted to proper types):');
console.log('TEST_STRING:', env.TEST_STRING, typeof env.TEST_STRING);
console.log('TEST_NUMBER:', env.TEST_NUMBER, typeof env.TEST_NUMBER);
console.log('TEST_BOOLEAN:', env.TEST_BOOLEAN, typeof env.TEST_BOOLEAN);
console.log('TEST_JSON:', env.TEST_JSON, typeof env.TEST_JSON);

// Clear the environment variables to test defaults
delete process.env.TEST_STRING;
delete process.env.TEST_NUMBER;
delete process.env.TEST_BOOLEAN;
delete process.env.TEST_JSON;

console.log('\n--- Using defaults (no env vars set) ---\n');

const envWithDefaults = defineEnv(schema);

console.log('Using default values:');
console.log('TEST_STRING:', envWithDefaults.TEST_STRING, typeof envWithDefaults.TEST_STRING);
console.log('TEST_NUMBER:', envWithDefaults.TEST_NUMBER, typeof envWithDefaults.TEST_NUMBER);
console.log('TEST_BOOLEAN:', envWithDefaults.TEST_BOOLEAN, typeof envWithDefaults.TEST_BOOLEAN);
console.log('TEST_JSON:', envWithDefaults.TEST_JSON, typeof envWithDefaults.TEST_JSON);

export default env;
