import del from 'del';
import fs from './lib/fs';

/**
 * Cleans up the output (build) directory.
 */
export default async () => {
  console.log('clean');
  await del(['.tmp', 'build/*', '!build/.git', '!build/vendor', '!build/node_modules', 'www/*', '!www/.gitignore'], {dot: true});
  await fs.makeDir('build');
};
