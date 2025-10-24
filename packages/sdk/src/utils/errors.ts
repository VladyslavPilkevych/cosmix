export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "HttpError";
  }
}

export class ParseError extends Error {
  constructor(message = "Failed to parse response") {
    super(message);
    this.name = "ParseError";
  }
}
