import Please from 'pleasejs';
class AboutCtrl {
  /*@ngInject*/
  constructor($interval) {
    function hexToRgb(hex, alpha) {
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      var toString = function () {
        if (this.alpha == undefined) {
          return "rgb(" + this.r + ", " + this.g + ", " + this.b + ")";
        }
        if (this.alpha > 1) {
          this.alpha = 1;
        } else if (this.alpha < 0) {
          this.alpha = 0;
        }
        return "rgba(" + this.r + ", " + this.g + ", " + this.b + ", " + this.alpha + ")";
      };
      if (alpha == undefined) {
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
          toString: toString
        } : null;
      }
      if (alpha > 1) {
        alpha = 1;
      } else if (alpha < 0) {
        alpha = 0;
      }
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        alpha: alpha,
        toString: toString
      } : null;
    }

    var stop = $interval(function () {
      color_cycle();

    }, 3000);

    var color_cycle = function () {
      try {
        var e = document.getElementById("aboutMeIntro").getElementsByTagName("span");
        var bg = document.getElementById("aboutMeIntro");
        for (var n = e.length - 1; n >= 0; n--) {
          e[n].style.color = Please.make_color({saturation: .7, value: .7});
        }
        var color = Please.make_color({saturation: .7, value: .7});
        color = hexToRgb(color, 0.3);
        bg.style.backgroundColor = color;
      } catch (error) {
//            console.log(error);
        if (angular.isDefined(stop)) {
          $interval.cancel(stop);
          stop = undefined;
        }
      }

    };
    color_cycle();
  }

}

export default AboutCtrl;
