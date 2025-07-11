
/**
 * New type definitions for defineEnv function
 */
export type EnvType = 'string' | 'number' | 'boolean' | 'enum';
export type EnvSchemaValueType = {
  type: Omit<EnvType, 'enum'>;
  defaultValue?: string | number | boolean;
  validate?: (value: any) => boolean | string;
} | {
  type: 'enum';
  defaultValue?: string | number;
  validValues: (string | number)[];
  validate?: (value: any) => boolean | string;
}

export type EnvSchemaType = Record<string, EnvSchemaValueType>;
export type EnvConfigType = {
  debugMode?: boolean;
  log?: 'error' | 'warn' | 'info' | 'debug';
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



