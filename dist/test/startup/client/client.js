'use strict';

var socket = io('http://localhost:3001', {
    path: '/stateServer'
});

socket.on('connect', function () {
    $('#msg').append('已连接服务器' + '</br>');
});

function appendServerMsg(name, obj) {
    $('#msg').append(name + ':        ' + JSON.stringify(obj) + '</br>');
}

var evts = ['init', 'update'];

var _loop = function _loop() {
    var evti = evts[i];
    socket.on(evti, function (evt) {
        appendServerMsg(evti, evt);
    });
};

for (var i = 0; i < evts.length; i++) {
    _loop();
}
//# sourceMappingURL=client.js.map