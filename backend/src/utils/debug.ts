export function debugLog(scope: string, message: string, meta?: unknown): void {
  if (meta !== undefined) {
    console.log(`[DEBUG][${scope}] ${message}`, meta);
    return;
  }

  console.log(`[DEBUG][${scope}] ${message}`);
}

export function debugError(scope: string, message: string, error?: unknown): void {
  if (error !== undefined) {
    console.error(`[DEBUG][${scope}] ${message}`, error);
    return;
  }

  console.error(`[DEBUG][${scope}] ${message}`);
}
