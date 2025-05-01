// import type { UserConfig } from "./config";

export const createBuilder = async () => {
  return await Bun.build({
    entrypoints: ['./index.html'],
    outdir: 'dist', // 输出目录
    target: 'browser',
    minify: true,
    env: 'inline',
    naming: {
      // entry: '[dir]/[name]-[hash].[ext]',
      chunk: 'chunks/[name]-[hash].[ext]',
      asset: 'assets/[name]-[hash].[ext]'
    }
  });
}
