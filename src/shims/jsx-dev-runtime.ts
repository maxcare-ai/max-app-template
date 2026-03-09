// @max-ai/components ships its bundle with dev-mode JSX transforms
// (jsxDEV from react/jsx-dev-runtime). In production React 19,
// that module exports jsxDEV = void 0, causing "is not a function" crashes.
// This shim provides jsxDEV backed by the production jsx/jsxs transforms.
// jsxDEV's 4th arg (isStaticChildren) determines whether to use jsx or jsxs —
// using jsx for static children arrays causes React "missing key" warnings.
import { jsx, jsxs, Fragment } from "react/jsx-runtime";
export { Fragment };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function jsxDEV(type: any, props: any, key: any, isStaticChildren?: boolean) {
  return isStaticChildren ? jsxs(type, props, key) : jsx(type, props, key);
}
