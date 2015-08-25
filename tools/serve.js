import path from 'path';
import cp from 'child_process';

/**
 * Launches Node.js/Express web server in a separate (forked) process.
 */
export default () => new Promise((resolve, reject) => {
  console.log('serve');
  const server = cp.fork(path.join(__dirname, '../build/server.js'), {
    env: Object.assign({NODE_ENV: 'development'}, process.env)
  });
  server.once('message', message => {
    if (message.match(/^online$/)) {
      resolve();
    }
  });
  server.once('error', err => reject(error));
  process.on('exit', () => server.kill('SIGTERM'));
});
