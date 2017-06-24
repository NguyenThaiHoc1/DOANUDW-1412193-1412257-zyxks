var db = require("./database.js");
var q = require('q');
var objectUser = require("../Object/userObject.js");

var user = {
  findbyUserEmail: function (email) {
    var d = q.defer();
    var sql = 'Select f_Email from user where f_Email = ?';
    db.query(sql, [email],function (error, results) {
      if (error){
        d.reject(error);
      }
      d.resolve(results);
    });
    return d.promise;
  },
  findbyUserName: function (username) {
    var d = q.defer();
    var sql = 'select * from user where f_Username = ? and f_Permission != \'admin\';';
    db.query(sql, [username],function (error, results) {
      if (error){
        d.reject(error);
      }
      d.resolve(results);
    });
    return d.promise;
  },
  insertUser: function (object) {
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
    db.query(sql, [newuser.Username, newuser.Password, newuser.Firstname + " " + newuser.Lastname, newuser.Email , newuser.Address, newuser.Days, newuser.Permission],function (error, results) {
      if (error){
        d.reject(error);
      }
      d.resolve(results);
    });
    return d.promise;
  },
  changepassword: function (Objects) {
    var d = q.defer();
    var sql = 'Update user set f_Password = ? where f_Username = ?';
    db.query(sql, [Objects.Password, Objects.Username],function (error, results) {
      if (error){
        d.reject(error);
      }
      d.resolve(results);
    });
    return d.promise;
  },
  Testing1: function () {
    var d = q.defer();
    var sql = 'Select * from user where f_ID = 1';
    db.query(sql,function (error, results) {
      if (error){
        d.reject(error);
      }
      d.resolve(results);
    });
    return d.promise;
  },
  RequestSelling: function (username) {
    var d = q.defer();
    var sql = 'select f_id from user where f_username=?';
    db.query(sql,[username], function (err, rslt) {
      if (err){
        d.reject(err);
      }
      var id = rslt[0]['f_id'];
      sql = 'insert into sellrequest values (?,now(),null)';
      db.query(sql,[id],function(err0, rslt0) {
        if (err0)
          d.reject(err0);
        d.resolve(rslt0);
      })
    });
    return d.promise;
  },
  Testing2: function () {
    var d = q.defer();
    var sql = 'Select * from user where f_ID = 2';
    db.query(sql,function (error, results) {
      if (error){
        d.reject(error);
      }
      d.resolve(results);
    });
    return d.promise;
  },
  UpdateUser: function (Objects) {
    var d = q.defer();
    var sql = 'Update user set f_Email = ?, f_Name = ?, f_Address = ? where f_ID = ?';
    db.query(sql,[Objects.email, Objects.name, Objects.address, Objects.Userid], function (error, results) {
      if (error){
        d.reject(error);
      }
      d.resolve(results);
    });
    return d.promise;
  }
}

module.exports = user;
