/** Nest TransformInterceptor wraps payloads as `{ success, data }`. */
export function unwrapApi<T>(body: unknown): T {
  if (
    body &&
    typeof body === 'object' &&
    'data' in body &&
    'success' in body
  ) {
    return (body as { data: T }).data;
  }
  return body as T;
}
