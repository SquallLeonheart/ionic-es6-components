export default /*@ngInject*/ function ($parse) {
  return {
    restrict: 'A',
    link: function (scope, el, attr) {

      el.on('error', function () {
        $parse(attr.onLoadErr)(scope);
      });
    }
  };
};
