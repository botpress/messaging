import typescript from "rollup-plugin-typescript2";
import css from "rollup-plugin-import-css";
import pkg from "./package.json";

const extensions = [".js", ".jsx", ".ts", ".tsx", ".d.ts"];
const input = "src/index.tsx";

const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];

const plugins = [
  typescript({
    typescript: require("typescript"),
  }),
  css()
];

export default [
  {
    input,
    output: {
      file: pkg.module,
      format: "esm",
      sourcemap: true,
    },
    plugins,
    external,
  },
  {
    input,
    output: {
      file: pkg.main,
      format: "cjs",
      sourcemap: true,
    },
    plugins,
    external,
  },
];