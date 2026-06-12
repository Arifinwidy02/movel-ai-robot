import type { Request, Response, NextFunction } from "express";

interface AppError extends Error {
  statusCode?: number;
  name: string;
}

function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  let code = 500;
  let response: { message: string } = { message: "Internal Server Error" };

  if (err.name === "ValidationError") {
    code = 400;
    response = { message: err.message };
  } else if (err.name === "NotFoundError" || err.name === "data not found") {
    code = 404;
    response = { message: "data not found" };
  } else if (err.name === "UnauthorizedError" || err.name === "Unautorized") {
    code = 401;
    response = { message: "Unauthorized" };
  } else if (err.name === "ForbiddenError" || err.name === "forbidden") {
    code = 403;
    response = { message: "forbidden" };
  } else if (err.name === "BadRequestError") {
    code = 400;
    response = { message: err.message };
  } else if (err.statusCode) {
    code = err.statusCode;
    response = { message: err.message };
  }

  res.status(code).json(response);
}

export default errorHandler;
