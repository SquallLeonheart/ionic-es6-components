import PhotoSwipe from 'photoswipe';
import PhotoSwipeUI_Default from 'photoswipe/dist/photoswipe-ui-default';
import 'photoswipe/dist/photoswipe.css';
import 'photoswipe/dist/default-skin/default-skin.css';

export default class AlbumCtrl {
  /*@ngInject*/
  constructor($http, $scope) {
    var vm = this;
    vm.data = {
      pics: []
    };

    vm.controls = {
      navBar: {
        active: true
      }
    };

    vm.removePic = function (index) {
      vm.data.pics.splice(index, 1);
      $scope.$apply();
    };

    vm.openPhotoSwipe = initGallery;

    function initGallery(index, event, disableAnimation) {
      var pswpElement = document.querySelectorAll('.pswp')[0],
        gallery,
        options;

      // define options (if needed)
      options = {
        index: index,
        bgOpacity: 0.9,
        //barsSize: {top:100, bottom: 0},

        // define gallery index (for URL)
        //galleryUID: galleryElement.getAttribute('data-pswp-uid'),

        getThumbBoundsFn: function (index) {
          // See Options -> getThumbBoundsFn section of docs for more info
          var el = document.querySelector('.thumb-grid.group').getElementsByTagName('img')[index];

          var thumbnail = el, // find thumbnail
            pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
            rect = thumbnail.getBoundingClientRect();

          return {x: rect.left, y: rect.top + pageYScroll, w: rect.width};
        },


        // Share buttons
        //
        // Available variables for URL:
        // {{url}}             - url to current page
        // {{text}}            - title
        // {{image_url}}       - encoded image url
        // {{raw_image_url}}   - raw image url
        shareButtons: [
          {id:'facebook', label:'Share on Facebook', url:'https://www.facebook.com/sharer/sharer.php?u={{url}}'},
          {id:'twitter', label:'Tweet', url:'https://twitter.com/intent/tweet?text={{text}}&url={{url}}'},
          {id:'pinterest', label:'Pin it', url:'http://www.pinterest.com/pin/create/button/?url={{url}}&media={{image_url}}&description={{text}}'},
          {id:'download', label:'Download image', url:'{{raw_image_url}}', download:true}
        ],
        getImageURLForShare: function (shareButtonData) {
          // `shareButtonData` - object from shareButtons array
          //
          // `pswp` is the gallery instance object,
          // you should define it by yourself
          //
          //console.log('gallery:', gallery);
          return gallery.currItem.originalImage.src || '';
        },

        // history & focus options are disabled on CodePen
        // remove these lines in real life:
        history: false,
        focus: false
        //backButtonHideEnabled: false

      };

      gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, vm.data.pics, options);

      // create variable that will store real size of viewport
      var realViewportWidth,
        useLargeImages = false,
        firstResize = true,
        imageSrcWillChange;

      // beforeResize event fires each time size of gallery viewport updates
      gallery.listen('beforeResize', function () {
        vm.controls.navBar.active = false;
        // gallery.viewportSize.x - width of PhotoSwipe viewport
        // gallery.viewportSize.y - height of PhotoSwipe viewport
        // window.devicePixelRatio - ratio between physical pixels and device independent pixels (Number)
        //                          1 (regular display), 2 (@2x, retina) ...


        // calculate real pixels when size changes
        realViewportWidth = gallery.viewportSize.x * window.devicePixelRatio;

        // Code below is needed if you want image to switch dynamically on window.resize

        // Find out if current images need to be changed
        if (useLargeImages && realViewportWidth < 600) {
          useLargeImages = false;
          imageSrcWillChange = true;
        } else if (!useLargeImages && realViewportWidth >= 600) {
          useLargeImages = true;
          imageSrcWillChange = true;
        }

        // Invalidate items only when source is changed and when it's not the first update
        if (imageSrcWillChange && !firstResize) {
          // invalidateCurrItems sets a flag on slides that are in DOM,
          // which will force update of content (image) on window.resize.
          gallery.invalidateCurrItems();
        }

        if (firstResize) {
          firstResize = false;
        }

        imageSrcWillChange = false;

      });

      gallery.listen('close', function () {
        vm.controls.navBar.active = true;
        $scope.$apply();
      });


      // gettingData event fires each time PhotoSwipe retrieves image source & size
      gallery.listen('gettingData', function (index, item) {

        // Set image source & size based on real viewport width
        if (useLargeImages) {
          item.src = item.originalImage.src;
          item.w = item.originalImage.w;
          item.h = item.originalImage.h;
        } else {
          item.src = item.mediumImage.src;
          item.w = item.mediumImage.w;
          item.h = item.mediumImage.h;
        }


        // It doesn't really matter what will you do here,
        // as long as item.src, item.w and item.h have valid values.
        //
        // Just avoid http requests in this listener, as it fires quite often

      });


      gallery.init();
    }

    var reqUrl = 'https://ajax.googleapis.com/ajax/services/search/images?v=1.0&q=programming%20idea&rsz=8&start=8&callback=JSON_CALLBACK';
    $http.jsonp(reqUrl)
      .success(function (data) {
        var pics = [];

        // add HTML
        //pics.push({
        //    html: '<div><video width="320" height="240" controls><source src="movie.mp4" type="video/mp4"><source src="movie.ogg" type="video/ogg"></video></div>'
        //});
        data.responseData.results.forEach(function (item) {
          pics.push({
            originalImage: {
              title: item.titleNoFormatting,
              src: item.url,
              w: parseInt(item.width, 10),
              h: parseInt(item.height, 10)
            },
            mediumImage: {
              title: item.titleNoFormatting,
              src: item.tbUrl,
              w: parseInt(item.tbWidth, 10),
              h: parseInt(item.tbHeight, 10)
            }

          })
        });
        console.log('data:', data);
        vm.data.pics = pics;

      });
  }
}
