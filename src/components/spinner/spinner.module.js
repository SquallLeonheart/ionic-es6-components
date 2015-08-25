export default angular.module('spinner', [])
  .config(function ($httpProvider) {
    //loading animation while active requests
    $httpProvider.interceptors.push(function ($rootScope, $q) {
      var numRequests = 0;

      return {
        request: function (config) {
          numRequests++;
          // Show loader
          $rootScope.$broadcast("loader:show");
          return config || $q.when(config);
        },
        response: function (response) {
          if ((--numRequests) === 0) {
            // Hide loader
            $rootScope.$broadcast("loader:hide");
          }
          return response || $q.when(response);
        },
        responseError: function (response) {
          if (!(--numRequests)) {
            // Hide loader
            $rootScope.$broadcast("loader:hide");
          }
          return $q.reject(response);
        }
      };
    })
  })

  .run(function ($rootScope, $ionicLoading) {
    $rootScope.$on('loader:show', function () {
      $ionicLoading.show({
        content: 'Loading Data',
        animation: 'slide-in-up',
        showBackdrop: false,
        maxWidth: 200,
        showDelay: 1100
      });
    });

    $rootScope.$on('loader:hide', function () {
      $ionicLoading.hide()
    });
  })
  .name;
