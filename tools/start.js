import browserSync from 'browser-sync';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

global.WATCH = true;
const config = require('./config')[0]; // Client-side bundle configuration
const bundler = webpack(config);

import path from 'path';

/**
 * Launches a development web server with "live reload" functionality -
 * synchronizing URLs, interactions and code changes across multiple devices.
 */
export default async () => {

  await require('./build')();
  await require('./serve')();

  browserSync({
    server: {
      baseDir: path.join(__dirname, '../www'),

      middleware: [
        webpackDevMiddleware(bundler, {
          // IMPORTANT: dev middleware can't access config, so we should
          // provide publicPath by ourselves
          publicPath: path.join(__dirname, '../www'),
          //publicPath: config.output.publicPath,
          //publicPath: 'http://localhost:5002/',

          watchOptions: {
            aggregateTimeout: 300,
            poll: true
          },

          // pretty colored output
          stats: config.stats,

          hot: true,
          historyApiFallback: true

          // for other settings see
          // http://webpack.github.io/docs/webpack-dev-middleware.html
        }),

        // bundler should be the same as above
        webpackHotMiddleware(bundler)
      ]

    },

    // no need to watch '*.js' here, webpack will take care of it for us,
    // including full page reloads if HMR won't work
    files: [
      'www/**/*.css',
      'www/**/*.html',
      //'build/content/**/*.*',
      //'build/templates/**/*.*'
    ]
  });
};
