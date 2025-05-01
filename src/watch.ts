import chokidar from 'chokidar';
import { ROOT_DIR } from './constants';
import { handleHMRUpdate } from './hmr';

/**
 * 创建HMR监听器
 * @description 监听文件变化并触发热更新
 */
export const createHMRWatcher = () => {
  const SOURCE_DIR = '/src';

  const watchPath = ROOT_DIR + SOURCE_DIR;

  const watcher = chokidar.watch([watchPath], {
    ignored: [
      // /(^|[\/\\])\../,
      '**/.git/**',
      '**/node_modules/**',
      '**/test-results/**',
    ], // Ignore dotfiles
  })

  watcher.on('change', (filePath) => {
    const normolizedPath = filePath.slice(filePath.indexOf(SOURCE_DIR));
    handleHMRUpdate(normolizedPath);
  });
}