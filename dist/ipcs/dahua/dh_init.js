'use strict';

/**
 * Created by Luky on 2017/7/1.
 */
var dhlib = require('./dhnetsdk');

var ok = dhlib.functions.CLIENT_Init(dhlib.callbacks.fDisConnect(function (loginid, string, port, dwuser) {
   dhlib.emit('disconnect', loginid, string, port, dwuser);
}), 0);

if (ok) {
   dhlib.functions.CLIENT_SetAutoReconnect(dhlib.callbacks.fHaveReConnect(function (loginid, string, port, dwuser) {
      dhlib.emit('reconnected', loginid, string, port, dwuser);
   }), 0);
}

process.on('exit', function () {
   dhlib.functions.CLIENT_Cleanup();
});

exports = module.exports = ok;
//# sourceMappingURL=dh_init.js.map