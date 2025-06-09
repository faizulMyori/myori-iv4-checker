import path from 'path';
import type { ConfigEnv, UserConfig } from "vite";
import { defineConfig, mergeConfig } from "vite";
import {
  getBuildConfig,
  external,
  pluginHotRestart,
} from "./vite.base.config";

// https://vitejs.dev/config
export default defineConfig((env) => {
  const config: UserConfig = {
    build: {
      lib: {
        entry: path.resolve(__dirname, 'src/main.ts'),
        fileName: () => "[name].js",
        formats: ["cjs"],
      },
      rollupOptions: {
        external,
      },
    },
    plugins: [pluginHotRestart("restart")],
    resolve: {
      // Load the Node.js entry.
      mainFields: ["module", "jsnext:main", "jsnext"],
    },
  };

  return mergeConfig(getBuildConfig(env), config);
});
