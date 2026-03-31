import { HttpErrorResponse } from '@angular/common/http';

export function getErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (typeof error.error === 'string' && error.error.trim().length > 0) {
      return error.error.trim();
    }

    if (error.error && typeof error.error === 'object' && 'message' in error.error) {
      const message = error.error.message;

      if (typeof message === 'string' && message.trim().length > 0) {
        return message.trim();
      }
    }

    if (typeof error.message === 'string' && error.message.trim().length > 0) {
      return error.message.trim();
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message.trim();
  }

  return 'Something went wrong.';
}

export function getErrorStatus(error: unknown): number | null {
  return error instanceof HttpErrorResponse ? error.status : null;
}
