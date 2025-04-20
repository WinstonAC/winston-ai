import type { StorybookConfig } from "@storybook/nextjs";
import path from 'path';

const config: StorybookConfig = {
  stories: [
    "../components/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/nextjs",
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  staticDirs: ["../public"],
  core: {
    builder: '@storybook/builder-webpack5',
  },
  webpackFinal: async (config) => {
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': path.resolve(__dirname, '../'),
        '@components': path.resolve(__dirname, '../components'),
        '@styles': path.resolve(__dirname, '../styles'),
        '@utils': path.resolve(__dirname, '../utils'),
        '@contexts': path.resolve(__dirname, '../contexts'),
      };
    }

    return config;
  },
};

export default config;