#TweetStream
A live twitter stream integrated with google maps based on [Node.js](http://nodejs.org).

The project is an attempt to connect a few cool libs/tools together: 

Server:

* [Node.js](http://nodejs.org)
* [Express](http://expressjs.com) - node web framework
* [socket.io](http://socket.io/) - making realtime apps possible
* [twitter-node](https://github.com/technoweenie/twitter-node) - streaming connection with twitter

Client:

* [Backbone.js](http://documentcloud.github.com/backbone/)
* [gmap3](http://gmap3.net/)

## Installation

Set username and password for your twitter account in config/config.js
In order to run it make sure you have [Node.js](http://nodejs.org) and [npm](http://npmjs.org/) installed first.

    $ npm bundle
    $ node ./server.js

## Demo

[http://tweetstream.cloudfoundry.com](http://tweetstream.cloudfoundry.com/)


## License 

(The MIT License)

Copyright (c) 2011 Michal Kuklis &lt;michal.kuklis@gmail.com&gt;


