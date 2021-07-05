const User = require("../models/user");
const Stripe = require("stripe");
const queryString = require("query-string");
const Hotel = require("../models/hotel");

const stripe = Stripe(process.env.STRIPE_SECRET);

exports.createConnectAccount = async (req, res) => {
  //find user
  const user = await User.findById(req.user._id).exec();
  //check and set stripe id
  if (!user.stripe_account_id) {
    const account = await stripe.accounts.create({
      type: "express",
    });
    user.stripe_account_id = account.id;
    await user.save();
  }
  //creating login link on id
  let accountLink = await stripe.accountLinks.create({
    account: user.stripe_account_id,
    refresh_url: process.env.STRIPE_REDIRECT_URL,
    return_url: process.env.STRIPE_REDIRECT_URL,
  });
  //prefill any links as email
  accountLink = Object.assign(accountLink, {
    "stripe_user[email]": user.email || undefined,
  });
  //link

  let link = `${accountLink.url}?${queryString.stringify(accountLink)}`;
  console.log(link);
  res.send(link);
};

const updateDelayDays = async (accountId) => {
  const account = await stripe.accounts.update(accountId, {
    settings: {
      payouts: {
        schedule: {
          delay_days: 7,
        },
      },
    },
  });
  return account;
};

exports.getAccountStatus = async (req, res) => {
  const user = await User.findOne(req.user._id).exec();
  const account = await stripe.accounts.retrieve(user.stripe_account_id);

  const updateAccount = await updateDelayDays(account.id);
  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    {
      stripe_seller: updateAccount,
    },
    { new: true }
  )
    .select("-password")
    .exec();
  res.json(updatedUser);
};

exports.getAccountBalance = async (req, res) => {
  const user = await User.findById(req.user._id).exec();
  try {
    const balance = await stripe.balance.retrieve({
      stripeAccount: user.stripe_account_id,
    });
    res.json(balance);
  } catch (error) {
    console.log(error);
  }
};

exports.payoutSettings = async (req, res) => {
  try {
    let user = await User.findById(req.user._id).exec();
    const loginLink = await stripe.accounts.createLoginLink(
      user.stripe_account_id,
      {
        redirect_url: process.env.STRIPE_SETTING_REDIRECT_URL,
      }
    );
    res.json(loginLink);
  } catch (error) {
    console.log(error);
  }
};

exports.stripeSessionId = async (req, res) => {
  const { hotelId } = req.body;
  const item = await Hotel.findById(hotelId).populate("postedBy").exec();
  const fee = (item.price * 20) / 100;
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        name: item.title,
        amount: item.price * 100,
        currency: "usd",
        quantity: 1,
      },
    ],
    payment_intent_data: {
      application_fee_amount: fee * 100,
      transefer_data: {
        destination: item.postedBy.stripe_account_id,
      },
    },
    success_url: `${process.env.STRIPE_SUCCESS_URL}/${item._id}`,
    cancel_url: `${process.env.STRIPE_CANCEL_URL}`,
  });
  await User.findByIdAndUpdate(req.user._id, { stripeSession: session }).exec();
  res.json({
    sessionId: session.id,
  });
};

exports.stripeSuccess = async (req, res) => {
  try {
    const { hotelId } = req.body;
    const user = await User.findById(req.user._id).exec();
    if (!user.stripeSession) return;
    const session = await stripe.checkout.sessions.retrieve(
      user.stripeSession.id
    );
    if (session.payment_status === "paid") {
      const orderExist = await Order.findOne({
        "session.id": session.id,
      }).exec();
      if (orderExist) {
        res.json({ sucess: true });
      } else {
        let newOrder = await new Order({
          hotel: hotelId,
          session,
          orderedBy: user.Id,
        }).save();
        //removinig stripe session
        await User.findByIdAndUpdate(user._id, {
          $set: { stripeSession: {} },
        });
        res.json({ sucess: true });
      }
    }
  } catch (error) {
    console.log(error);
  }
};
