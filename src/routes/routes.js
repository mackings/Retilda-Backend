const { createUser, loginUser } = require("../controllers/Auth/user");
const { products, priceFilter, getProductsByCategory, getAllProductCategories, searchProducts } = require("../controllers/Products/products");
const { uploadProduct } = require("../controllers/Products/productupload");
const { buyProduct, installmentPayment, onetimePayment } = require("../controllers/Purchases/buyproduct");
const { getPurchases, updateDeliveryStatus, processDirectTransfer } = require("../controllers/Purchases/purchases");
const { createwallet, getWalletBalance, debitWallet, transferVerification, getWalletTransactions, createMandate } = require("../controllers/Wallet/wallets");
const { verifyToken } = require("../controllers/utils");
const directDebitController = require('../controllers/Direct Debit/debit');
const { createDedicatedWallet, createCustomer, createDedicatedAccount, getUserWallet } = require("../controllers/Vwallets/createwallet");

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


//Paystack Wallets 
router.post("/Api/Customer/create",createCustomer);
router.post("/Api/Customer/create-wallet",createDedicatedAccount);
router.get("/Api/Customer/transactions/:email", getUserWallet);



//Products
router.post("/Api/products/updatedelivery",verifyToken, updateDeliveryStatus);
router.get("/Api/products/allcategory",verifyToken, getAllProductCategories);
router.get("/Api/products/category/:categoryName",verifyToken, getProductsByCategory);
router.get("/Api/products/filter",verifyToken,priceFilter);
router.get("/Api/products/search",verifyToken, searchProducts);
router.post("/Api/uploadproduct",verifyToken, uploadProduct);
router.get("/Api/purchases/:userId",verifyToken, getPurchases);

//Mandate

router.post("/Api/mandate/create",verifyToken,createMandate);
router.post("/direct",processDirectTransfer);

//Direct Debit 

router.post('/direct-debit/initiate', directDebitController.initiateAuthorization);
router.get('/direct-debit/verify/:reference', directDebitController.verifyAuthorization);
router.post('/direct-debit/charge', directDebitController.chargeCustomer);
router.get('/direct-debit/charge/verify/:reference', directDebitController.verifyCharge);
router.post('/direct-debit/deactivate', directDebitController.deactivateAuthorization);


module.exports = router;