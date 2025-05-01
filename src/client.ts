
const socket = new WebSocket('ws://localhost:4567/hmr?token=bite-ping');

socket.addEventListener('open', () => {
  console.log('[HMR] Connected to server');
});

socket.addEventListener('close', () => {
  console.log('[HMR] Disconnected from server');
});

socket.addEventListener('message', async (event) => {
  const { type, path } = JSON.parse(event.data);
  if (type === 'update') {
    if (path.endsWith('.css')) {
      // 定位现有 <style> 标签
      const styleEl = document.querySelector(
        `style[data-bite-dev-id="${path}"]`
      );

      // 创建新标签并插入
      await import(`${path}?t=${Date.now()}`);

      // 移除旧标签
      if (styleEl) {
        document.head.removeChild(styleEl);
      }
    }

    if (path.endsWith('.ts')) {

      console.log(`[HMR] Updating ${path}`);

      // await import(`${path}?t=${Date.now()}`);
      // 由于涉及顶层作用域更新，直接重载
      window.location.reload();
    }
  }
});

socket.addEventListener('error', (error) => {
  console.error('[HMR] Error:', error);
});