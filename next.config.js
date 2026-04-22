/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Handle MediaPipe and TensorFlow.js bundles
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      syncWebAssembly: true,
      layers: true,
    };

    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    });

    config.output.webassemblyModuleFilename =
      isServer ? '../static/wasm/[modulehash].wasm' : 'static/wasm/[modulehash].wasm';

    return config;
  },
};

module.exports = nextConfig;
