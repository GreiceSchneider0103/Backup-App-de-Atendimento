export class AppError extends Error {
  constructor(
    message: string,
    public readonly status: number = 400,
    public readonly code: string = "APP_ERROR"
  ) {
    super(message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Não autenticado") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Sem permissão") {
    super(message, 403, "FORBIDDEN");
  }
}


export class ServiceUnavailableError extends AppError {
  constructor(message = "Serviço temporariamente indisponível") {
    super(message, 503, "SERVICE_UNAVAILABLE");
  }
}
