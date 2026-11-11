// Throw this from services or controllers to send a specific status code.
// Messages always follow the project format: "Failed to <action>: <reason>"
// Example: throw new HttpError(404, "load listing", "listing 42 does not exist");
export class HttpError extends Error {
  constructor(statusCode, action, reason) {
    super(`Failed to ${action}: ${reason}`);
    this.statusCode = statusCode;
  }
}
