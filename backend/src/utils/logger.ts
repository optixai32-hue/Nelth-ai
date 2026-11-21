/**
 * Structured JSON logger — port of the python-json-logger structured output
 * used across the Onyx Standard backend (LOG_FORMAT=json).
 */

type Level = "debug" | "info" | "warning" | "error";

const LEVEL_ORDER: Record<Level, number> = { debug: 10, info: 20, warning: 30, error: 40 };
const MIN_LEVEL: number =
  LEVEL_ORDER[(process.env.ONYX_LOG_LEVEL as Level) ?? "info"] ?? 20;

export interface LogRecord {
  time: string;
  level: Level;
  name: string;
  message: string;
  [key: string]: unknown;
}

function emit(level: Level, name: string, message: string, extra?: Record<string, unknown>) {
  if (LEVEL_ORDER[level] < MIN_LEVEL) return;
  const record: LogRecord = {
    time: new Date().toISOString(),
    level,
    name,
    message,
    ...(extra ?? {}),
  };
  const line = JSON.stringify(record);
  if (level === "error") console.error(line);
  else console.log(line);
}

export class Logger {
  constructor(private readonly name: string) {}

  debug(message: string, extra?: Record<string, unknown>) {
    emit("debug", this.name, message, extra);
  }
  info(message: string, extra?: Record<string, unknown>) {
    emit("info", this.name, message, extra);
  }
  warning(message: string, extra?: Record<string, unknown>) {
    emit("warning", this.name, message, extra);
  }
  error(message: string, extra?: Record<string, unknown>) {
    emit("error", this.name, message, extra);
  }
  child(childName: string): Logger {
    return new Logger(`${this.name}.${childName}`);
  }
}

export function getLogger(name: string): Logger {
  return new Logger(name);
}

/** Retry helper — port of tenacity retry semantics (exponential backoff). */
export async function withRetry<T>(
  fn: () => Promise<T>,
  opts: { attempts?: number; baseDelayMs?: number; logger?: Logger; name?: string } = {},
): Promise<T> {
  const attempts = opts.attempts ?? 3;
  const base = opts.baseDelayMs ?? 500;
  let lastErr: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      opts.logger?.warning(`retry ${attempt}/${attempts} failed`, {
        name: opts.name,
        error: String(err),
      });
      if (attempt < attempts) {
        await new Promise((r) => setTimeout(r, base * 2 ** (attempt - 1)));
      }
    }
  }
  throw lastErr;
}
