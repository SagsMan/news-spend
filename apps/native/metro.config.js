// Learn more https://docs.expo.io/guides/customizing-metro
const { withRozenite } = require("@rozenite/metro");
const { getSentryExpoConfig } = require("@sentry/react-native/metro");
const {
  withVarlockMetroConfig,
} = require("@varlock/expo-integration/metro-config");
const { withUniwindConfig } = require("uniwind/metro");
// const { withFacetpack } = require("@ecrindigital/facetpack");
// const { FileStore } = require("@expo/metro/metro-cache");
const os = require("node:os");
const path = require("node:path");

// biome-ignore lint/correctness/noGlobalDirnameFilename: we can't use import.meta.dirname
const config = getSentryExpoConfig(__dirname);

// The workspace and native app declare different React versions. Web packages
// must share the workspace React/React DOM pair to avoid invalid hook calls.
// biome-ignore lint/correctness/noGlobalDirnameFilename: Metro loads this as CommonJS.
const workspaceRoot = path.resolve(__dirname, "../..");
const webReactPackage = /^(react|react-dom)(\/|$)/;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === "web" && webReactPackage.test(moduleName)) {
    return {
      type: "sourceFile",
      filePath: require.resolve(moduleName, { paths: [workspaceRoot] }),
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};
config.resolver.unstable_enablePackageExports = true;
config.maxWorkers = Math.max(1, Math.floor(os.cpus().length * 0.5));

// config.cacheStores = [
//   new FileStore({
//     root: path.join(__dirname, "node_modules", ".cache", "metro"),
//   }),
// ];

// Wrap with Uniwind first, then Rozenite, then varlock (outermost: resolves
// varlock/env subpath exports and initialises the ENV proxy in Metro).
module.exports = withVarlockMetroConfig(
  withRozenite(
    withUniwindConfig(config, {
      cssEntryFile: "./src/global.css",
      dtsFile: "./src/uniwind-types.d.ts",
    }),
    { enabled: process.env.WITH_ROZENITE === "true" }
  )
);
