import { EnvConfigType, EnvSchemaType, InferEnvType } from "./types";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();
/**
 * Node.js `process.env` type declaration (for TS compatibility)
 */
declare const process: {
    env: Record<string, string | undefined>;
};


/**
 * Parses a raw environment variable value into the specified type.
 * 
 * @param value - The raw string value from the environment
 * @param type - The target type to parse into (`string`, `number`, `boolean`, or custom)
 * @param variableName - The name of the environment variable (used in error messages)
 * @param config - The environment configuration for error/log handling
 * @returns The parsed and validated value
 * 
 * @throws Will throw an error if parsing fails and `config.throw` is not explicitly set to `false`.
 */
function parseValue(
    value: string,
    type: string,
    variableName: string,
    config: EnvConfigType
): any {
    switch (type) {
        case "string":
            return value;

        case "number":
            const num = Number(value);
            if (isNaN(num)) {
                const msg = `Cannot parse "${value}" as number for ${variableName}`;
                console.error(msg);
                if (config.throw !== false) throw new Error(msg);
                return undefined;
            }
            return num;

        case "boolean":
            const lowerValue = value.toLowerCase();
            if (["true", "1"].includes(lowerValue)) return true;
            if (["false", "0"].includes(lowerValue)) return false;

            const msg = `Cannot parse "${value}" as boolean for ${variableName}. Expected: true, false, 1, or 0`;
            console.error(msg);
            if (config.throw !== false) throw new Error(msg);
            return undefined;

        default:
            return value;
    }
}

/**
 * Loads, validates, and parses environment variables based on a schema.
 * 
 * This function ensures that environment variables:
 * - Match their expected types (`string`, `number`, `boolean`, or `enum`)
 * - Respect default values if not provided
 * - Pass optional custom validators
 * - Optionally throw errors or only warn depending on configuration
 * 
 * @template T - The schema definition type
 * 
 * @param schema - The schema defining the expected environment variables
 * @param config - Optional configuration for logging and error handling
 * 
 * @returns The parsed environment object, typed based on the provided schema
 * 
 * @throws Error if validation or parsing fails and `config.throw` is not set to `false`
 * 
 * @example
 * ```ts
 * const env = defineEnv({
 *   NODE_ENV: { type: "enum", validValues: ["development", "production"], defaultValue: "development" },
 *   PORT: { type: "number", defaultValue: 3000 },
 *   DEBUG: { type: "boolean", defaultValue: false }
 * }, { debugMode: true });
 * 
 * console.log(env.PORT); // 3000
 * console.log(env.NODE_ENV); // "development"
 * ```
 */
export default function defineEnv<T extends EnvSchemaType>(
    schema: T,
    config: EnvConfigType = {}
): InferEnvType<T> {
    const final: Record<string, any> = {};
    const errors: string[] = [];
    const logEntries: string[] = [];

    for (const [key, schemaValue] of Object.entries(schema)) {
        const rawValue = process.env[key];

        try {
            // Handle missing environment variable
            if (rawValue === undefined) {
                if ("defaultValue" in schemaValue && schemaValue.defaultValue !== undefined) {
                    final[key] = schemaValue.defaultValue;
                    logEntries.push(`${key}=${schemaValue.defaultValue} (using default)`);
                    continue;
                } else {
                    const msg = `Environment variable "${key}" is required but not set`;
                    if (config.throw !== false) throw new Error(msg);
                    errors.push(msg);
                    continue;
                }
            }

            // Handle enum types
            if (schemaValue.type === "enum") {
                if (!("validValues" in schemaValue)) {
                    throw new Error(`Enum "${key}" missing validValues`);
                }
                if (!schemaValue.validValues.includes(rawValue)) {
                    const msg = `Environment variable "${key}" must be one of: ${schemaValue.validValues.join(", ")}`;
                    if (config.throw !== false) throw new Error(msg);
                    errors.push(msg);
                    continue;
                }
                final[key] = rawValue;
            } else {
                // Handle string, number, or boolean
                const parsed = parseValue(rawValue, schemaValue.type as string, key, config);
                final[key] = parsed;
            }

            // Custom validator check
            if (schemaValue.validate) {
                const validationResult = schemaValue.validate(final[key]);
                if (validationResult === false) {
                    const msg = `Environment variable "${key}" failed validation`;
                    if (config.throw !== false) throw new Error(msg);
                    errors.push(msg);
                    continue;
                }
                if (typeof validationResult === "string") {
                    const msg = `Environment variable "${key}" validation error: ${validationResult}`;
                    if (config.throw !== false) throw new Error(msg);
                    errors.push(msg);
                    continue;
                }
            }

            logEntries.push(`${key}=${final[key]}`);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : `Unknown error parsing "${key}"`;
            errors.push(message);
            if (config.throw !== false) console.error(message);
        }
    }

    // If there are accumulated errors
    if (errors.length > 0) {
        const msg = `Environment validation failed:\n${errors.join("\n")}`;
        console.error(msg);
        if (config.throw !== false) throw new Error(msg);
    }

    // Optional debug logging
    if (config.debugMode) {
        console.log("Environment variables:", config);
        logEntries.forEach(entry => console.log(`  ${entry}`));
    }

    return final as InferEnvType<T>;
}
