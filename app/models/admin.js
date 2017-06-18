var db = require("./database.js");
var q = require('q');
var objectUser = require("../Object/userObject.js");
var randstr = require("randomstring");
var bcrypt = require('bcrypt-nodejs');

var admin = {
  FindSellRequest: function() {
    var d = q.defer();
    var sql = "select f_username,f_email,f_name,positiverating,negativerating,DATE_FORMAT(f_time,'%d/%m/%Y %H:%i:%s') as f_time \
      from user, sellrequest where f_ID=f_ID_User and f_Result is null order by f_time desc";
    db.query(sql, function (err,rslt) {
      if (err)
        d.reject(err);
      d.resolve(rslt);
    });
    return d.promise;
  },
  LoadUser: function() {
    var d = q.defer();
    var sql = 'select f_username,f_email,f_name,f_permission,positiverating,negativerating,accessadmin \
      from user order by accessadmin';
    db.query(sql, function (err,rslt) {
      if (err)
        d.reject(err);
      d.resolve(rslt);
    });
    return d.promise;
  },
  LoadCategory: function() {
    var d = q.defer();
    var sql = 'select catname, active from category order by active';
    db.query(sql, function (err,rslt) {
      if (err)
        d.reject(err);
      d.resolve(rslt);
    });
    return d.promise;
  },
  DenySellRequest: function (username) {
    var d = q.defer();
    var sql = 'update sellrequest inner join user on f_ID=f_ID_User \
      set f_result=0 where f_username=?';
    db.query(sql, [username], function (err,rslt) {
      if (err)
        d.reject(err);
      d.resolve(rslt);
    });
    return d.promise;
  },
  AcceptSellRequest: function (username) {
    var d = q.defer();
    var sql = "update sellrequest inner join user on f_ID=f_ID_User \
      set f_result=1 where f_username=?";
    db.query(sql, [username], function (err,rslt) {
      if (err)
        d.reject(err);
      sql = "update user set f_deadlineseller=now() + interval 7 day, f_Permission='seller' \
        where f_username=?";
      db.query(sql, [username], function (err,rslt) {
        if (err)
          d.reject(err);
      })
      d.resolve(rslt);
    });
    return d.promise;
  },
  ChangeCategoryState: function (catname) {
    var d = q.defer();
    var sql = "select active from category where catname=?";
    db.query(sql, [catname], function (err,rslt) {
      if (err || rslt.length==0)
        d.reject(err);
      var changedstate = (rslt[0]['active']===1) ? 0 : 1;
      //console.log(rslt[0]['active'].active);
      sql = "update category set active=" + changedstate + 
        " where catname=?"
      db.query(sql, [catname], function (err, rslt) {
        if (err)
          d.reject(err);
        d.resolve(rslt);
      });
    });
    return d.promise;
  },
  AddCategory: function (catname) {
    var d = q.defer();
    var sql = "insert into category(catname,active) values(?,1)";
    db.query(sql, [catname], function (err,rslt) {
      if (err)
        d.reject(err);
      d.resolve(rslt);
    });
    return d.promise;
  },
  ChangeUserState: function (username) {
    var d = q.defer();
    var sql = "select accessadmin from user where f_username=?";
    db.query(sql, [username], function (err,rslt) {
      if (err || rslt.length==0)
        d.reject(err);
      var changedstate = (rslt[0]['accessadmin']===1) ? 0 : 1;
      
      sql = "update user set accessadmin=" + changedstate + 
        " where f_username=?"
      db.query(sql, [username], function (err, rslt) {
        if (err)
          d.reject(err);
        d.resolve(rslt);
      });
    });
    return d.promise;
  },
  ResetPassword: function (username) {
    var d = q.defer();
    var newPassword = randstr.generate(8);
    var encrpytedPassword = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(5), null);
    var sql = "update user set f_Password=? where f_username=?";
    db.query(sql, [encrpytedPassword,username], function (err,rslt) {
      if (err)
        d.reject(err);
      console.log("* Reset Password: " + newPassword);
      d.resolve(rslt);
    });
    return d.promise;
  }
  /*insertUser: function (object) {
    var d = q.defer();
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();

    if(dd<10) {
        dd='0'+dd
    }

    if(mm<10) {
        mm='0'+mm
    }

    today = yyyy+'-'+mm+'-'+dd;

    var newuser = new objectUser('',object.username, object.password, object.first_name, object.last_name, object.email, object.address,today, 'user');
    newuser.SettingPassword(newuser.encryptPassword(newuser.Password));
    var sql = 'INSERT INTO user(f_Username, f_Password, f_Name, f_Email, f_Address,f_DOB, f_Permission) values (?, ?, ?, ?, ?, ?, ?)';
    console.log(newuser);
    db.query(sql, [newuser.Username, newuser.Password, newuser.Firstname + " " + newuser.Lastname, newuser.Email , newuser.Address, newuser.Days, newuser.Permission],function (error, results) {
      if (error){
        d.reject(error);
      }
      d.resolve(results);
    });
    return d.promise;
  }*/
}

module.exports = admin;
