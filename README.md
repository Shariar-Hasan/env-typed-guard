# typed-env

A TypeScript-first library for type-safe environment variable parsing and validation.

## Features

- 🔒 **Type-safe**: Full TypeScript support with proper type inference
- 📋 **Schema-based**: Define your environment variables with a clear schema
- ✅ **Validation**: Built-in validators for common use cases
- 🔧 **Extensible**: Easy to extend with custom validators
- 🎯 **Zero dependencies**: Lightweight and focused
- 📝 **Great DX**: Helpful error messages and IntelliSense support

## Installation

```bash
npm install typed-env
```

## Quick Start

```typescript
import { parseEnv, validators } from 'typed-env';

// Define your environment schema
const schema = {
  DATABASE_URL: {
    type: 'string' as const,
    required: true,
    validate: validators.url
  },
  
  PORT: {
    type: 'number' as const,
    default: 3000,
    validate: validators.range(1, 65535)
  },
  
  NODE_ENV: {
    type: 'string' as const,
    default: 'development',
    validate: validators.oneOf(['development', 'production', 'test'])
  },
  
  ENABLE_LOGGING: {
    type: 'boolean' as const,
    default: true
  }
};

// Parse and validate
const env = parseEnv(schema);

// Use with full type safety
console.log(`Server running on port ${env.PORT}`);
console.log(`Database: ${env.DATABASE_URL}`);
console.log(`Logging enabled: ${env.ENABLE_LOGGING}`);
```

## API Reference

### Types

#### `EnvVariableConfig`

```typescript
interface EnvVariableConfig {
  type: 'string' | 'number' | 'boolean' | 'json';
  required?: boolean;
  default?: any;
  description?: string;
  validate?: (value: any) => boolean | string;
}
```

#### `EnvSchema`

```typescript
interface EnvSchema {
  [key: string]: EnvVariableConfig;
}
```

### Core Functions

#### `parseEnv(schema, env?)`

Parse environment variables according to a schema.

```typescript
const env = parseEnv({
  API_KEY: { type: 'string', required: true },
  PORT: { type: 'number', default: 3000 }
});
```

#### `createEnv(schema, env?)`

Create a `TypedEnv` instance for more advanced usage.

```typescript
const typedEnv = createEnv(schema);
const env = typedEnv.parse();
```

### TypedEnv Class

#### Methods

- `parse()`: Parse and validate all environment variables
- `get<T>(key)`: Get a single environment variable with type safety
- `has(key)`: Check if an environment variable exists
- `extend(schema)`: Create a new instance with extended schema
- `raw()`: Get raw environment variables

### Built-in Validators

#### `validators.nonEmpty`
Validates that a string is not empty.

```typescript
{
  type: 'string',
  validate: validators.nonEmpty
}
```

#### `validators.range(min, max)`
Validates that a number is within a specified range.

```typescript
{
  type: 'number',
  validate: validators.range(1, 100)
}
```

#### `validators.positive`
Validates that a number is positive.

```typescript
{
  type: 'number',
  validate: validators.positive
}
```

#### `validators.pattern(regex)`
Validates that a string matches a regular expression.

```typescript
{
  type: 'string',
  validate: validators.pattern(/^[A-Z]+$/)
}
```

#### `validators.oneOf(options)`
Validates that a value is one of the specified options.

```typescript
{
  type: 'string',
  validate: validators.oneOf(['dev', 'prod', 'test'])
}
```

#### `validators.url`
Validates URL format.

```typescript
{
  type: 'string',
  validate: validators.url
}
```

#### `validators.email`
Validates email format.

```typescript
{
  type: 'string',
  validate: validators.email
}
```

## Advanced Usage

### Custom Validators

```typescript
const schema = {
  PASSWORD: {
    type: 'string' as const,
    validate: (value: string) => {
      if (value.length < 8) {
        return 'Password must be at least 8 characters';
      }
      if (!/[A-Z]/.test(value)) {
        return 'Password must contain uppercase letter';
      }
      return true;
    }
  }
};
```

### Environment-specific Configuration

```typescript
const createSchema = (isDevelopment: boolean) => ({
  DATABASE_URL: {
    type: 'string' as const,
    required: !isDevelopment,
    default: isDevelopment ? 'sqlite://dev.db' : undefined
  },
  
  LOG_LEVEL: {
    type: 'string' as const,
    default: isDevelopment ? 'debug' : 'info',
    validate: validators.oneOf(['debug', 'info', 'warn', 'error'])
  }
});

const isDev = process.env.NODE_ENV === 'development';
const env = parseEnv(createSchema(isDev));
```

### Schema Extension

```typescript
const baseSchema = {
  PORT: { type: 'number' as const, default: 3000 }
};

const extendedSchema = {
  REDIS_URL: { type: 'string' as const, required: true }
};

const typedEnv = createEnv(baseSchema).extend(extendedSchema);
const env = typedEnv.parse();
```

### JSON Configuration

```typescript
const schema = {
  DATABASE_CONFIG: {
    type: 'json' as const,
    default: { host: 'localhost', port: 5432 }
  }
};

const env = parseEnv(schema);
// env.DATABASE_CONFIG is properly typed as the parsed JSON object
```

## Error Handling

The library provides detailed error messages for validation failures:

```typescript
try {
  const env = parseEnv(schema);
} catch (error) {
  if (error instanceof EnvParseError) {
    console.error('Environment validation failed:', error.message);
    // Handle specific validation errors
  }
}
```

## Best Practices

1. **Define schemas at the module level** for reusability
2. **Use TypeScript const assertions** for better type inference
3. **Provide meaningful descriptions** for documentation
4. **Use appropriate defaults** for optional variables
5. **Group related variables** in logical schemas
6. **Validate early** in your application startup

## Examples

See the `examples/` directory for more comprehensive examples:

- Basic usage with common patterns
- Advanced validation scenarios
- Environment-specific configurations
- Custom validator implementations

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

MIT License - see LICENSE file for details.

