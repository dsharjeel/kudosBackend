class ApiResponse {
    constructor(success, message, data) {
        this.success = success;
        this.message = message;
        this.data = data;
    }
}

class ApiError extends Error {
    constructor(statusCode, message = "Internal server error") {
        super(message);
        this.statusCode = statusCode;
    }
}

export { ApiResponse, ApiError };
