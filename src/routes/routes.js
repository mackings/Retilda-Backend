const { createUser, loginUser } = require("../controllers/Auth/user");
const { products, priceFilter, getProductsByCategory, getAllProductCategories, searchProducts } = require("../controllers/Products/products");
const { uploadProduct } = require("../controllers/Products/productupload");
const { buyProduct, installmentPayment, onetimePayment } = require("../controllers/Purchases/buyproduct");
const { getPurchases, updateDeliveryStatus } = require("../controllers/Purchases/purchases");
const { createwallet, getWalletBalance, debitWallet, transferVerification, getWalletTransactions } = require("../controllers/Wallet/wallets");
const { verifyToken } = require("../controllers/utils");

const router = require("express").Router();


//Users
router.post("/Api/register",createUser);
router.post("/Api/login", loginUser);
router.get("/Api/products",verifyToken, products);


//Wallets and payments
router.post("/Api/createwallet",createwallet);
router.post("/Api/balance",verifyToken, getWalletBalance);
router.get("/Api/transactions/:walletAccountNumber",verifyToken, getWalletTransactions);
router.post("/Api/debit",verifyToken, debitWallet);
router.post("/Api/verify-transfer",verifyToken, transferVerification);
router.post("/Api/buyproduct",verifyToken, buyProduct);
router.post("/Api/purchases/installment",verifyToken,installmentPayment);
router.post("/Api/purchases/onetimepayment",verifyToken,onetimePayment);

//Products
router.post("/Api/products/updatedelivery",verifyToken, updateDeliveryStatus);
router.get("/Api/products/allcategory",verifyToken, getAllProductCategories);
router.get("/Api/products/category/:categoryName",verifyToken, getProductsByCategory);
router.get("/Api/products/filter",verifyToken,priceFilter);
router.get("/Api/products/search", searchProducts);
router.post("/Api/uploadproduct",verifyToken, uploadProduct);
router.get("/Api/purchases/:userId",verifyToken, getPurchases);


module.exports = router;