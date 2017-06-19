var bcrypt = require('bcrypt-nodejs');

module.exports = function (id, username, password, first_name, last_name, email, address, day, permission, positiverating, negativerating, imgURL, f_deadlineseller) {
  this.IdUser = id;
  this.Username = username;
  this.Password = password;
  this.Firstname = first_name;
  this.Lastname = last_name;
  this.Days = day;
  this.Permission = permission;
  this.Email = email;
  this.Address = address;
  this.Positiverating = positiverating;
  this.Negativerating = negativerating;
  this.Imgurl = imgURL;
  this.Deadlineseller = f_deadlineseller;

  this.encryptPassword = function (password) {
      return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
  }

  this.validPassword = function (password) {
    return bcrypt.compareSync(password, this.Password); // return true or false
  }

  this.SettingPassword = function (newpassword) {
    this.Password = newpassword;
  }
}
