import path from 'path';
import fs from 'fs';
import webpack, { DefinePlugin, BannerPlugin } from 'webpack';
import ExtractTextPlugin from "extract-text-webpack-plugin";
import merge from 'lodash/object/merge';

const DEBUG = !process.argv.includes('release');
const WATCH = global.WATCH === undefined ? false : global.WATCH;
const VERBOSE = process.argv.includes('verbose');
const SERVER = process.argv.includes('server');
const STYLE_LOADER = 'style-loader/useable';
const CSS_LOADER = DEBUG ? 'css-loader' : 'css-loader?minimize';
const AUTOPREFIXER_BROWSERS = [
  'Android 2.3',
  'Android >= 4',
  'Chrome >= 20',
  'Firefox >= 24',
  'Explorer >= 8',
  'iOS >= 6',
  'Opera >= 12',
  'Safari >= 6'
];
const GLOBALS = {
  'process.env.NODE_ENV': DEBUG ? '"development"' : '"production"',
  '__DEV__': DEBUG
};

//
// Common configuration chunk to be used for both
// client-side (app.js) and server-side (server.js) bundles
// -----------------------------------------------------------------------------

const config = {
  output: {
    publicPath: './',
    sourcePrefix: '  '
  },

  cache: DEBUG,
  debug: DEBUG,

  stats: {
    colors: true,
    reasons: DEBUG,
    hash: VERBOSE,
    version: VERBOSE,
    timings: true,
    chunks: VERBOSE,
    chunkModules: VERBOSE,
    cached: VERBOSE,
    cachedAssets: VERBOSE
  },

  plugins: [
    new webpack.optimize.OccurenceOrderPlugin()
  ],

  resolve: {
    root: [
      path.join(__dirname, '../node_modules')
    ],
    extensions: ['', '.webpack.js', '.web.js', '.js'],
    modulesDirectories: [
      'node_modules'
    ]
  },

  module: {
    loaders: [
      {
        test: /\.txt/,
        loader: 'file?name=[path][name].[ext]'
      }, {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, '../src')
        ],
        loaders: ['ng-annotate', 'babel-loader']
      }
    ]
  },

  postcss: [
    require('postcss-nested')(),
    require('cssnext')(),
    require('autoprefixer-core')(AUTOPREFIXER_BROWSERS)
  ]
};

//
// Configuration for the client-side bundle (app.js)
// -----------------------------------------------------------------------------
const appConfig = merge({}, config, {
  entry: {
    app: [
      ...(WATCH && ['webpack-hot-middleware/client']),
      './src/app.js'
    ]
  },
  output: {
    path: path.join(__dirname, '../www'),
    filename: '[name].js',
    chunkFilename: "[id].bundle.js"
  },
  devtool: DEBUG ? 'source-map' : false,
  plugins: [
    ...config.plugins,
    new DefinePlugin(merge({}, GLOBALS, {'__SERVER__': false})),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'app',
      minChunks: Infinity
    }),
    ...(!DEBUG && [
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.UglifyJsPlugin({compress: {warnings: VERBOSE}}),
      new webpack.optimize.AggressiveMergingPlugin()
    ]),
    ...(WATCH && [
      new webpack.HotModuleReplacementPlugin()
    ])
  ],
  module: {
    noParse: [
      new RegExp('ionic.bundle.js'),
      new RegExp('leaflet-src.js'),
      new RegExp('photoswipe.js')
    ],
    loaders: [...config.module.loaders,
      {
        test: [/ionicons\.svg/, /ionicons\.eot/, /ionicons\.ttf/, /ionicons\.woff/],
        loader: 'file?name=fonts/[name].[ext]'
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loader: 'url?limit=10000&name=img/[hash:7].[ext]!image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false'

      }, {
        test: /\.css$/,
        loader: `style!${CSS_LOADER}`
      }, {
        test: /\.scss$/,
        loader: `style!${CSS_LOADER}!sass`
      }, {
        test: /\.json$/,
        loader: 'json'
      }, {
        test: /\.html$/,
        loader: "ngtemplate?module=templates&relativeTo=" + (path.resolve(__dirname, '../src/') + "!html")
      }
    ]
  }
});

//
// Configuration for the server-side bundle (server.js)
// -----------------------------------------------------------------------------

let nodeModules = {};
fs.readdirSync('node_modules')
  .filter(function (x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function (mod) {
    nodeModules[mod] = mod;
  });

const serverConfig = merge({}, config, {
  entry: './src/server.js',
  output: {
    path: './build',
    filename: 'server.js',
    libraryTarget: 'commonjs2'
  },
  target: 'node',
  externals: nodeModules,
  /*externals: [
   function (context, request, cb) {
   var isExternal =
   request.match(/^[a-z][a-z\/\.\-0-9]*$/i) &&
   !request.match(/^google-auth-library/) &&
   !context.match(/[\\/]google-auth-library/);
   cb(null, Boolean(isExternal));
   }
   ],*/
  node: {
    console: false,
    global: false,
    process: false,
    Buffer: false,
    __filename: false,
    __dirname: false
  },
  devtool: DEBUG ? 'source-map' : 'cheap-module-source-map',
  plugins: [
    ...config.plugins,
    new DefinePlugin(merge({}, GLOBALS, {'__SERVER__': true})),
    new BannerPlugin('require("source-map-support").install();',
      {raw: true, entryOnly: false})
  ],
  module: {
    loaders: [...config.module.loaders, {
      test: /\.css$/,
      loader: `${CSS_LOADER}!postcss-loader`
    }]
  }
});

let resultConfig = SERVER ? [serverConfig] : [appConfig, serverConfig];

export default resultConfig;
