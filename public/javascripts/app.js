(function() {
    var pathName = window.location.pathname,
        socket = io.connect('http://localhost');

    if (pathName == '/report') {

        var $heatMapArea = $('#heatMapArea');
        var config = {
            'radius': 30,
            'element': $heatMapArea[0],
            'opacity': 50
        };

        var heatMap = window.heatmapFactory.create(config);

        $.get('/report/get', function(response) {
            if (response && response.coordinates) {
                response.coordinates.forEach(function(item) {
                    heatMap.store.addDataPoint(item.x, item.y, 1);
                });
            }
        });

        socket.on('UPDATE', function(data) {
            heatMap.store.addDataPoint(data.x, data.y, 1);
        });

    } else if (pathName == '/' || !pathName) {
        var $photo = $('#photo');
        $photo.bind('mousemove', function(e) {
            var data = {
                x: e.clientX,
                y: e.clientY
            };

            socket.emit('CLICKED', data);
        });
    }
})();