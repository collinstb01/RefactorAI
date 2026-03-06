from fastapi import HTTPException

class AppException(HTTPException):
    def __init__(self, status_code: int, code: str, message: str):
        self.code = code
        self.message = message
        super().__init__(status_code=status_code, detail=message)

class NotFoundException(AppException):
    def __init__(self, message: str = "Resource not found"):
        super().__init__(status_code=404, code="NOT_FOUND", message=message)

class BadRequestException(AppException):
    def __init__(self, message: str = "Bad request"):
        super().__init__(status_code=400, code="BAD_REQUEST", message=message)

class UnauthorizedException(AppException):
    def __init__(self, message: str = "Unauthorized"):
        super().__init__(status_code=401, code="UNAUTHORIZED", message=message)

class ForbiddenException(AppException):
    def __init__(self, message: str = "Forbidden"):
        super().__init__(status_code=403, code="FORBIDDEN", message=message)

class InternalServerErrorException(AppException):
    def __init__(self, message: str = "Internal server error"):
        super().__init__(status_code=500, code="INTERNAL_SERVER_ERROR", message=message)