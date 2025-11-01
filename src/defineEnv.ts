import logger from "./classes/logger";
import { EnvConfigType, EnvSchemaType, EnvSchemaValueType, InferEnvType } from "./types";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config({
    quiet: true,
    debug: false,
});

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
            if (rawValue === undefined || rawValue.length === 0) {
                if ("defaultValue" in schemaValue && schemaValue.defaultValue !== undefined) {
                    final[key] = schemaValue.defaultValue;
                    logEntries.push(`${key}=${schemaValue.defaultValue} (using default)`);
                    continue;
                } else {
                    const msg = `${errorPrefix} Environment variable "${key}" is required but not set`;
                    if (config.throw !== false) throw new Error(msg);
                    errors.push(msg);
                    final[key] = undefined;
                    continue;
                }
            }

            // Handle enum types
            if (schemaValue.type === "enum") {
                if (!("validValues" in schemaValue)) {
                    throw new Error(`Enum "${key}" missing validValues`);
                }
                if (!schemaValue.validValues.includes(rawValue)) {
                    const msg = `${errorPrefix} Environment variable "${key}" must be one of: ${schemaValue.validValues.join(", ")}`;
                    if (config.throw !== false) throw new Error(msg);
                    errors.push(msg);
                    final[key] = undefined;
                    continue;
                }
                final[key] = rawValue;
            } else {
                // Handle string, number, or boolean
                const parsed = parseValue({ value: rawValue, key, schemaValue, config });
                final[key] = parsed;
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
            logEntries.push(`${key}=${final[key]}`);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : `Unknown error parsing "${key}"`;
            errors.push(message);
            if (config.throw !== false) throw err; // rethrow in strict mode
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
