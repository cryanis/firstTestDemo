/*** 
  appjs ---入口文件(包括登录、注册、部分公用模块，插件加载)
  最近更改日期 --- 2018-3-1
***/

'use strict';

/******   token使用说明
	http://106.14.136.77:50523  -----中文baseurl
	Keys -> user token
	annie_usertoken_account -> 返回的userJson; 
	annie_usertoken_usermsg -> userkey; 
	annie_user_accountname -> 用户名; 
	annie_user_loginid -> 邮箱
******/

var baseUrl = 'http://106.14.136.77:50523',
	  Keys = $.cookie('annie_usertoken'),//Usertoken
		user_acname =  $.cookie('annie_user_accountname'),
		changekey = $.cookie("annie_usertoken_usermsg"),
		changeaccount = $.cookie('annie_usertoken_account');
function Doc () {
	// TODO 公共变量
	this.baseUrl = baseUrl;
	this.Keys = Keys;//Usertoken
	this.user_acname =  user_acname;
	this.changekey = changekey;
	this.changeaccount = changeaccount;
}

Doc.prototype = {
	addUser: function(Obj){
    // addUser TODO 添加用户
		let urlAjax = this.baseUrl + '/api/Accounts/create';
    $.ajax({
        url: urlAjax,
        type: "POST",
        data: {
            "Key": Obj.Key,
            "LoginId": Obj.LoginId,
            "Email": Obj.LoginId,
            "Password": Obj.Password,
            "RoleName":"User",
            "ConfirmPassword":Obj.Password,
            "Address": null,
            "City": null,
            "State": null,
            "Country": null,
            "DisplayName": "chenyu",
            "Name": null,
            "Username": null,
        },
        beforeSend: function(){   
            $('#reg-btn').text('Please wait...')
            $('#reg-btn').attr('disabled',true)
        },
        error: function (XHR, textStatus, errorThrown) {
            $('#reg-btn').text('Sign Up')
            $('#reg-btn').attr('disabled',false)
            Obj.error(XHR.status);
        },
        success: function (JsonObj) {
            $('#reg-btn').text('Sign Up')
            $('#reg-btn').attr('disabled',false)
            Obj.success(JsonObj);
        }
    });
	},
	annielyticxLogin: function(Obj){
    //TODO 用户登录
		let requesetUrl = this.baseUrl + "/api/Accounts/annielyticxLogin";
    let loginTime = new Date();
    let token = {
        Email:Obj.LoginId,
        Password:Obj.Passwords,
        "Date": loginTime.toUTCString()
    };
    let str = JSON.stringify(token);
    let tokenStr = Encrypt(str);
    $.ajax(requesetUrl,{
        type:"POST",
        contentType: "application/x-www-form-urlencoded",
        data:{
            "Provider": "annielyticx",
            "Token": tokenStr,
        },
        beforeSend: function(){   
            $('#login-btn').text('Please wait...')
            $('#login-btn').attr('disabled',true)
        },
        error: function (XHR, textStatus, errorThrown) {
            $('#login-btn').text('Log In')
            $('#login-btn').attr('disabled',false)
            Obj.error(XHR.status);
        },
        success: function (JsonObj) {
            Obj.success(JsonObj);
        }
    });
	},
	testEmail: function(objName,cueName){
    // TODO 验证邮箱
		let status = false;
		let _emailval = cueName.val();
		let reg = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/.test(_emailval);
		if(reg == false){
	    objName.removeClass('disnone');
	    cueName.parent().addClass('has-error');
	  }else{
	    objName.addClass('disnone');
	   	cueName.parent().removeClass('has-error');
	   	status = true;
	  }
	  return status;
	},
	testPassword: function(objName,cueName){
    // TODO 验证密码
		let status = false;
		let _pwdlen = cueName.val()
	  let preg = /^[^ ]+$/.test(_pwdlen);
	  if(preg == false){
	    objName.removeClass('disnone');
	    cueName.parent().addClass('has-error')
	  }else{
	    objName.addClass('disnone');
	    cueName.parent().removeClass('has-error')
	    status = true;
	  }
	  return status;
	},
	testSamePwd: function(objName,cueName,sameName){
    // TODO 验证 密码是否一致
		let status = false;
		let _pwdsval = sameName.val();
	  let _pwdval = cueName.val();
	  if(_pwdsval !== _pwdval){
	    objName.removeClass('disnone');
	    sameName.parent().addClass('has-error')
	  }else{
	    objName.addClass('disnone');
	    sameName.parent().removeClass('has-error')
	   status = true;
	  }
	   return status;
	},
	errorAnimtion: function(objName){
    //TODO 错误提示动画效果（抖动）
		let error = objName
		let fx = 'wobble2';
		if(!errorp.hasClass(fx)){
      errorp.addClass(fx);
      setTimeout(function(){
          errorp.removeClass(fx);
      }, 500);
    }
	}
};

