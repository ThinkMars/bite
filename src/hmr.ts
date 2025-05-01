/**
 * 注入HMR客户端
 */
export const injectHMRClient = (filePath: string): string => {
  return `
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    console.log('[HMR] ${filePath} updated');
    window.location.reload();
  });
}`;
}

/**
 * 处理HMR更新
 */
export const handleHMRUpdate = (path: string) => {
  // console.log(`Applying hot update for ${filePath}`);

  // 通知所有客户端更新
  for (const client of hmrClients) {
    client.send(JSON.stringify({ type: 'update', path }));
  }
}

// WebSocket客户端管理
export const hmrClients = new Set<Bun.ServerWebSocket<unknown>>();
export function addHMRClient(ws: Bun.ServerWebSocket<unknown>) {
  hmrClients.add(ws);
}
