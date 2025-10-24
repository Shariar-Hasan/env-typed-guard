
# env-typed-guard

A **TypeScript-first library** for **type-safe environment variable parsing and validation** with full IntelliSense and optional logging.

---

## Features

* 🔒 **Type-safe**: Full TypeScript support with automatic type inference
* 📋 **Schema-based**: Define environment variables with a clear schema
* ✅ **Validation**: Built-in and custom validators
* 🎯 **IntelliSense**: Autocomplete for environment variable names
* 🔧 **Flexible**: Supports `string`, `number`, `boolean`, and `enum`
* 📝 **Error handling**: Throw or log warnings based on configuration
* 🚀 **Zero dependencies**: Lightweight, focused, and portable with zero dependencies (only dotenv for peer)

> ⚠️ **Note:** This package is **Node-first**. Full type safety works in Node, Nest.js, and Express. For Next.js or browser environments, variables must be exposed via `NEXT_PUBLIC_*` and are **limited to strings**. (`Not recommended for next js till now`)

---

## Installation

```bash
npm install env-typed-guard
```

---

## Quick Start

```ts
import defineEnv from 'env-typed-guard';

const env = defineEnv({
  PORT: { type: 'number', defaultValue: 3000 },
  NODE_ENV: {
    type: 'enum',
    validValues: ['development', 'production', 'test'],
    defaultValue: 'development'
  },
  DATABASE_URL: { type: 'string' }, // Required
  DEBUG: { type: 'boolean', defaultValue: false }
});

console.log(`Server running on port ${env.PORT}`);
console.log(`Environment: ${env.NODE_ENV}`);
console.log(`Debug mode: ${env.DEBUG}`);
```

---

## API

### `defineEnv(schema, config?)`

Parses and validates environment variables based on a schema.

#### Parameters

* `schema` – Object defining environment variables and their types.
* `config` – Optional configuration:



### Schema

| Property       | Type                                    | Required | Description                                                |
| -------------- | --------------------------------------- | -------- | ---------------------------------------------------------- |
| `type`         | `'string'`, `'number'`, `'boolean'`, `'enum'` | ✅ Yes   | The type of the environment variable                       |
| `defaultValue` | same as type                            | ❌ No    | Default value if the variable is not set                   |
| `validate`     | `(value) => boolean \| string`           | ❌ No    | Custom validation function; return `true` or error message |
| `validValues`  | `string[]`                              | ❌ No*   | Required if `type` is `'enum'`; allowed values             |


*Only required for `enum` type variables.

---

### Configuration (`config`)

| Option      | Type      | Default | Description                                                |
| ----------- | --------- | ------- | ---------------------------------------------------------- |
| `debugMode` | `boolean` | `false` | Enable debug logging of parsed environment variables       |
| `throw`     | `boolean` | `true`  | Throw errors on validation failure (if `false`, logs only) |

---


## Types Supported

### String

```ts
const env = defineEnv({
  API_KEY: { type: 'string', defaultValue: 'dev-key' }
});
```

### Number

```ts
const env = defineEnv({
  PORT: { type: 'number', defaultValue: 3000 }
});
// PORT=8080 → parsed as number 8080
```

### Boolean

```ts
const env = defineEnv({
  DEBUG: { type: 'boolean', defaultValue: false }
});
// Accepts: 'true', 'false', '1', '0' (case insensitive)
```

### Enum

```ts
const env = defineEnv({
  LOG_LEVEL: { 
    type: 'enum', 
    validValues: ['debug', 'info', 'warn', 'error'], 
    defaultValue: 'info' 
  }
});
// Type: 'debug' | 'info' | 'warn' | 'error'
```

---

## Advanced Usage

### Custom Validation

```ts
const env = defineEnv({
  PASSWORD: {
    type: 'string',
    validate: (val) => val.length >= 8 || 'Password must be at least 8 chars'
  },
  PORT: {
    type: 'number',
    defaultValue: 3000,
    validate: (val) => (val >= 1000 && val <= 65535) || 'Port must be 1000–65535'
  }
});
```

### Optional vs Required Variables

```ts
const env = defineEnv({
  DATABASE_URL: { type: 'string' },        // Required
  CACHE_TTL: { type: 'number', defaultValue: 300 } // Optional
});
```

### Node vs Client (Next.js)

* **Node/Nest.js/Express:** Full types supported.
* **Next.js client:** Only strings allowed; use `NEXT_PUBLIC_*` prefix: (`Not recommended till now`)

```ts
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: env.API_URL, // string only
  }
};
```

---

## Error Handling

```ts
try {
  const env = defineEnv({ REQUIRED_VAR: { type: 'string' } });
} catch (err) {
  console.error('Env validation failed:', err.message);
  process.exit(1);
}

// Or disable throwing
const env = defineEnv({ REQUIRED_VAR: { type: 'string' } }, { throw: false });
```

---

## Debug Mode

```ts
const env = defineEnv({
  PORT: { type: 'number', defaultValue: 3000 }
}, { debugMode: true });

// Output:
// Environment variables:
//   PORT=3000 (using default)
```

---

## Best Practices

1. Use `as const` for type literals:

```ts
type: 'string' as const
```

2. Validate early in your app startup:

```ts
const env = defineEnv(schema); // Top of main file
```

3. Use meaningful validation messages:

```ts
validate: (value) => value > 0 || 'Must be positive'
```

4. Provide defaults for optional vars:

```ts
TIMEOUT: { type: 'number', defaultValue: 5000 }
```

---

## Environment Variable Examples

```bash
DATABASE_URL=postgres://user:pass@localhost:5432/db
PORT=8080
DEBUG=true
NODE_ENV=production
```

---

## TypeScript Integration

* **Type inference** from schema
* **IntelliSense** autocomplete
* **Compile-time type checking**
* **Clear error messages**

---

## Tested Environments

* ✅ Node.js
* ✅ Nest.js
* ✅ Express.js
* 🟨 Next.js (server-side only, client limited to strings)

---

## Contributing

Currently, there are no active contribution opportunities. However, if you come across any issues, feel free to raise them in the GitHub Issues section.



