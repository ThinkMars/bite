import type { JavaScriptLoader } from "bun";
import { addHMRClient, hmrClients, injectHMRClient } from "./hmr";
import { ROOT_DIR } from "./constants";
import { createHMRWatcher } from "./watch";

export interface ServerOptions {
  port?: number;
  watch?: boolean;
  open?: boolean;
}

const DEFAULT_PORT = 4567;

export function createServer(options: ServerOptions) {
  createHMRWatcher();

  const server = Bun.serve({
    port: options.port || DEFAULT_PORT,
    async fetch(req, server) {
      const url = new URL(req.url);

      if (url.pathname.includes("..")) {
        return new Response("Forbidden", { status: 403 });
      }

      // 默认处理index.html
      if (url.pathname === '/') {
        url.pathname = '/index.html';
      }

      const ext = url.pathname.split('.').pop() || '';

      // 处理ESM请求
      if (['js', 'ts', 'jsx', 'tsx'].includes(ext)) {
        const filePath = Bun.resolveSync(`.${url.pathname}`, ROOT_DIR);
        const preFile = Bun.file(filePath);

        const file = await preFile.text();

        // 使用Bun原生解析能力处理ESM请求，ts\jsx\js\tsx
        const transfer = new Bun.Transpiler({
          loader: ext as JavaScriptLoader, // 根据文件扩展名选择 loader,
          target: 'browser',
        });
        const transpiled = await transfer.transformSync(file);

        // 注入HMR客户端代码
        const code = `${transpiled}\n${injectHMRClient(filePath)}`;

        return new Response(code, {
          headers: { "Content-Type": "application/javascript" }
        });
      }

      // 处理html请求
      if (ext === 'html') {
        const filePath = Bun.resolveSync(`.${url.pathname}`, ROOT_DIR);
        const preFile = Bun.file(filePath);

        const html = await preFile.text();

        return new Response(html, {
          headers: { "Content-Type": "text/html" }
        });
      }

      // 处理css请求
      if (ext === 'css') {
        const filePath = Bun.resolveSync(`.${url.pathname}`, ROOT_DIR);
        const preFile = Bun.file(filePath);

        const content = await preFile.text();

        const jsWrapper = `
        const style = document.createElement("style");
        style.setAttribute("data-bite-dev-id", "${url.pathname}");
        style.textContent = \`${content.replace(/`/g, '\\`')}\`;
        document.head.appendChild(style);
      `;

        return new Response(jsWrapper, {
          headers: { "Content-Type": "application/javascript" }
        });
      }

      // 处理svg请求
      if (ext === 'svg') {
        const filePath = Bun.resolveSync(`.${url.pathname}`, ROOT_DIR);
        const preFile = Bun.file(filePath);

        const content = await preFile.text();

        return new Response(content, {
          headers: { "Content-Type": "image/svg+xml" }
        });
      }

      // 👇 新增：WebSocket 升级路由
      // 1、WebSocket 是一种特殊的协议，需要浏览器发起一个 HTTP 请求，并由服务器将其 "升级" 成 WebSocket 连接。
      // 2、在 fetch(req) 中必须返回一个特定的响应来告诉 Bun：请把这个请求当作 WebSocket 连接来处理。
      // 3、如果你不做这个“升级”操作，Bun 就不会把这个请求交给 websocket 处理器，从而导致连接失败。
      if (url.pathname === '/hmr') {
        // Upgrade HTTP connection to WebSocket
        const upgraded = server.upgrade(req);
        if (!upgraded) {
          return new Response("Expected WebSocket Upgrade", { status: 400 });
        }
        // The actual handling is done in the websocket config below
        return new Response('upgraded');
      }

      return new Response('Not found', { status: 404 });
    },

    websocket: {
      open(ws) {
        console.log('HMR 客户端已连接');
        addHMRClient(ws);
      },
      message(ws, msg) { console.log('HMR 接收到客户端的消息'); },
      close(ws) {
        console.log('HMR 客户端已断开连接');
        hmrClients.delete(ws);
      },
    }
  });
}
