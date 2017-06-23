const nodemailer = require('nodemailer');



module.exports = function (toEmail, ContentEmail) {
  this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: 'dackweb0@gmail.com',
          pass: 'wtf935730'
      }
  });

  this.mailOptions = {
      from: 'dackweb0@gmail.com',
      to: toEmail,
      subject: 'Confirm Bid Price',
      text: ContentEmail
  };

  this.SendEmail = function () {
    this.transporter.sendMail(this.mailOptions, function (error, info) {
        if (error) {
            return console.log(error);
        }
    });
  }

}
