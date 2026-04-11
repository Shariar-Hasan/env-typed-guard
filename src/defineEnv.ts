import logger from "./classes/logger";
import { EnvConfigType, EnvSchemaType, EnvSchemaValueType, InferEnvType } from "./types";
import * as dotenv from "dotenv";

/**
 * NOTE: This module does NOT automatically load .env files.
 * Users should call dotenv.config() in their entry point if needed:
 * 
 * @example
 * ```ts
 * import * as dotenv from 'dotenv';
 * dotenv.config();
 * 
 * import { defineEnv } from 'env-typed-guard';
 * const env = defineEnv({ ... });
 * ```
 */
// Environment variables should already be loaded by the consumer
// or passed in via system environment. We do not load them here to
// avoid unexpected side effects and maintain modularity.

const errorPrefix = "[env-typed-guard] ";

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
    {
        value,
        key,
        schemaValue,
        config
    }: { value: string; key: string; schemaValue: EnvSchemaValueType; config: EnvConfigType }
): any {
    const fail = (msg: string) => {
        throw new Error(msg);
    };

    switch (schemaValue.type) {
        case "string":
            return value;

        case "number":
            const num = Number(value);
            if (isNaN(num)) {
                return fail(`${errorPrefix} Cannot parse "${value}" as number for "${key}".`);
            }
            return num;

        case "boolean":
            const lowerValue = value.toLowerCase();
            if (["true", "1"].includes(lowerValue)) return true;
            if (["false", "0"].includes(lowerValue)) return false;

            return fail(`${errorPrefix} Cannot parse "${value}" as boolean for "${key}". Expected: true, false, 1, or 0`);

        default:
            return fail(`${errorPrefix} Unknown type "${schemaValue.type}" for "${key}".`);
    }
}

/**
 * Defines and validates environment variables based on a provided schema.
 * 
 * This function ensures that environment variables conform to expected types,
 * have required values, pass custom validators, and respect default values.
 * 
 * @template T - The schema definition type
 * 
 * @param schema - The schema defining expected environment variables and their types
 * @param config - Optional configuration object for behavior customization:
 *   - debugMode: Enable debug logging (default: false)
 *   - throw: Throw errors on validation failure (default: true)
 *   - loadEnv: Call dotenv.config() before parsing (default: false)
 * 
 * @returns The validated environment object, typed according to the schema
 * 
 * @throws Error if validation fails and config.throw is true
 * 
 * @example
 * ```ts
 * const env = defineEnv({
 *   NODE_ENV: { type: 'enum', validValues: ['dev', 'prod'], defaultValue: 'dev' },
 *   PORT: { type: 'number', defaultValue: 3000 },
 *   DEBUG: { type: 'boolean', defaultValue: false },
 *   API_KEY: { type: 'string' } // Required, no default
 * }, { debugMode: true });
 * ```
 */
export function defineEnv<T extends EnvSchemaType>(
    schema: T,
    config: EnvConfigType = {}
): InferEnvType<T> {
    // Optionally load .env file if requested (default: false to avoid side effects)
    if (config.loadEnv) {
        dotenv.config({
            quiet: true,
            debug: false,
        });
    }

    const final: Record<string, any> = {};
    const errors: string[] = [];
    const logEntries: string[] = [];

    for (const [key, schemaValue] of Object.entries(schema)) {
        const sourceKey = schemaValue.key ?? key;
        const keyDisplay = sourceKey === key ? `"${key}"` : `"${sourceKey}" (mapped to "${key}")`;
        const rawValue = process.env[sourceKey];

        // Handle missing environment variable
        if (rawValue === undefined || rawValue.length === 0) {
            if ("defaultValue" in schemaValue && schemaValue.defaultValue !== undefined) {
                final[key] = schemaValue.defaultValue;
                logEntries.push(`${key}=${schemaValue.defaultValue} (using default)`);
                continue;
            } else {
                const msg = `${errorPrefix} Environment variable ${keyDisplay} is required but not set`;
                if (config.throw !== false) throw new Error(msg);
                errors.push(msg);
                final[key] = undefined;
                continue;
            }
        }

        // Handle enum types
        if (schemaValue.type === "enum") {
            if (!("validValues" in schemaValue)) {
                const msg = `${errorPrefix} Enum ${keyDisplay} missing validValues`;
                if (config.throw !== false) throw new Error(msg);
                errors.push(msg);
                continue;
            }
            if (!schemaValue.validValues.includes(rawValue)) {
                const msg = `${errorPrefix} Environment variable ${keyDisplay} must be one of: ${schemaValue.validValues.join(", ")}`;
                if (config.throw !== false) throw new Error(msg);
                errors.push(msg);
                final[key] = undefined;
                continue;
            }
            final[key] = rawValue;
        } else {
            // Handle string, number, or boolean
            try {
                const parsed = parseValue({ value: rawValue, key: sourceKey, schemaValue, config });
                final[key] = parsed;
            } catch (err) {
                const message = err instanceof Error ? err.message : `Unknown error parsing "${sourceKey}"`;
                errors.push(message);
                if (config.throw !== false) throw err;
            }
        }

        // Custom validator check
        if (schemaValue.validate) {
            const validationResult = schemaValue.validate(final[key]);
            if (validationResult === false) {
                const msg = `${errorPrefix} Environment variable "${key}" failed validation`;
                if (config.throw !== false) throw new Error(msg);
                errors.push(msg);
                final[key] = undefined;
                continue;
            }
            if (typeof validationResult === "string") {
                const msg = `${errorPrefix} Environment variable "${key}" validation error: ${validationResult}`;
                if (config.throw !== false) throw new Error(msg);
                errors.push(msg);
                final[key] = undefined;
                continue;
            }
        }
        if (sourceKey === key) {
            logEntries.push(`${key}=${final[key]}`);
        } else {
            logEntries.push(`${key}=${final[key]} (from ${sourceKey})`);
        }
    }

    // Optional debug logging
    if (config.debugMode) {
        logger.title().log();
        if (logEntries.length) {
            logger.blue("Environment variables:").log();
            logEntries.map(entry => logger.cyan(entry).log())
        }
        logger.newLine(1).log();
    }

    // If there are accumulated errors
    if (errors.length > 0) {
        const msg = `Environment validation failed:\n${errors
            .map(e => `  • ${e}`)
            .join("\n")}`;

        if (config.throw !== false) throw new Error(msg);
        else logger.red(msg).log();
    } else if (config.debugMode) {
        logger.green("✅ Environment validated successfully").log();
    }

    return final as InferEnvType<T>;
}
