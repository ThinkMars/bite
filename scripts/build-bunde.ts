const builds = [
  { entry: './src/index.ts', outdir: 'dist', target: 'bun' },
  { entry: './src/cli.ts', outdir: 'dist', target: 'bun' },
  { entry: './src/client.ts', outdir: 'dist', target: 'browser' },
];

for (const build of builds) {
  // 使用 Bun.build 构建项目
  await Bun.build({
    entrypoints: [build.entry],
    outdir: build.outdir,
    target: build.target as Bun.Target,
  });
}

console.log('构建完成！');