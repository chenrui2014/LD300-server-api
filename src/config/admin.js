/*
* @ author sessionboy 
* @ github https://github.com/sessionboy
* @ website http://sinn.boyagirl.com
* @ use 后台默认管理员账户配置
* @ tip 密码需要md5加密，如需修改密码，请按照格式: md5(密码)
*/ 
const md5 = require('md5');
module.exports = [{
	name: 'admin',
    role: 'admin',
	password: md5('admin')
},{
    name: 'superAdmin',
    role: 'superAdmin',
    password: md5('adld123456')
},{
    name: 'test',
    role: 'test',
    password: md5('test')
}];