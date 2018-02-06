'use strict';

/**
 * Created by Luky on 2017/10/25.
 */

var _ = require('lodash');
var interfaces = [];
interfaces.push({ project: 'RongFei-YiLiPrison', interface: require('./RongFei/i_rong_fei') });

function getInterface(project) {
    var i = _.find(interfaces, { project: project });
    if (!i) return null;
    return new i.interface();
}
exports = module.exports = {
    getInterface: getInterface
};
//# sourceMappingURL=addin.js.map