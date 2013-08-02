/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    http = require('http'),
    path = require('path'),
    report = require('./routes/report'),
    mongoose = require('mongoose');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// Create http server
var httpServer = http.createServer(app);

// Connect mongodb
mongoose.connect('mongodb://admin:123qwe@ds037518.mongolab.com:37518/heatmap');

// Create model
var Coordinate = mongoose.model('Coordinate', {
    x: Number,
    y: Number
});

// prepare socket.io
var io = require('socket.io').listen(httpServer);

app.get('/', routes.index);
app.get('/report', report.show);

io.sockets.on('connection', function(socket) {
    // Listen clicks
    socket.on('CLICKED', function(data) {
        if (data) {
            new Coordinate(data).save();
            io.sockets.emit('UPDATE', data);
        }
    });
});

app.get('/report/get', function(req, res){
    res.writeHead(200, {
        'Content-Type': 'text/json'
    });

    var response = {
        coordinates: []
    };

    mongoose.model('Coordinate').find({}, function(err, item) {
        item.forEach(function(i) {
            response.coordinates.push(i);
        });

        res.end(JSON.stringify(response));
    });
});

httpServer.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});





