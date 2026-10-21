// Static assets in /public are served under the configured basePath
// (e.g. "/cascade" on GitHub Pages), but next/image's `src` does not get the
// basePath applied automatically — prefix asset URLs with this helper.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function withBasePath(path: string): string {
  return `${BASE_PATH}${path}`;
}
