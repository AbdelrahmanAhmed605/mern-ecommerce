const stripe = require("stripe");
const router = require("express").Router();

// Initialize the Stripe instance with the provided secret key
const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);

// Function to create a payment intent with the given amount and currency
const createPaymentIntent = async (amount, currency) => {
  console.log("\nPRIVATE TEST KEY:", process.env.STRIPE_SECRET_KEY);
  try {
    // Sanitize the amount by converting it to a positive integer in cents
    const sanitizedAmount = Math.abs(Number(amount) * 100);

    console.log("Sanitized Amount:", sanitizedAmount);

    // Check if the amount is invalid (less than or equal to 0)
    if (amount <= 0) {
      throw new Error("Invalid amount");
    }

    // Check if the required fields (amount and currency) are missing
    if (!amount || !currency) {
      throw new Error("Missing required fields");
    }

    // Create a payment intent using the Stripe API
    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount: sanitizedAmount,
      currency,
    });

    console.log("paymentIntent:", paymentIntent);
    console.log(JSON.stringify(paymentIntent, null, 4));

    return paymentIntent;
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw new Error("Failed to create payment intent");
  }
};

// Route to handle the creation of a payment intent
router.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount, currency } = req.body;

    // Call the createPaymentIntent function to generate the payment intent
    const paymentIntent = await createPaymentIntent(amount, currency);

    // Return the client secret of the payment intent as the response
    res.json({ client_secret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ error: "Failed to create payment intent" });
  }
});

module.exports = router;