var doc = new Doc();
$(window).load(function(){
	// TODO  登录用户显隐操作
	let user_name = doc.user_acname
  if(user_acname){
    $('#username').text(user_acname)
      $('#usernamedrop').removeClass('disnone')
      $('.signin-btn').hide()
  }
})
// login
$(function(){
  let _username = $('#account'),
      _password = $('#password'),
      forusername = $('#foremail-login'),
      forpassword = $('#forpwd-login');

  _username.blur(function(){
    doc.testEmail(forusername,_username)
  });
  _password.blur(function(){
    doc.testPassword(forpassword,_password)
  });
  //点击登录按钮
  $('#login-btn').click(function(){
    if(!doc.testEmail(forusername,_username)){
      doc.errorAnimtion();
        return false;
    }else if (!doc.testPassword(forpassword,_password)) {
      doc.errorAnimtion();
        return false;
    }
    doc.annielyticxLogin({
      LoginId: _username.val(),
      Passwords: _password.val(),
      success: function (JsonObj) {
        $.cookie("annie_usertoken", JsonObj.access_token, { expires: 1, path: '/' });

        let str = JsonObj.access_token;
        let usermsg = str.split(".");
        let some = $.base64.atob(usermsg[1]);
        let testJson = eval("(" + some + ")");

        $('.signin-btn').hide();
        $('#username').text(testJson.DisplayName);
        $('#usernamedrop').removeClass('disnone');
        $('.modal').modal('hide');
        $.cookie("annie_usertoken_account", some,  { expires: 1, path: '/' });
        $.cookie("annie_usertoken_usermsg", testJson.UserKey,  { expires: 1, path: '/' });
        $.cookie("annie_user_accountname", testJson.DisplayName,  { expires: 1, path: '/' });
        $.cookie("annie_user_loginid", testJson.LoginId, { expires: 1, path: '/' });
      },
      error: function (Code) {
        switch (Code) {
            case  400:
              $('.error').addClass('disnone');
              $('#forpwd-login').removeClass('disnone');
                break;
            case 404:
              $('.error').addClass('disnone');
              $('#name-error').removeClass('disnone');
                break;
        }
      }
    });
  })
});
//regsiter
$(function(){
  let _useremail = $('#newaccount'),
      _pwd = $('#newpassword'),
      _pwds = $('#cnewpassword'),
      _foremail = $('#foremail'),
      _forpwd = $('#forpwd'),
      _forpwds = $('#forpwds');
  _useremail.blur(function(){ 
      doc.testEmail(_foremail,_useremail)
    });
    _pwd.blur(function(){ 
      doc.testPassword(_forpwd,_pwd)
    });

    _pwds.blur(function(){
      doc.testSamePwd(_forpwds,_pwd,_pwds)
    });

    $('#reg-btn').click(function(){
      if(!doc.testEmail(_foremail,_useremail)){
        errorAmtion();
          return false;
      }
      else if (!doc.testPassword(_forpwd,_pwd)) {
        errorAmtion();
          return false;
      } else if(!doc.testSamePwd(_forpwds,_pwd,_pwds)){
        errorAmtion();
          return false;
      }
      let UUID = getUUID();
	    api.addUser({
	          Key: UUID,
	          LoginId: $('#newaccount').val(),
	          Password: $('#newpassword').val(),

	          error: function (Code) {
	              switch (Code) {
	                  case  400:
	                    $('.load').hide();
	                    $('.remsg span').text('error Has account')
	                    $('.remsg').show()
	                      break;
	                  default:
	                    $('.load').hide();
	                    $('.remsg span').text('error')
	                    $('.remsg').show()
	                      break;
	              }
	          },
	          
	          success: function (JsonObj) {
	              console.log('register success')
	          }
	      })
	    })
})
//log out
$('#logout').click(function(){
	$.cookie("annie_usertoken_account", '')
  $.cookie("annie_usertoken_usermsg", '')
  $.cookie("annie_user_accountname", '')
  $.cookie("annie_user_loginid", '');
  $('#username').html('');
  $('#usernamedrop').addClass('disnone');
  $('.signin-btn').show()
  location.reload()
})

//一些编码方式
function getUUID() {
  let s = [];
  let hexDigits = "0123456789abcdef";
  for (let i = 0; i < 36; i++) {
      s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4";
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
  s[8] = s[13] = s[18] = s[23] = "-";

  let uuid = s.join("");
  return uuid;
}
function Bytes2Str16(arr) {
  let str = "";
  for (let i = 0; i < arr.length; i++){
      let tmp = arr[i].toString(16);
      if (tmp.length == 1){
          tmp = "0" + tmp;
      }
      str += tmp;
  }
  return str;
}
function Encrypt(word) {
  let Key = [84, 105, 103, 101, 114, 39, 115, 95, 99, 97, 118, 101, 73, 110, 65, 83];
  let IV = [208, 150, 137, 78, 196, 223, 183, 70, 173, 144, 59, 16, 194, 171, 235, 104];
  let KeyStr = Bytes2Str16(Key);
  let IVStr = Bytes2Str16(IV);
  let key = CryptoJS.enc.Hex.parse(KeyStr);
  let iv = CryptoJS.enc.Hex.parse(IVStr);
  let encrypted = CryptoJS.AES.encrypt(word, key, { iv: iv,mode:CryptoJS.mode.CBC,padding: CryptoJS.pad.Pkcs7});
  return encrypted.toString();
}