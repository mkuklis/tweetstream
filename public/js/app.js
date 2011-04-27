// TweetStream 
(function() {

  // TweetStream namespce
  var TweetStream = this.TweetStream = {};

  // entry TweetSteam point
  TweetStream.init = function(options) {
    // setup socket.io
    var socket = new io.Socket()
      , tweets = new Tweets()
      , mapView = new MapView({collection: tweets, center: options.center});
    
    // bind to message to listen for incoming tweets
    socket.on('message', function(tweet) {
      // check if tweet has associated geo object
      if (tweet.geo) {
        tweets.add(tweet);
      }
    });

    // connect to socket
    socket.connect();
  };

  // Tweet model
  var Tweet = Backbone.Model.extend({
    collection: Tweets,

    // few helpers based on http://www.simonwhatley.co.uk/examples/twitter/prototype/
    parseURL: function(text) {
      return text.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&\?\/.=]+/g, function(url) {
        return url.link(url);
      });
    },

    parseUsername: function(text) {
      return text.replace(/[@]+[A-Za-z0-9-_]+/g, function(u) {
        var username = u.replace("@","")
        return u.link("http://twitter.com/" + username);
      });
    },

    parseHashtag: function(text) {
      return text.replace(/[#]+[A-Za-z0-9-_]+/g, function(t) {
        var tag = t.replace("#","%23")
        return t.link("http://search.twitter.com/search?q=" + tag);
      });
    },

    linkify: function() {
      return this.parseHashtag(this.parseUsername(this.parseURL(this.get('text'))));
    }
  });

  // Tweets collection
  var Tweets = Backbone.Collection.extend({
    model: Tweet
  });

  // map view
  var MapView = Backbone.View.extend({
    // consts
    MARKER_IMAGE: '/img/marker.png',
    QTIP_TEXT_TEMPLATE: '<img src="<%= image %>" /><a href="http://twitter.com/<%=name%>">@<%=name%><a/><br /><div class="ui-tooltip-text"></div>',
    
    el: $("#map"),
    initialize: function() {
      _.bindAll(this, 'renderMarker', 'showTip');
      this.collection.bind('add', _.debounce(this.renderMarker, 2000));
      
      // init google map
      this.el.gmap3({
        action: 'init',
        zoom: 12,
        center: this.options.center || [40.75931801, -73.96893024]
      });
    },
    
    // renders new marker to map
    renderMarker: function(tweet) {
      var coords = tweet.get('geo').coordinates
        , latLng = new google.maps.LatLng(coords[0], coords[1]);
      
      var addMarkerOptions = {
        action: 'addMarker',
        latLng: latLng,          
        marker: {
          options: {
            icon: new google.maps.MarkerImage(this.MARKER_IMAGE)
          }
        }
      };
      
      var paneToOptions = {
        action:'panTo',
        args:[latLng]
      };

      // hide tips
      $('img[src="' + this.MARKER_IMAGE + '"]', this.el).qtip("hide");
      
      // render marker on the map
      this.el.gmap3(addMarkerOptions, paneToOptions);
      this.showTip(tweet);
    },

    // shows tooltip over marker
    showTip: function(tweet) {
      var self = this
        , user = tweet.get('user');

      // wait for marker to render
      setTimeout(function() {
        // qtip options
        var options = {
          content: {
            text: _.template(self.QTIP_TEXT_TEMPLATE)({image: user.profile_image_url, name: user.screen_name}),
            title: { text: '', button: false }
          },
          position: { my: 'bottom center', at: 'top center' },
          show: { ready: true, effect: { type: 'fade', length: 0 } },
          hide: { fixed: true, delay: 300 },
          style: { classes: 'ui-tooltip-shadow ui-tooltip-light' }
        };
        
        $('img[src="' + self.MARKER_IMAGE + '"]', this.el).last().qtip(options);
       
        // wait for qtip to render
        setTimeout(function() {
          $('div.ui-tooltip-text:visible', this.el).typemachine({
            text: tweet.get('text'), 
            afterCallback: function(el, text) {
              el.html(tweet.linkify());
            }
          });
        }, 300);
      }, 500); 
    }
  });
})();
