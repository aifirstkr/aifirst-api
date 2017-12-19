// Generated by CoffeeScript 2.1.0
(function() {
  'use strict';
  var auth, express, nodemailer, otpGen, tms;

  express = require('express');

  tms = require('../helper/tms');

  nodemailer = require('nodemailer');

  otpGen = require('../helper/otp');

  auth = express.Router();

  //#####################################################################
  // SPECIAL API
  //#####################################################################
  auth.post('/signup', async function(req, res) {
    var err, param, sql, user;
    if (!req.body.email) {
      return res.status(400).json({
        data: RCODE.INVALID_PARAMS
      });
    }
    if (!req.body.password) {
      return res.status(400).json({
        data: RCODE.INVALID_PARAMS
      });
    }
    if (!req.body.userName) {
      return res.status(400).json({
        data: RCODE.INVALID_PARAMS
      });
    }
    if (!req.body.otp) {
      return res.status(400).json({
        data: RCODE.INVALID_PARAMS
      });
    }
    try {
      sql = 'select * from user where email = ?';
      param = [req.body.email];
      user = (await pool.query(sql, param));
      if (user.length > 0) {
        return res.status(400).json({
          data: RCODE.EMAIL_EXISTS
        });
      }
      sql = 'insert into user set ?';
      param = {
        email: req.body.email,
        password: req.body.password,
        userName: req.body.userName
      };
      await pool.query(sql, param);
      sql = 'select * from user where email = ?';
      param = [req.body.email];
      user = (await pool.query(sql, param));
      return res.json({
        data: user[0]
      });
    } catch (error) {
      err = error;
      log('err=', err);
      return res.status(500).json({
        data: RCODE.SERVER_ERROR
      });
    }
  });

  auth.post('/login', async function(req, res) {
    var err, param, payload, sql, token, uclass, user;
    if (!req.body.email) {
      return res.status(400).json({
        data: RCODE.INVALID_PARAMS
      });
    }
    if (!req.body.password) {
      return res.status(400).json({
        data: RCODE.INVALID_PARAMS
      });
    }
    try {
      // check user info
      sql = 'select * from user where email = ? and password = ? and isRemoved = false';
      param = [req.body.email, req.body.password];
      user = (await pool.query(sql, param));
      if (user.length < 1) {
        return res.status(400).json({
          data: RCODE.INVALID_LOGIN_INFO
        });
      }
      sql = 'select count(*) as uclass from channel where channelID = "admin" and  JSON_CONTAINS(manager, ?)';
      param = JSON.stringify({
        manager: req.body.email
      });
      uclass = (await pool.query(sql, param));
      if (uclass.length > 0) {
        uclass = 'ADMIN';
      } else {
        uclass = 'USER';
      }
      payload = {
        email: user[0].email,
        userName: user[0].userName,
        uclass: uclass
      };
      token = tms.jwt.sign(payload, TOKEN.SECRET, {
        expiresIn: TOKEN.EXPIRE_SEC
      });
      if (!token) {
        return res.status(500).json({
          data: RCODE.SERVER_ERROR
        });
      }
      return res.json({
        data: token
      });
    } catch (error) {
      err = error;
      log('err=', err);
      return res.status(500).json({
        data: RCODE.SERVER_ERROR
      });
    }
  });

  auth.post('/logout', tms.verifyToken);

  auth.post('/logout', function(req, res) {
    tms.addBlacklist(req.token);
    delete req.token;
    return res.json({
      data: RCODE.LOGOUT_SUCCEED
    });
  });

  auth.get('/me', tms.verifyToken);

  auth.get('/me', function(req, res) {
    return res.json({
      data: req.token
    });
  });

  auth.put('/me', tms.verifyToken);

  auth.put('/me', async function(req, res) {
    var err, param, payload, sets, sql, token, user;
    try {
      sql = 'select * from user where email=? and isRemoved=false';
      param = [req.token.email];
      user = (await pool.query(sql, param));
      if (user.length < 1) {
        return res.status(400).json({
          data: RCODE.INVALID_TOKEN
        });
      }
      sets = {};
      if (req.body.password) {
        sets.password = req.body.password;
      }
      if (req.body.userName) {
        sets.userName = req.body.userName;
      }
      if (req.body.mobile) {
        sets.mobile = req.body.mobile;
      }
      if (req.body.channel) {
        sets.channel = req.body.channel;
      }
      if (req.body.photo) {
        sets.photo = req.body.photo;
      }
      if (req.body.bizName) {
        sets.bizName = req.body.bizName;
      }
      if (req.body.bizRegCode) {
        sets.bizRegCode = req.body.bizRegCode;
      }
      if (req.body.bizPhone) {
        sets.bizPhone = req.body.bizPhone;
      }
      if (JSON.stringify(sets === '{}')) {
        return res.status(400).json({
          data: RCODE.INVALID_PARAMS
        });
      }
      sql = 'update user set ? where email=?';
      param = [sets, req.token.email];
      await pool.query(sql, param);
      sql = 'select * from user where email=?';
      param = [req.token.email];
      user = (await pool.query(sql, param));
      payload = {
        email: user[0].email,
        userName: user[0].userName
      };
      token = tms.jwt.sign(payload, TOKEN.SECRET, {
        expiresIn: TOKEN.EXPIRE_SEC
      });
      if (!token) {
        return res.status(500).json({
          data: RCODE.SERVER_ERROR
        });
      }
      tms.addBlacklist(req.token);
      delete req.token;
      return res.json({
        data: token
      });
    } catch (error) {
      err = error;
      log('err=', err);
      return res.status(500).json({
        data: RCODE.SERVER_ERROR
      });
    }
  });

  auth.post('/leave', tms.verifyToken);

  auth.post('/leave', async function(req, res) {
    var err, param, sets, sql, user;
    if (!req.body.email) {
      return res.status(400).json({
        data: RCODE.INVALID_PARAMS
      });
    }
    if (!req.body.password) {
      return res.status(400).json({
        data: RCODE.INVALID_PARAMS
      });
    }
    try {
      sql = 'select * from email=? and password=? isRemoved=false';
      param = [req.body.email, req.body.password];
      user = (await pool.query(sql, param));
      if (user.length < 1) {
        return res.status(400).json({
          data: RCODE.INVALID_USER_INFO
        });
      }
      sets = {};
      sets.isRemoved = true;
      sets.removedAt = new Date();
      sql = 'update user set ? where email=?';
      param = [sets, req.token.email];
      await pool.query(sql, param);
      return res.json({
        data: RCODE.OPERATION_SUCCEED
      });
    } catch (error) {
      err = error;
      log('err=', err);
      return res.status(500).json({
        data: RCODE.SERVER_ERROR
      });
    }
  });

  auth.post('/sendOtpEmail', async function(req, res) {
    var config, err, message, otp, transport;
    if (!req.body.email) {
      return res.status(400).json({
        data: RCODE.INVALID_PARAMS
      });
    }
    try {
      otp = otpGen.makeOtp();
      config = {
        host: SMTP.HOST,
        port: SMTP.PORT,
        secure: true,
        auth: {
          user: SMTP.EMAIL,
          pass: SMTP.PASSWORD
        }
      };
      transport = nodemailer.createTransport(config);
      message = {
        from: '인증확인 <noreply@aifirst.kr>',
        to: req.body.email,
        subject: '인증코드를 확인해 주세요.',
        html: `귀하의 인증코드는 <b style='color:red'>${otp.code}</b> 입니다.`
      };
      await transport.sendMail(message);
      redis.set(req.body.email, JSON.stringify(otp));
      redis.expire(req.body.email, otp.ttl);
      return res.json({
        data: RCODE.EMAIL_REQUEST_SUCCEED
      });
    } catch (error) {
      err = error;
      log('err=', err);
      return res.status(500).json({
        data: RCODE.SERVER_ERROR
      });
    }
  });

  module.exports = auth;

}).call(this);

//# sourceMappingURL=auth.js.map
