/**
 * Error taxonomy — port of backend/onyx/chat/errors.py and general server error handling.
 */

export class OnyxError extends Error {
  readonly code: string;
  readonly httpStatus: number;
  constructor(code: string, message: string, httpStatus = 500) {
    super(message);
    this.code = code;
    this.httpStatus = httpStatus;
  }
}

export class InvalidRequestError extends OnyxError {
  constructor(message: string) {
    super("invalid_request", message, 400);
  }
}

/**
 * Port of FastAPI HTTPException(detail=<literal>) semantics: the response body
 * is {"detail": <detail>} where detail is any JSON value (string, object...).
 * Used for fastapi-users error bodies (LOGIN_BAD_CREDENTIALS,
 * REGISTER_USER_ALREADY_EXISTS, REGISTER_INVALID_PASSWORD, ...) and auth gates.
 */
export class AuthError extends OnyxError {
  readonly detail: unknown;
  constructor(httpStatus: number, detail: unknown) {
    super(
      typeof detail === "string" ? detail : "auth_error",
      typeof detail === "string" ? detail : JSON.stringify(detail),
      httpStatus,
    );
    this.detail = detail;
  }
}

export class UnauthorizedError extends OnyxError {
  constructor(message = "Unauthorized") {
    super("unauthorized", message, 401);
  }
}

export class ForbiddenError extends OnyxError {
  constructor(message = "Forbidden") {
    super("forbidden", message, 403);
  }
}

export class NotFoundError extends OnyxError {
  constructor(entity: string) {
    super("not_found", `${entity} not found`, 404);
  }
}

export class UnsupportedFeatureError extends OnyxError {
  constructor(message: string) {
    super("unsupported_feature", message, 501);
  }
}

// Port of onyx/chat/errors.py enums
export class ChatRuntimeError extends OnyxError {
  constructor(message: string) {
    super("chat_runtime_error", message, 500);
  }
}

export class LLMGenerationError extends OnyxError {
  constructor(message: string, detail?: string) {
    super("llm_generation_error", `${message}${detail ? `: ${detail}` : ""}`, 502);
  }
}

export class InvalidChatSessionError extends OnyxError {
  constructor(message = "Invalid chat session") {
    super("invalid_chat_session", message, 400);
  }
}

export class InvalidMessageExceptionError extends OnyxError {
  constructor(message = "Invalid message") {
    super("invalid_message", message, 400);
  }
}

export class GenAIDisabledError extends OnyxError {
  constructor() {
    super("gen_ai_disabled", "Gen-AI features are disabled", 403);
  }
}

export class LLMRateLimitError extends OnyxError {
  constructor(message = "LLM rate limit exceeded") {
    super("llm_rate_limit", message, 429);
  }
}

export class OnyxInterruptedError extends OnyxError {
  constructor(message = "Generation was interrupted") {
    super("interrupted", message, 499);
  }
}
