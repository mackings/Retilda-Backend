const { createUser, loginUser } = require("../controllers/Auth/user");
const { products, priceFilter, getProductsByCategory } = require("../controllers/Products/products");
const { uploadProduct } = require("../controllers/Products/productupload");
const { buyProduct, installmentPayment } = require("../controllers/Purchases/buyproduct");
const { getPurchases } = require("../controllers/Purchases/purchases");
const { createwallet, getWalletBalance, debitWallet, transferVerification, getWalletTransactions } = require("../controllers/Wallet/wallets");
const { verifyToken } = require("../controllers/utils");

const router = require("express").Router();


//Users
router.post("/Api/register",createUser);
router.post("/Api/login", loginUser);


//Wallets
router.post("/Api/createwallet",verifyToken,createwallet);
router.get("/Api/balance",verifyToken, getWalletBalance);
router.get("/Api/transactions/:walletAccountNumber",verifyToken, getWalletTransactions);
router.post("/Api/debit",verifyToken, debitWallet);
router.post("/Api/verify-transfer",verifyToken, transferVerification);
router.post("/Api/buyproduct",verifyToken, buyProduct);

//Products
router.get("/Api/products",verifyToken, products);
router.get("/Api/products/category/:categoryName",verifyToken, getProductsByCategory);
router.get("/Api/products/filter",verifyToken,priceFilter);
router.post("/Api/uploadproduct",verifyToken, uploadProduct);
router.get("/Api/purchases/:userId",verifyToken, getPurchases);
router.post("/Api/purchases/installment",verifyToken,installmentPayment);

module.exports = router;