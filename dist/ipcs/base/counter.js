"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by Luky on 2017/11/08.
 */

var Counter = function () {
    function Counter() {
        _classCallCheck(this, Counter);

        this.ref = 0;
    }

    _createClass(Counter, [{
        key: "addReference",
        value: function addReference() {
            return ++this.ref;
        }
    }, {
        key: "release",
        value: function release() {
            this.ref = Math.max(0, this.ref - 1);
            return this.ref === 0;
        }
    }, {
        key: "inReference",
        get: function get() {
            return 0 !== this.ref;
        }
    }, {
        key: "count",
        get: function get() {
            return this.ref;
        }
    }]);

    return Counter;
}();

exports = module.exports = Counter;
//# sourceMappingURL=counter.js.map