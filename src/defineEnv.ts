import { EnvConfigType, EnvSchemaType, InferEnvType } from "./types";

// Node.js process global
declare const process: {
    env: Record<string, string | undefined>;
};

/**
 * Parse a string value to the specified type
 * @param value - The string value to parse
 * @param type - The type to parse the value to (string, number, boolean,
 * enum)
 * @param variableName - The name of the environment variable for error messages
 * @return The parsed value, or throws an error if parsing fails
 * @throws Error if the value cannot be parsed to the specified type
 */
function parseValue(value: string, type: string, variableName: string, config: EnvConfigType): any {
    switch (type) {
        case 'string':
            return value;

        case 'number':
            const num = Number(value);
            if (isNaN(num)) {
                log(`Cannot parse "${value}" as number for ${variableName}. Expected a valid number`, config);
                if (config.throw !== false) {
                    throw new Error(`Cannot parse "${value}" as number for ${variableName}. Expected a valid number`);
                }

            }
            return num;

        case 'boolean':
            const lowerValue = value.toLowerCase();
            if (lowerValue === 'true' || lowerValue === '1') {
                return true;
            }
            if (lowerValue === 'false' || lowerValue === '0') {
                return false;
            }
            throw new Error(`Cannot parse "${value}" as boolean for ${variableName}. Expected: true, false, 1, or 0`);

        default:
            return value;
    }
}

/**
 * Log function that respects the config settings
 */
const log = (message: string, config: EnvConfigType) => console[config.log || 'warn'](message);
/**
 * Define environment variables based on the provided schema and configuration.
 * This function reads environment variables, validates them against the schema,
 * and returns an object with the parsed values.
 *
 * @param schema - The schema defining the expected environment variables
 * @param config - Configuration options for logging and error handling
 * @returns An object with the parsed environment variables
 * @throws Error if validation fails and `config.throw` is true
 */
export default function defineEnv<T extends EnvSchemaType>(
    schema: T,
    config: EnvConfigType = {}
): InferEnvType<T> {
    const final: Record<string, any> = {};
    const errors: string[] = [];
    const logEntries: string[] = [];

    for (const [key, schemaValue] of Object.entries(schema)) {
        try {
            const rawValue = process.env[key];            // Handle enum type
            if (schemaValue.type === 'enum') {
                // Check if this is the enum type using type guard
                if ('validValues' in schemaValue) {
                    if (rawValue === undefined) {
                        // Check if default value is provided
                        if (schemaValue.defaultValue !== undefined) {
                            // Use default value for enum
                            final[key] = schemaValue.defaultValue;
                            logEntries.push(`${key}=${schemaValue.defaultValue} (using default)`);
                            continue;
                        } else {
                            // No default value and no env var - this is required
                            errors.push(`Environment variable "${key}" is required but not set`);
                            continue;
                        }
                    }

                    // Check if value is in valid enum values
                    if (!schemaValue.validValues.includes(rawValue)) {
                        errors.push(`Environment variable "${key}" must be one of: ${schemaValue.validValues.join(', ')}`);
                        continue;
                    }

                    final[key] = rawValue;
                    logEntries.push(`${key}=${rawValue}`);
                    
                    // Validate if validator is provided
                    if (schemaValue.validate) {
                        const validationResult = schemaValue.validate(rawValue);
                        if (validationResult === false) {
                            errors.push(`Environment variable "${key}" failed validation`);
                            continue;
                        }
                        if (typeof validationResult === 'string') {
                            errors.push(`Environment variable "${key}" validation error: ${validationResult}`);
                            continue;
                        }
                    }
                    
                    continue;
                }
            }

            // Handle other types (string, number, boolean)
            // Type guard to ensure we're working with the non-enum type
            if (schemaValue.type !== 'enum') {
                // Handle missing values
                if (rawValue === undefined) {
                    // Check if default value is provided
                    if (schemaValue.defaultValue !== undefined) {
                        // Use default value
                        final[key] = schemaValue.defaultValue;
                        logEntries.push(`${key}=${schemaValue.defaultValue} (using default)`);
                        continue;
                    } else {
                        // No default value and no env var - this is required
                        errors.push(`Environment variable "${key}" is required but not set`);
                        continue;
                    }
                }

                // Parse the value
                const parsedValue = parseValue(rawValue, schemaValue.type as string, key, config);

                // Validate if validator is provided
                if (schemaValue.validate) {
                    const validationResult = schemaValue.validate(parsedValue);
                    if (validationResult === false) {
                        errors.push(`Environment variable "${key}" failed validation`);
                        continue;
                    }
                    if (typeof validationResult === 'string') {
                        errors.push(`Environment variable "${key}" validation error: ${validationResult}`);
                        continue;
                    }
                }

                final[key] = parsedValue;
                logEntries.push(`${key}=${parsedValue}`);
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : `Unknown error parsing "${key}"`;
            errors.push(errorMessage);
        }
    }

    // Handle errors
    if (errors.length > 0) {
        const errorMessage = `Environment validation failed:\n${errors.join('\n')}`;
        log(errorMessage, config);

        if (config.throw !== false) {
            throw new Error(errorMessage);
        }
    }

    // Log environment variables if enabled
    if (config.debugMode || config.log === 'debug') {
        if (logEntries.length > 0) {
            log('Environment variables:', config);
            logEntries.forEach(entry => log(`  ${entry}`, config));
        }
    }

    return final as InferEnvType<T>;
}
