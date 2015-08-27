import fs from 'fs';
import copy from './lib/copy';

export default async () => {
// check config files and copy default if they do not exist
  let input = [
    {src: 'tools/default-config/config.xml', dest: 'config.xml'},
    //{src: 'tools/default-config/client_secret.json', dest: 'src/config/gdrive/client_secret.json'}
  ];

  input.forEach(function (config) {
    fs.stat(config.dest, function (err, stat) {
      if (err == null) {
        console.log(config.dest + ' exist');
      } else if (err.code == 'ENOENT') {
        console.log('copying ' + config.src + ' to ' + config.dest);
        copy(config.src, config.dest);
      } else {
        console.log(err.code);
      }
    });
  });
}
