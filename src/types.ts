
/**
 * New type definitions for defineEnv function
 */
export type EnvType = 'string' | 'number' | 'boolean' | 'enum';
export type ErrorType = "missing" | "invalid" | "validation" | "unknown";

type BaseEnvSchema = {
  /**
   * The default value to use if the environment variable is not set.
  */
  defaultValue?: string | number | boolean;
  /**
   * Custom validation function for the environment variable.
   * Returns true if valid, false or a string error message if invalid.
   */
  validate?: (value: any) => boolean | string;
};

type EnvEnumSchema = BaseEnvSchema & {
  /** The type of the environment variable, which is 'enum' for this schema. */
  type: 'enum';
  /** The valid values for the enum type. */
  validValues: (string | number)[];
};

type EnvNonEnumSchema = BaseEnvSchema & {
  /** The type of the environment variable, which is not 'enum' for this schema. */
  type: Exclude<EnvType, 'enum'>;
};

export type EnvSchemaValueType = EnvEnumSchema | EnvNonEnumSchema;

export type EnvSchemaType = Record<string, EnvSchemaValueType>;
export type EnvConfigType = {
  /** Enable debug mode to log parsed environment variables (default: false) */
  debugMode?: boolean;
  /** Whether to throw an error on validation failure (default: true) */
  throw?: boolean;
  /** 
   * Optionally load .env file before parsing environment variables.
   * If true, calls dotenv.config() before processing.
   * Recommended to be false if dotenv is already loaded in your entry point.
   * (default: false)
   */
  loadEnv?: boolean;
};


/**
 * Helper type to infer the return type from the schema.
 * Maps each schema entry to its corresponding runtime type based on the 'type' field.
 * 
 * For enum types, resolves to the union of valid values.
 * For primitive types, resolves to string | number | boolean accordingly.
 */
export type InferEnvType<T extends EnvSchemaType> = {
  [K in keyof T]: T[K] extends { type: 'enum'; validValues: readonly (infer V)[] }
  ? V
  : T[K] extends { type: 'string' }
  ? string
  : T[K] extends { type: 'number' }
  ? number
  : T[K] extends { type: 'boolean' }
  ? boolean
  : T[K] extends { type: 'enum'; validValues: readonly (infer U)[] }
  ? U
  : T[K] extends { type: 'enum'; validValues: (infer U)[] }
  ? U
  : any;
};



