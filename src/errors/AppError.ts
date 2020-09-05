interface InternalData {
  [key: string]: number | string;
}

class AppError {
  public readonly message: string;

  public readonly statusCode: number;

  public readonly data: InternalData;

  constructor(message: string, data: InternalData, statusCode = 400) {
    this.message = message;
    this.data = data;
    this.statusCode = statusCode;
  }
}

export default AppError;
