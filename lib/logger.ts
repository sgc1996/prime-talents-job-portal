type LogLevel = "debug" | "info" | "warn" | "error";

interface LogPayload {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

const SENSITIVE_KEYS = new Set([
  "password",
  "passwordhash",
  "token",
  "secret",
  "code",
  "codehash",
  "twofactorsecret",
  "authorization",
  "cookie",
]);

function sanitize(data: unknown): unknown {
  if (data === null || data === undefined) return data;
  if (typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map(sanitize);
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitize(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

function output(level: LogLevel, message: string, context?: Record<string, unknown>, err?: unknown) {
  const payload: LogPayload = {
    level,
    message,
    timestamp: new Date().toISOString(),
  };

  if (context) {
    payload.context = sanitize(context) as Record<string, unknown>;
  }

  if (err instanceof Error) {
    payload.error = {
      name: err.name,
      message: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    };
  }

  const json = JSON.stringify(payload);
  if (level === "error") {
    console.error(json);
  } else if (level === "warn") {
    console.warn(json);
  } else {
    console.log(json);
  }
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => {
    if (process.env.NODE_ENV !== "production") {
      output("debug", message, context);
    }
  },
  info: (message: string, context?: Record<string, unknown>) => {
    output("info", message, context);
  },
  warn: (message: string, context?: Record<string, unknown>) => {
    output("warn", message, context);
  },
  error: (message: string, context?: Record<string, unknown>, err?: unknown) => {
    output("error", message, context, err);
  },
};
