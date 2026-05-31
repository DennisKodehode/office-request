// getContext() only resolves inside the Power Apps host. If the app is opened
// directly (e.g. http://localhost:3000 instead of the Local Play URL) there is
// no host to answer and the promise hangs forever — so we race it against a
// timeout and surface an actionable error instead of an endless spinner.
export const CONNECT_TIMEOUT_MS = 10_000

export const TIMEOUT = Symbol('timeout')

export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
): Promise<T | typeof TIMEOUT> {
  return Promise.race([
    promise,
    new Promise<typeof TIMEOUT>((resolve) => setTimeout(() => resolve(TIMEOUT), ms)),
  ])
}
