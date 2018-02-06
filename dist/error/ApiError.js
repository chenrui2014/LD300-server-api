'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ApiErrorNames = require('./ApiErrorNames');

/**
 * 自定义Api异常
 */

var ApiError = function (_Error) {
    _inherits(ApiError, _Error);

    //构造方法
    function ApiError(error_name) {
        _classCallCheck(this, ApiError);

        var _this = _possibleConstructorReturn(this, (ApiError.__proto__ || Object.getPrototypeOf(ApiError)).call(this));

        var error_info = ApiErrorNames.getErrorInfo(error_name);

        _this.name = error_name;
        _this.code = error_info.code;
        _this.message = error_info.message;
        return _this;
    }

    return ApiError;
}(Error);

module.exports = ApiError;
//# sourceMappingURL=ApiError.js.map