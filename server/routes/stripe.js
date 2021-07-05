const express = require("express");

const router = express.Router();

//middleawre
const { requireSignin, hello } = require("../middlewares");
// import { requireSignin } from "../middlewares";

//controllers
const {
  createConnectAccount,
  getAccountStatus,
  getAccountBalance,
  payoutSettings,
  stripeSessionId,
  stripeSuccess,
} = require("../controllers/stripe");

router.post(
  "/create-connect-account",
  requireSignin,
  hello,
  createConnectAccount
);
router.post("/get-account-status", requireSignin, getAccountStatus);
router.post("/get-account-balance", requireSignin, getAccountBalance);
router.post("/payout-settings", requireSignin, payoutSettings);
router.post("/stripe-session-id", requireSignin, stripeSessionId);
//order
router.post("/stripe-success", requireSignin, stripeSuccess);

module.exports = router;
