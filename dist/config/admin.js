'use strict';

/*
* @ author sessionboy 
* @ github https://github.com/sessionboy
* @ website http://sinn.boyagirl.com
* @ use 后台默认管理员账户配置
* @ tip 密码需要md5加密，如需修改密码，请按照格式: md5(密码)
*/
var md5 = require('md5');
module.exports = {
	name: 'admin',
	password: md5('admin')
};
//# sourceMappingURL=admin.js.map