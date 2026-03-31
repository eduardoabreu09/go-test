export type RequestStatus = 'idle' | 'loading' | 'success' | 'error';

export type RequestState<T> = {
  status: RequestStatus;
  data: T | null;
  errorMessage: string | null;
  httpStatus: number | null;
};

export function idleState<T>(data: T | null = null): RequestState<T> {
  return {
    status: 'idle',
    data,
    errorMessage: null,
    httpStatus: null,
  };
}

export function loadingState<T>(data: T | null = null): RequestState<T> {
  return {
    status: 'loading',
    data,
    errorMessage: null,
    httpStatus: null,
  };
}

export function successState<T>(data: T, httpStatus: number): RequestState<T> {
  return {
    status: 'success',
    data,
    errorMessage: null,
    httpStatus,
  };
}

export function errorState<T>(errorMessage: string, httpStatus: number | null, data: T | null = null): RequestState<T> {
  return {
    status: 'error',
    data,
    errorMessage,
    httpStatus,
  };
}
