const { createUser } = require("../controllers/Auth/user");
const { uploadProduct } = require("../controllers/Products/productupload");
const { buyProduct } = require("../controllers/Purchases/buyproduct");
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
router.post("/Api/uploadproduct", uploadProduct);

module.exports = router;