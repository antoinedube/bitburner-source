/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const webpack = require("webpack");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

/** @type {import("webpack-cli").CallableOption} */
module.exports = (env, argv) => {
  const isDevServer = (env || {}).WEBPACK_SERVE === true;
  const runInContainer = (env || {}).runInContainer === true;
  const isDevelopment = argv.mode === "development";
  const enableReactRefresh = (env || {}).enableReactRefresh === true;
  const outputDirectory = "dist";
  const entry = "./src/index.tsx";

  /** @type {webpack.StatsOptions} */
  const statsConfig = {
    builtAt: true,
    children: false,
    chunks: false,
    chunkGroups: false,
    chunkModules: false,
    chunkOrigins: false,
    colors: true,
    entrypoints: false,
  };

  /** @type {webpack.Configuration["devServer"]} */
  const devServerSettings = {
    hot: true,
    port: 8000,
    devMiddleware: {
      stats: statsConfig,
    },
    static: {
      directory: path.join(__dirname, "dist"),
      publicPath: "/dist",
    },
  };

  // By default, the webpack-dev-server is not exposed outside of localhost.
  // When running in a container we need it accessible externally.
  if (runInContainer) {
    devServerSettings.host = "0.0.0.0";
  }

  // Get the current commit hash to inject into the app
  // https://stackoverflow.com/a/38401256
  const commitHash = require("child_process").execSync("git rev-parse --short HEAD").toString().trim();

  /** @type {HtmlWebpackPlugin.Options} */
  const htmlConfig = {
    title: "Bitburner",
    template: "src/index.html",
    filename: isDevServer ? "index.html" : "../index.html",
    favicon: "favicon.ico",
    meta: {},
    minify: isDevelopment
      ? false
      : {
          collapseBooleanAttributes: true,
          collapseInlineTagWhitespace: false,
          collapseWhitespace: false,
          conservativeCollapse: false,
          html5: true,
          includeAutoGeneratedTags: false,
          keepClosingSlash: true,
          minifyCSS: false,
          minifyJS: false,
          minifyURLs: false,
          preserveLineBreaks: false,
          preventAttributesEscaping: false,
          processConditionalComments: false,
          quoteCharacter: '"',
          removeAttributeQuotes: false,
          removeComments: false,
          removeEmptyAttributes: false,
          removeEmptyElements: false,
          removeOptionalTags: false,
          removeScriptTypeAttributes: false,
          removeStyleLinkTypeAttributes: false,
          removeTagWhitespace: false,
          sortAttributes: false,
          sortClassName: false,
          useShortDoctype: false,
        },
  };

  return {
    plugins: [
      new MonacoWebpackPlugin({ languages: ["javascript", "typescript", "json"] }),
      new webpack.DefinePlugin({
        "process.env.NODE_ENV": isDevelopment ? '"development"' : '"production"',
      }),
      new HtmlWebpackPlugin(htmlConfig),
      new ForkTsCheckerWebpackPlugin({
        typescript: {
          diagnosticOptions: {
            semantic: true,
            syntactic: true,
          },
        },
      }),
      new webpack.DefinePlugin({
        __COMMIT_HASH__: JSON.stringify(commitHash || "DEV"),
      }),
      // In dev mode, use a faster method of create sourcemaps
      // while keeping lines/columns accurate
      isDevServer &&
        new webpack.EvalSourceMapDevToolPlugin({
          // Exclude vendor files from sourcemaps
          // This is a huge speed improvement for not much loss
          exclude: ["vendor"],
          columns: true,
          module: true,
        }),
      !isDevServer &&
        new webpack.SourceMapDevToolPlugin({
          filename: "[file].map",
          columns: true,
          module: true,
        }),
      enableReactRefresh && new ReactRefreshWebpackPlugin(),
      new CopyPlugin({
        patterns: [
          {
            from: "{tex-chtml.js,*/**/*}",
            to: "mathjax",
            context: "node_modules/mathjax-full/es5",
          },
        ],
      }),
    ].filter(Boolean),
    target: "web",
    entry: entry,
    output: {
      path: path.resolve(__dirname, outputDirectory),
      filename: "[name].bundle.js",
      assetModuleFilename: "assets/[hash][ext][query]",
    },
    module: {
      rules: [
        {
          test: /\.(js$|jsx|ts|tsx)$/,
          exclude: /node_modules/,
          resourceQuery: { not: /raw/ },
          use: {
            loader: "babel-loader",
            options: {
              plugins: [enableReactRefresh && require.resolve("react-refresh/babel")].filter(Boolean),
              cacheDirectory: true,
            },
          },
        },
        { test: /\.(ttf|woff2|png|jpe?g|gif|jp2|webp)$/, type: "asset/resource" },
        {
          test: /\.s?css$/,
          use: ["style-loader", "css-loader"],
        },
        {
          resourceQuery: /raw/,
          type: "asset/source",
        },
      ],
    },
    optimization: {
      removeAvailableModules: true,
      removeEmptyChunks: true,
      mergeDuplicateChunks: true,
      flagIncludedChunks: true,
      sideEffects: true,
      providedExports: true,
      usedExports: true,
      concatenateModules: false,
      minimize: !isDevelopment,
      portableRecords: true,
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: `vendor`,
            chunks: "all",
          },
        },
      },
    },
    devServer: devServerSettings,
    watchOptions: {
      // When running in a container, we can't necesarily watch filesystem events.
      poll: runInContainer ? true : undefined,
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js", ".jsx"],
      alias: {
        "@player": path.resolve(__dirname, "src/Player"),
        "@enums": path.resolve(__dirname, "src/Enums"),
        "@nsdefs": path.resolve(__dirname, "src/ScriptEditor/NetscriptDefinitions.d.ts"),
      },
      fallback: { crypto: false },
    },
    stats: statsConfig,
    ignoreWarnings: [
      {
        module: /@babel\/standalone/,
        message: /Critical dependency: the request of a dependency is an expression/,
      },
    ],
  };
};
