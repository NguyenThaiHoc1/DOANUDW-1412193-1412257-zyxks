var path = require("path");
var exphbs = require('express-handlebars');

module.exports = function (app) {
  app.engine('hbs', exphbs({
      extname: ".hbs", // de su dung layout
      layoutsDir: path.resolve("app/views/layouts/"), // xác định lai layout nằm ở đâu
      partialsDir: path.resolve("app/views/partials")// xác định lại partials đang ở đâu
  }));
  app.set('view engine', 'hbs');
  app.set("views", path.resolve("app/views"));

};
