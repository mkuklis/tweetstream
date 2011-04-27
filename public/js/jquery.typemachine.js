/**
 * typemachine - Simple jQuery plugin which simulates live typing.
 *
 * Copyright(c) 2011 Michal Kuklis <michal.kuklis@gmail.com>
 * MIT Licensed
 */

(function($){
  $.fn.typemachine = function(options) {
    // default settings
    var settings = {
      text: "",
      speed: 20
    };
      
    return this.each(function() {
      if (options) {
        $.extend(settings, options);
      }

      var that = this,
        i = 0,
        l = settings.text.length;
        
      // reset current text
      $(this).text('');
      var interval = setInterval(function() {
        if (i < l) {
          $(that).append(settings.text[i++]);
        }
        else {
          clearInterval(interval);
          // execute after callback if given
          options.afterCallback && options.afterCallback($(that), settings.text);
        }
      }, settings.speed);
    });
  }
})(jQuery);
