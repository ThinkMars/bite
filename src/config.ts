import type { ServerOptions } from "./server";

export interface DefaultOptions {
  root?: string;
}

export type UserConfig = ServerOptions & DefaultOptions

export const defineConfig = (config: UserConfig) => {
  return config;
}

const defaultConfig: UserConfig = {
  root: process.cwd(),
};

export const resolveConfig = async (): Promise<UserConfig> => {
  // 使用 Bun.resolveSync 来找到配置文件路径
  const configPath = Bun.resolveSync('./bite.config.ts', process.cwd());

  try {
    // 使用 import 动态导入配置文件
    const module = await import(configPath);

    const userConfig = module.default || module;

    return { ...defaultConfig, ...userConfig };
  } catch (error) {
    throw new Error(`Failed to load config file: ${error}`);
  }
};