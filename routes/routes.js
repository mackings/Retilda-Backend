const { createwallet, getWalletBalance, debitWallet, transferVerification, getWalletTransactions } = require("../controllers/Wallet/wallets");

const router = require("express").Router();

router.post("/Api/createwallet",createwallet);
router.get("/Api/balance", getWalletBalance);
router.get("/Api/transactions/:walletAccountNumber", getWalletTransactions);
router.post("/Api/debit", debitWallet);
router.post("/Api/verify-transfer", transferVerification);


module.exports = router;