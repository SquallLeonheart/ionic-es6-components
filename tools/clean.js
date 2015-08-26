import del from 'del';
import fs from './lib/fs';

/**
 * Cleans up the output (build) directory.
 */
export default () => new Promise((resolve, reject) => {
  console.log('clean');
  del(['.tmp', 'build/*', 'www/*', '!www/.gitignore'], {dot: true}, err => {
    if (err) {
      reject(err);
    } else {
      fs.makeDir('build').then(resolve, reject);
    }
  });
});
