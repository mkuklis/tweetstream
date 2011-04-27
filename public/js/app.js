// TweetStream 
(function() {

  // simple event based queue implementation
  // based on JavaScript array
  var Queue = function() {
    this.queue = [];
  }

  // give Queue some events
  _.extend(Queue.prototype, Backbone.Events, {
    model: Backbone.Model,
    
    enqueue: function(model) {
      if (!(model instanceof Backbone.Model)) {
        model = new this.model(model);
      }

      this.queue.push(model);
      this.trigger('enqueue', model);
    },

    dequeue: function() {
      var model = null;
      if (this.queue.length > 0) {
        model = this.queue.shift();
        this.trigger('dequeue', model);
      }
      return null;
    }
  });
  
  // add extend to Queue
  Queue.extend = Backbone.Model.extend;

  // TweetStream namespce
  var TweetStream = this.TweetStream = {};

  // entry TweetSteam point
  TweetStream.init = function(options) {
    // setup socket.io
    var socket = new io.Socket()
      , tweets = new Tweets()
      , mapView = new MapView({queue: tweets, center: options.center});

    socket.on('connect', function() {
       socket.send('hello'); 
    });
    
    // bind to message to listen for incoming tweets
    socket.on('message', function(tweet) {
      // check if tweet has associated geo object
      if (tweet.geo) {
        tweets.enqueue(tweet);
      }
    });

    // internal loop which dequeues element
    // from the queue
    setInterval(function() {
      tweets.dequeue();
    }, 5000);

    // connect to socket
    socket.connect();
  };

  // Tweet model
  var Tweet = Backbone.Model.extend({
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

  // Tweets queue
  var Tweets = Queue.extend({
    model: Tweet
  });

  // map view
  var MapView = Backbone.View.extend({
    // consts
    MARKER_IMAGE: '/img/marker.png',
    QTIP_TEXT_TEMPLATE: '<img src="<%= image %>" /><a target="_blank" href="http://twitter.com/<%=name%>">@<%=name%><a/><br /><div class="ui-tooltip-text"></div>',
    
    el: $("#map"),
    initialize: function() {
      _.bindAll(this, 'renderMarker', 'showTip');

      this.queue = this.options.queue;      
      this.queue.bind('dequeue', this.renderMarker, 2000);

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
    // TODO: refactor
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
            afterCallback: function(text) {
              $(this).html(tweet.linkify());
            }
          });
        }, 500);
      }, 500); 
    }
  });
})();
