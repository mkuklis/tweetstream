var TwitterNode = require('twitter-node').TwitterNode
  , sys = require('sys')
  , express = require('express')
  , io = require('socket.io')
  , port = parseInt(process.env.VCAP_APP_PORT || 3000);
 
// express
var app = express.createServer();
app.register('.html', require('ejs'));
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.use(express.static(__dirname + '/public'));
  app.get('/', function(req, res) {
  res.render('tweets');
});
app.listen(port);

// socket.io 
var socket = io.listen(app); 
socket.on('connection', function(client){ 
  client.on('message', function(){
    console.log('connected');
  });
  client.on('disconnect', function(){}); 
});

// twitter node
var twit = new TwitterNode({
  user: 'tweetstreamnode', 
  password: '123qwe'
});

// follow tweets from NYC
twit.location(-74, 40, -73, 41)
twit.headers['User-Agent'] = 'whatever';

twit
  .addListener('error', function(error) {
    console.log(error.message);
  })
  .addListener('tweet', function(tweet) {
    socket.broadcast(tweet);
  })
  .stream();
