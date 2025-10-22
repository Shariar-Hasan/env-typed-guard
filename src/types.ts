
/**
 * New type definitions for defineEnv function
 */
export type EnvType = 'string' | 'number' | 'boolean' | 'enum';
export type ErrorType = "missing" | "invalid" | "validation" | "unknown";

type BaseEnvSchema = {
  defaultValue?: string | number | boolean;
  validate?: (value: any) => boolean | string;
};

type EnvEnumSchema = BaseEnvSchema & {
  type: 'enum';
  validValues: (string | number)[];
};

type EnvNonEnumSchema = BaseEnvSchema & {
  type: Exclude<EnvType, 'enum'>;
};

export type EnvSchemaValueType = EnvEnumSchema | EnvNonEnumSchema;

export type EnvSchemaType = Record<string, EnvSchemaValueType>;
export type EnvConfigType = {
  debugMode?: boolean;
  throw?: boolean;
};


/**
 * Helper type to infer the return type from the schema
 */
export type InferEnvType<T extends EnvSchemaType> = {
  [K in keyof T]: T[K] extends { type: 'string' }
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



