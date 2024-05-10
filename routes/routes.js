const { createUser } = require("../controllers/Auth/user");
const { products, priceFilter, getProductsByCategory } = require("../controllers/Products/products");
const { uploadProduct } = require("../controllers/Products/productupload");
const { buyProduct, installmentPayment } = require("../controllers/Purchases/buyproduct");
const { getPurchases } = require("../controllers/Purchases/purchases");
const { createwallet, getWalletBalance, debitWallet, transferVerification, getWalletTransactions } = require("../controllers/Wallet/wallets");

const router = require("express").Router();


//Users
router.post("/Api/register",createUser);


//Wallets
router.post("/Api/createwallet",createwallet);
router.get("/Api/balance", getWalletBalance);
router.get("/Api/transactions/:walletAccountNumber", getWalletTransactions);
router.post("/Api/debit", debitWallet);
router.post("/Api/verify-transfer", transferVerification);
router.post("/Api/buyproduct", buyProduct);

//Products
router.get("/Api/products", products);
router.get("/Api/products/category/:categoryName", getProductsByCategory);
router.get("/Api/products/filter",priceFilter);
router.post("/Api/uploadproduct", uploadProduct);
router.get("/Api/purchases/:userId", getPurchases);
router.post("/Api/purchases/installment", installmentPayment);

module.exports = router;