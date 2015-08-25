import style from './about.scss';
import AboutCtrl from './controllers/AboutCtrl';
import template from './partials/about.html';

export default angular.module('about', [])
  .config(function routing($stateProvider, $urlRouterProvider) {

    $urlRouterProvider

      .when('/about/', '/about');

    $stateProvider

      .state('app.about', {
        url: "/about",
        views: {
          'menuContent': {
            templateUrl: template,
            controller: 'AboutCtrl as vm'
          }
        }
      });
  })
  .controller('AboutCtrl', AboutCtrl)
  .name;
