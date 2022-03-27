export abstract class CustomError extends Error {
  abstract statusCode: number;

  constructor(...args: any[]) {
    super(...args);

    Object.setPrototypeOf(this, CustomError.prototype);
  }

  abstract serializeErrors(): { message: string; field?: string }[];
}
