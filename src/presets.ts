import { EnvSchemaValueType } from "./types";

type NodeEnvType = "development" | "production" | "test";

const nodeEnv = (defaultValue: NodeEnvType = "development") => {
    const preset: EnvSchemaValueType = {
        type: "enum",
        validValues: ["development", "production", "test"],
        defaultValue,
    };
    return preset;
};

const port = (defaultValue = 3000) => {
    const preset: EnvSchemaValueType = {
        type: "number",
        defaultValue,
        validate: (value: number) => Number.isInteger(value) && value > 0 && value <= 65535 || "Port must be an integer between 1 and 65535",
    };
    return preset;
};

const boolean = (defaultValue = false) => {
    const preset: EnvSchemaValueType = {
        type: "boolean",
        defaultValue,
    };
    return preset;
};

const secret = (defaultValue?: string) => {
    const preset: EnvSchemaValueType = {
        type: "string",
        isSecret: true,
        ...(defaultValue !== undefined ? { defaultValue } : {}),
    };
    return preset;
};

export const presets = {
    nodeEnv,
    port,
    boolean,
    secret,
};
