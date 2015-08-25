import style from './album.scss';
import AlbumCtrl from './controllers/AlbumCtrl';
import onLoadErr from './directives/onLoadErr';
import template from './partials/album.html';

export default angular.module('album', [])
  .directive('onLoadErr', onLoadErr)
  .controller('AlbumCtrl', AlbumCtrl)
  .config([
    '$stateProvider',
    '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {

      $urlRouterProvider

        .when('/album/', '/album');

      $stateProvider

        .state('app.album', {
          url: "/album",
          views: {
            'menuContent': {
              templateUrl: template,
              controller: "AlbumCtrl as vm"
            }
          }
        })
    }])
  .name;
