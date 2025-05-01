import { cac } from 'cac';
import { VERSION } from './constants';
import { resolveConfig } from './config';
import { premove } from 'premove';

const cli = cac('bite');

cli.command('init', '初始化项目').action(() => {
  console.log('正在初始化项目...');
})

cli.command('dev', '启动开发服务器').action(async () => {
  const config = await resolveConfig()

  console.log('正在启动开发服务器...');

  const { createServer } = await import('./server');
  createServer(config)

  console.log('开发服务器已启动: http://localhost:4567');
});

cli.command('build', '执行构建').action(async () => {
  console.log('正在执行构建...');

  await premove('dist', { force: true });

  const { createBuilder } = await import('./build');
  await createBuilder();

  console.log('构建完成！');

});

cli.help();
cli.version(VERSION);

cli.parse();