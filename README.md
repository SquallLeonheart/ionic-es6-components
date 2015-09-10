# Ionic ES6 Components

> Starter kit for developing extendable & detachable [ES6](https://git.io/es6features) 
> components featuring [Cordova](https://cordova.apache.org/) platform,
> [Angular](https://angularjs.org) /
> [Ionic](https://github.com/driftyco/ionic/) framework,
> [Node.js](https://nodejs.org/) / [Express](http://expressjs.com/) server
> [Babel](http://babeljs.io/), [BrowserSync](http://www.browsersync.io/)
> and [Webpack](http://webpack.github.io/).

Demo: http://ionic-es6-components.wayfusion.com/

You can quickly bootstrap your Cordova/Ionic/Angular development by using the application 
as a boilerplate example. The application communicates with Google 
API via an Node.js server I deployed to Heroku.

## Quickstart

Clone the repository and install dependencies

```shell
$ git clone https://github.com/sergkhl/ionic-es6-components.git MyApp
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

## Components
### Tracker
[Server Map API](./src/api/map.js) uses Google Drive API to store tracks in [GeoJSON](https://en.wikipedia.org/wiki/GeoJSON) format.
Here is [guide to enable drive API.](https://developers.google.com/drive/web/quickstart/nodejs#step_1_enable_the_api_name)
Place resulting client_secret.json into src/config/gdrive/ directory. Run server and follow instructions in console.
