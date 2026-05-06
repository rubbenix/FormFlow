import { defineConfig } from "tsup";

export default defineConfig([
  // Main entry (core + vanilla)
  {
    entry: {
      index: "src/index.ts",
    },
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    clean: true,
    treeshake: true,
    splitting: false,
    minify: false,
    external: ["react", "react-dom"],
    banner: {
      js: `/**
 * FormFlow v1.0.0
 * Build smarter forms in minutes.
 * @license MIT
 * @see https://github.com/formflow-js/formflow
 */`,
    },
  },
  // React sub-export
  {
    entry: {
      "react/index": "src/react/index.ts",
    },
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    treeshake: true,
    splitting: false,
    minify: false,
    external: ["react", "react-dom", "formflow"],
  },
  // Validators sub-export
  {
    entry: {
      "validators/index": "src/validators/index.ts",
    },
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    treeshake: true,
    splitting: false,
    minify: false,
    external: ["react", "react-dom"],
  },
  // Vanilla sub-export
  {
    entry: {
      "vanilla/index": "src/vanilla/index.ts",
    },
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    treeshake: true,
    splitting: false,
    minify: false,
    external: ["react", "react-dom"],
  },
]);
