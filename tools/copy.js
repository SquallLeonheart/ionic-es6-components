import path from 'path';
import copy from './lib/copy';
import watch from './lib/watch';

/**
 * Copies static files such to the output (build) folder.
 */
export default async () => {
  console.log('copy');
  let input = [
    // Static files
    {src: 'src/public', dest: 'www'},
    // Views
    {src: 'src/views', dest: 'build/views'},

    {src: 'src/config/gdrive/access_token.json', dest: 'build/access_token.json', ignoreErrors: true},
    {src: 'src/config/gdrive/client_secret.json', dest: 'build/client_secret.json', ignoreErrors: true},

    {src: 'tools/default-config/package.json', dest: 'build/package.json'},
    // Website and email templates
    //copy('src/templates', 'www/templates')
  ];
  await Promise.all(input.map(function (items) {
    return copy(items.src,items.dest,items.ignoreErrors);
  }));

 /* if (global.WATCH) {
    const watcher = await watch('src/content/!**!/!*.*');
    watcher.on('changed', async (file) => {
      file = file.substr(path.join(__dirname, '../src/content/').length);
      await copy(`src/content/${file}`, `build/content/${file}`);
    });
  }*/
};
