
const text = await Bun.file(Bun.resolveSync('../package.json', import.meta.dir)).text();
const { version } = JSON.parse(text);

/**
 * 应用版本号
 */
export const VERSION = version as string

/**
 * 默认配置文件
 */
export const DEFAULT_CONFIG_FILE = 'bite.config.ts'

/**
 * 命令启动路径
 */
export const ROOT_DIR = process.cwd();
