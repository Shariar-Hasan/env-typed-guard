
import defineEnv from '../defineEnv';
import { EnvSchemaType } from '../types';

describe('defineEnv', () => {
    // Store original console.log and process.env
    const originalConsoleLog = console.log;
    const originalEnv = process.env;
    let logOutput: string[] = [];

    beforeEach(() => {
        logOutput = [];
        // Mock console functions
        console.log = jest.fn((message: string) => {
            logOutput.push(message);
        });
        console.warn = jest.fn((message: string) => {
            logOutput.push(message);
        });
        console.error = jest.fn((message: string) => {
            logOutput.push(message);
        });
        console.info = jest.fn((message: string) => {
            logOutput.push(message);
        });
        console.debug = jest.fn((message: string) => {
            logOutput.push(message);
        });
        // Reset process.env
        process.env = {};
    });

    afterEach(() => {
        console.log = originalConsoleLog;
        console.warn = originalConsoleLog;
        console.error = originalConsoleLog;
        console.info = originalConsoleLog;
        console.debug = originalConsoleLog;
        process.env = originalEnv;
    });

    describe('basic type parsing', () => {
        it('should parse string types', () => {
            process.env.TEST_STRING = 'hello';

            const schema: EnvSchemaType = {
                TEST_STRING: {
                    type: 'string',
                    defaultValue: ''
                }
            };

            const env = defineEnv(schema, { debugMode: true });
            expect(env.TEST_STRING).toBe('hello');
        });

        it('should parse number types', () => {
            process.env.TEST_NUMBER = '42';

            const schema: EnvSchemaType = {
                TEST_NUMBER: {
                    type: 'number',
                    defaultValue: 0
                }
            };

            const env = defineEnv(schema, { debugMode: true });
            expect(env.TEST_NUMBER).toBe(42);
        });

        it('should parse boolean types', () => {
            process.env.TEST_BOOL_TRUE = 'true';
            process.env.TEST_BOOL_FALSE = 'false';
            process.env.TEST_BOOL_ONE = '1';
            process.env.TEST_BOOL_ZERO = '0';

            const schema: EnvSchemaType = {
                TEST_BOOL_TRUE: {
                    type: 'boolean',
                    defaultValue: false
                },
                TEST_BOOL_FALSE: {
                    type: 'boolean',
                    defaultValue: true
                },
                TEST_BOOL_ONE: {
                    type: 'boolean',
                    defaultValue: false
                },
                TEST_BOOL_ZERO: {
                    type: 'boolean',
                    defaultValue: true
                }
            };

            const env = defineEnv(schema, { debugMode: true });
            expect(env.TEST_BOOL_TRUE).toBe(true);
            expect(env.TEST_BOOL_FALSE).toBe(false);
            expect(env.TEST_BOOL_ONE).toBe(true);
            expect(env.TEST_BOOL_ZERO).toBe(false);
        });
    });

    describe('enum handling', () => {
        it('should handle enum values', () => {
            process.env.NODE_ENV = 'development';

            const schema: EnvSchemaType = {
                NODE_ENV: {
                    type: 'enum',
                    defaultValue: 'development',
                    validValues: ['development', 'production', 'test']
                }
            };

            const env = defineEnv(schema, { debugMode: true });
            expect(env.NODE_ENV).toBe('development');
        });

        it('should throw error for invalid enum values', () => {
            process.env.NODE_ENV = 'invalid';

            const schema: EnvSchemaType = {
                NODE_ENV: {
                    type: 'enum',
                    defaultValue: 'development',
                    validValues: ['development', 'production', 'test']
                }
            };

            expect(() => {
                defineEnv(schema, { throw: true });
            }).toThrow('must be one of: development, production, test');
        });
    });

    describe('default values', () => {
        it('should use default values when env var is not set', () => {
            const schema: EnvSchemaType = {
                PORT: {
                    type: 'number',
                    defaultValue: 3000
                }
            };

            const env = defineEnv(schema, { debugMode: true });
            expect(env.PORT).toBe(3000);
            // Just check that some log output exists containing the default value
            expect(logOutput.some(log => log.includes('3000'))).toBe(true);
        });

        it('should use env value over default', () => {
            process.env.PORT = '8080';

            const schema: EnvSchemaType = {
                PORT: {
                    type: 'number',
                    defaultValue: 3000
                }
            };

            const env = defineEnv(schema, { debugMode: true });
            expect(env.PORT).toBe(8080);
        });
    });


    describe('required fields', () => {
        it('should throw error for missing required field', () => {
            const schema: EnvSchemaType = {
                REQUIRED_VAR: {
                    type: 'string'
                    // No defaultValue provided - this makes it required
                }
            };

            expect(() => {
                defineEnv(schema, { throw: true });
            }).toThrow('Environment variable "REQUIRED_VAR" is required but not set');
        });

        it('should not throw error for optional field', () => {
            const schema: EnvSchemaType = {
                OPTIONAL_VAR: {
                    type: 'string',
                    defaultValue: 'default'
                }
            };

            const env = defineEnv(schema, { debugMode: true });
            expect(env.OPTIONAL_VAR).toBe('default');
        });
    });

    describe('validation', () => {
        it('should validate values with custom validator', () => {
            process.env.PASSWORD = 'short';

            const schema: EnvSchemaType = {
                PASSWORD: {
                    type: 'string',
                    defaultValue: '',
                    validate: (value: string) => {
                        if (value.length < 8) {
                            return 'Password must be at least 8 characters';
                        }
                        return true;
                    }
                }
            };

            expect(() => {
                defineEnv(schema, { throw: true });
            }).toThrow('Password must be at least 8 characters');
        });

        it('should pass validation with valid value', () => {
            process.env.PASSWORD = 'longenoughpassword';

            const schema: EnvSchemaType = {
                PASSWORD: {
                    type: 'string',
                    defaultValue: '',
                    validate: (value: string) => {
                        if (value.length < 8) {
                            return 'Password must be at least 8 characters';
                        }
                        return true;
                    }
                }
            };

            const env = defineEnv(schema, { debugMode: true });
            expect(env.PASSWORD).toBe('longenoughpassword');
        });
    });

    describe('configuration options', () => {
        it('should respect throw: false option', () => {
            const schema: EnvSchemaType = {
                REQUIRED_VAR: {
                    type: 'string',
                    defaultValue: ''
                }
            };

            expect(() => {
                defineEnv(schema, { throw: false });
            }).not.toThrow();
        }); it('should respect debugMode option', () => {
            process.env.TEST_VAR = 'test';

            const schema: EnvSchemaType = {
                TEST_VAR: {
                    type: 'string',
                    defaultValue: ''
                }
            };

            defineEnv(schema, { debugMode: false });
            expect(logOutput.length).toBe(0);

            logOutput = [];
            defineEnv(schema, { debugMode: true });
            expect(logOutput.length).toBeGreaterThan(0);
        });
    });

    describe('type inference', () => {
        it('should provide proper type inference for schema properties', () => {
            const schema = {
                STRING_VAR: {
                    type: 'string' as const,
                    defaultValue: 'test'
                },
                NUMBER_VAR: {
                    type: 'number' as const,
                    defaultValue: 42
                },
                BOOL_VAR: {
                    type: 'boolean' as const,
                    defaultValue: true
                },
                ENUM_VAR: {
                    type: 'enum' as const,
                    defaultValue: 'dev' as const,
                    validValues: ['dev', 'prod'] as const
                }
            } as const;

            const env = defineEnv(schema);

            // These should all be properly typed
            expect(typeof env.BOOL_VAR).toBe('boolean');
            expect(typeof env.NUMBER_VAR).toBe('number');
            expect(typeof env.ENUM_VAR).toBe('string');
            expect(['dev', 'prod']).toContain(env.ENUM_VAR);
        });
    });

    // ...existing code...
    it('should handle invalid number parsing', () => {
        process.env.PORT = 'not-a-number';

        const schema: EnvSchemaType = {
            PORT: {
                type: 'number',
                defaultValue: 0
            }
        };

        expect(() => {
            defineEnv(schema, { throw: true });
        }).toThrow('Cannot parse "not-a-number" as number');
    });

    it('should handle invalid boolean parsing', () => {
        process.env.ENABLED = 'maybe';

        const schema: EnvSchemaType = {
            ENABLED: {
                type: 'boolean',
                defaultValue: false
            }
        };

        expect(() => {
            defineEnv(schema, { throw: true });
        }).toThrow('Cannot parse "maybe" as boolean');
    });
});

describe('type inference', () => {
    it('should provide proper type inference for schema properties', () => {
        const schema = {
            STRING_VAR: {
                type: 'string' as const,
                defaultValue: 'test'
            },
            NUMBER_VAR: {
                type: 'number' as const,
                defaultValue: 42
            },
            BOOL_VAR: {
                type: 'boolean' as const,
                defaultValue: true
            },
            ENUM_VAR: {
                type: 'enum' as const,
                defaultValue: 'dev' as const,
                validValues: ['dev', 'prod'] as const
            }
        } as const;

        const env = defineEnv(schema);

        // These should all be properly typed
        expect(typeof env.STRING_VAR).toBe('string');
        expect(typeof env.NUMBER_VAR).toBe('number');
        expect(typeof env.BOOL_VAR).toBe('boolean');
        expect(['dev', 'prod']).toContain(env.ENUM_VAR);
    });
});
