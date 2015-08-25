import style from './menu.scss';
import template from './partials/menu.html';

export default angular.module('menu', [])
  .config(function ($stateProvider) {
    $stateProvider
      .state('app', {
        url: "",
        abstract: true,
        templateUrl: template
      })

    ;


  })
  .name;

