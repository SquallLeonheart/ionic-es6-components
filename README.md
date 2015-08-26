# Ionic ES6 Components

> Starter kit for developing extendable & detachable [ES6](https://git.io/es6features) 
> components featuring [Cordova](https://cordova.apache.org/) platform,
> [Angular](https://angularjs.org) /
> [Ionic](https://github.com/driftyco/ionic/) framework,
> [Node.js](https://nodejs.org/) / [Express](http://expressjs.com/) server
> [Babel](http://babeljs.io/), [BrowserSync](http://www.browsersync.io/)
> and [Webpack](http://webpack.github.io/).

Demo: http://ionic-es6-components.us.to/

## Quickstart

Clone the repository and install dependencies

```shell
$ git clone https://github.com/SquallLeonheart/ionic-es6-components.git MyApp
$ cd MyApp
$ npm install
```

Adding Cordova Platforms

```shell
$ cordova platform add android
# and (or)
$ cordova platform add ios
```

Adding Cordova Plugins

```shell
$ cordova plugin add cordova-plugin-whitelist cordova-plugin-geolocation
```

Build and Run

```shell
##Build
$ npm run build
##Run
# Web
$ npm start
# Android
$ cordova run android
# iOS
$ cordova run ios
# or
$ cordova run ios --device
```
