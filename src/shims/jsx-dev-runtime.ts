// @max-ai/components ships its bundle with dev-mode JSX transforms
// (jsxDEV from react/jsx-dev-runtime). In production React 19,
// that module exports jsxDEV = void 0, causing "is not a function" crashes.
// This shim always provides jsxDEV backed by the production jsx transform.
export { jsx as jsxDEV, jsxs, Fragment } from "react/jsx-runtime";
