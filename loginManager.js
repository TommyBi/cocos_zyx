// 登录验证的服务器业务
const express = require('express');
const axios = require('axios');

function loginAction(code) {
    // 发送一个https请求，并解析返回的结果
    const appid = 'wxdc39c78bfd045896';
    const secret = '20143ade40e34618654a725a755d345d';
    axios.get(`https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`)
        .then(res => {
            console.log(res.data);
            return res.data;
        })
        .catch(err => {
            console.log(err);
        });
}

module.exports = {
    loginAction: loginAction,
}