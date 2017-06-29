 var userController = require("./userControllers.js");
 var homeController = require("./homeControllers.js");
 var auctionitemController = require("./auctionitemController.js");
 var searchController = require("./searchControllers.js");
 var catogoryController = require("./catogoryControllers.js");
 var aboutController = require("./aboutControllers.js");
 var contactController = require("./contactControllers.js");
 var locationController = require("./locationControllers.js");
 var profileController = require("./profileControllers.js");
 var DangDauGiaController = require("./DangDauGiaControllers.js");
 var WishlistController = require("./wishlistControllers");
 var adminController = require("./adminControllers");
 var sellerController = require("./SellerControllers");
 var winningController = require("./CheckingWinning.js");
 var publicController = require("./publicControllers.js");
 var beatpriceController = require("./itemBeatPriceControllers.js");

 module.exports = {
   home : homeController,
   user : userController,
   item : auctionitemController,
   search : searchController,
   catogory  :catogoryController,
   about : aboutController,
   contact : contactController,
   location : locationController,
   profile : profileController,
   dangdaugia : DangDauGiaController,
   wishlist : WishlistController,
   admin : adminController,
   seller : sellerController,
   winner : winningController,
   publicsx : publicController,
   beatprice : beatpriceController
 }
