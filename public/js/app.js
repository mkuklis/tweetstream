var markerImg = '/img/marker.png';
var socket = new io.Socket();

socket.connect(); 

socket.on('connect', function(){ 
  socket.send('hello'); 
});
 
socket.on('message', function(tweet) {
  if (tweet.geo) {
    var addMarkerOptions = {
      action: 'addMarker',
      lat: tweet.geo.coordinates[0],
      lng: tweet.geo.coordinates[1],           
      marker: {
        options: {
          icon:new google.maps.MarkerImage(markerImg)
        }
      }
    };
    
    $("#map").gmap3(addMarkerOptions); 

    var o = new google.maps.LatLng(tweet.geo.coordinates[0], tweet.geo.coordinates[1]);
    $("#map").gmap3({
      action:'panTo',
      args:[o]
    });

    setTimeout(function() {
      $('img[src="' + markerImg + '"]').qtip("hide");
      $('img[src="' + markerImg + '"]').last().qtip({
        content: {
          text: '<img style="width:32px; border: 1px solid #eee; float:left; padding:3px; margin-right:3px;" src="' + tweet.user.profile_image_url + '" />' + tweet.text,
          title: {
            text: '',
            button: false
          }
        },
        position: {
          my: 'bottom center',
          at: 'top center'
        },
        show: {
          ready: true
        },
        style: {
          classes: 'ui-tooltip-shadow ui-tooltip-light' 
        }
      });
    }, 500);
  }
});

socket.on('disconnect', function(){
  // goodbye
});
