# env-typed-guard

A TypeScript-first library for type-safe environment variable parsing and validation with full IntelliSense support.

## Features

- 🔒 **Type-safe**: Full TypeScript support with automatic type inference
- 📋 **Schema-based**: Define your environment variables with a clear, simple schema
- ✅ **Validation**: Built-in and custom validation functions
- 🎯 **IntelliSense**: Get autocomplete suggestions for your environment variables
- 🔧 **Flexible**: Support for string, number, boolean, and enum types
- 📝 **Error handling**: Comprehensive error messages and configurable behavior
- 🚀 **Zero dependencies**: Lightweight and focused

## Installation

```bash
npm install env-typed-guard
```

## Quick Start

```typescript
import defineEnv from 'env-typed-guard';

// Define your environment schema
const env = defineEnv({
  PORT: {
    type: 'number' as const,
    defaultValue: 3000
  },
  
  NODE_ENV: {
    type: 'enum' as const,
    validValues: ['development', 'production', 'test'] as const,
    defaultValue: 'development' as const
  },
  
  DATABASE_URL: {
    type: 'string' as const
    // No defaultValue = required environment variable
  },
  
  DEBUG: {
    type: 'boolean' as const,
    defaultValue: false
  }
});

// Use with full type safety and IntelliSense
console.log(`Server running on port ${env.PORT}`);
console.log(`Environment: ${env.NODE_ENV}`);
console.log(`Debug mode: ${env.DEBUG}`);
```

## API Reference

### `defineEnv(schema, config?)`

The main function that parses and validates environment variables.

#### Parameters

- `schema`: Object defining your environment variables
- `config`: Optional configuration object

#### Schema Types

Each environment variable in your schema can be defined as:

```typescript
{
  type: 'string' | 'number' | 'boolean' | 'enum';
  defaultValue?: any;           // Optional default value
  validate?: (value) => boolean | string;  // Optional custom validation
}
```

#### Configuration Options

```typescript
{
  debugMode?: boolean;    // Enable debug logging
  log?: 'error' | 'warn' | 'info' | 'debug';  // Log level
  throw?: boolean;        // Whether to throw on validation errors (default: true)
}
```

## Type Support

### String Type
```typescript
const env = defineEnv({
  API_KEY: {
    type: 'string' as const,
    defaultValue: 'dev-key'
  }
});
```

### Number Type
```typescript
const env = defineEnv({
  PORT: {
    type: 'number' as const,
    defaultValue: 3000
  }
});
// Environment variable: PORT=8080 → parsed as number 8080
```

### Boolean Type
```typescript
const env = defineEnv({
  DEBUG: {
    type: 'boolean' as const,
    defaultValue: false
  }
});
// Environment variable: DEBUG=true → parsed as boolean true
// Accepts: 'true', 'false', '1', '0' (case insensitive)
```

### Enum Type
```typescript
const env = defineEnv({
  LOG_LEVEL: {
    type: 'enum' as const,
    validValues: ['debug', 'info', 'warn', 'error'] as const,
    defaultValue: 'info' as const
  }
});
// env.LOG_LEVEL has type: 'debug' | 'info' | 'warn' | 'error'
```

## Advanced Usage

### Custom Validation

```typescript
const env = defineEnv({
  PASSWORD: {
    type: 'string' as const,
    validate: (value: string) => {
      if (value.length < 8) {
        return 'Password must be at least 8 characters';
      }
      if (!/[A-Z]/.test(value)) {
        return 'Password must contain at least one uppercase letter';
      }
      return true;
    }
  },
  
  PORT: {
    type: 'number' as const,
    defaultValue: 3000,
    validate: (value: number) => {
      if (value < 1000 || value > 65535) {
        return 'Port must be between 1000 and 65535';
      }
      return true;
    }
  }
});
```

### Required vs Optional Variables

```typescript
const env = defineEnv({
  // Required (no defaultValue)
  DATABASE_URL: {
    type: 'string' as const
  },
  
  // Optional (has defaultValue)
  CACHE_TTL: {
    type: 'number' as const,
    defaultValue: 300
  }
});
```

### Environment-specific Configuration

```typescript
const env = defineEnv({
  NODE_ENV: {
    type: 'enum' as const,
    validValues: ['development', 'production', 'test'] as const,
    defaultValue: 'development' as const
  },
  
  DATABASE_URL: {
    type: 'string' as const,
    defaultValue: process.env.NODE_ENV === 'development' 
      ? 'sqlite://dev.db' 
      : undefined // Required in production
  }
});
```

### Error Handling

```typescript
try {
  const env = defineEnv({
    REQUIRED_VAR: {
      type: 'string' as const
    }
  });
} catch (error) {
  console.error('Environment validation failed:', error.message);
  process.exit(1);
}

// Or disable throwing
const env = defineEnv({
  REQUIRED_VAR: {
    type: 'string' as const
  }
}, {
  throw: false,
  log: 'warn'
});
```

### Debug Mode

```typescript
const env = defineEnv({
  PORT: {
    type: 'number' as const,
    defaultValue: 3000
  }
}, {
  debugMode: true
});

// Output:
// Environment variables:
//   PORT=3000 (using default)
```

## Best Practices

1. **Use `as const` for type literals** to get better type inference:
   ```typescript
   type: 'string' as const  // ✅ Good
   type: 'string'           // ❌ Less precise typing
   ```

2. **Group related variables** in logical schemas:
   ```typescript
   const dbEnv = defineEnv({
     DATABASE_URL: { type: 'string' as const },
     DATABASE_POOL_SIZE: { type: 'number' as const, defaultValue: 10 }
   });
   ```

3. **Validate early** in your application startup:
   ```typescript
   // At the top of your main file
   const env = defineEnv(schema);
   ```

4. **Use meaningful validation messages**:
   ```typescript
   validate: (value) => value > 0 || 'Must be a positive number'
   ```

5. **Provide sensible defaults** for optional variables:
   ```typescript
   TIMEOUT: {
     type: 'number' as const,
     defaultValue: 5000  // 5 seconds
   }
   ```

## Environment Variable Examples

Set these in your shell or `.env` file:

```bash
# String
DATABASE_URL=postgresql://user:pass@localhost:5432/db

# Number
PORT=8080

# Boolean
DEBUG=true

# Enum
NODE_ENV=production
```

## TypeScript Integration

The library provides full TypeScript support with:

- **Type inference**: Automatically infers types from your schema
- **IntelliSense**: Autocomplete for environment variable names
- **Type checking**: Compile-time validation of usage
- **Error messages**: Clear TypeScript errors for invalid usage

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

MIT License - see LICENSE file for details.

