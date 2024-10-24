const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const route = require("./routes/routes");
const User = require("./models/Authmodel");
const crypto = require('crypto');

app.use(express.json());
app.use("/", route);

// Test route to verify server is running
app.get("/", (req, res) => {
  res.send("Hello Vercel");
});


// Paystack webhook to handle payments

app.post("/retilda/payments", async (req, res) => {
    try {
      const secret = process.env.PAYSTACK_SECRET_KEY;
      const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
  
      // Verify the event's signature to ensure it's from Paystack
      if (hash === req.headers['x-paystack-signature']) {
        const event = req.body;
  
        // Only handle successful and failed payments
        if (event.event === 'charge.success' || event.event === 'charge.failed') {
          const { email, customer_code } = event.data.customer;
          const { reference, amount, status, gateway_response, paid_at, currency, channel, created_at, id } = event.data;
  
          // Find the user based on email or customer_code
          const user = await User.findOne({ $or: [{ email }, { customerCode: customer_code }] });
  
          if (user) {
            // Add the transaction details to user's transactions array
            const transaction = {
              id, // Make sure to add the id from Paystack
              reference,
              amount,
              status: event.event === 'charge.success' ? 'success' : 'failed',
              paymentDate: paid_at || new Date(),
              gatewayResponse: gateway_response,
              currency, // Add currency from Paystack response
              channel,  // Add channel from Paystack response
              createdAt: created_at // Add createdAt from Paystack response
            };
  
            user.transactions.push(transaction);
            await user.save();
  
            console.log("Transaction saved successfully for:", email);
          } else {
            console.log("User not found for email or customer_code:", email || customer_code);
          }
        }
      }
  
      // Return a 200 OK response to acknowledge the webhook event
      res.sendStatus(200);
  
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(500).send('Webhook error');
    }
  });
  

// Server startup and MongoDB connection

app.listen(process.env.PORT || 3000, async () => {
  console.log("RUNNING_LOCALS >>>", process.env.PORT || 3000);
  try {
    const conn = await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ignoreUndefined: true,
    });
    console.log("DB CONNECTED >>>>");
  } catch (error) {
    console.error("Error connecting to database:", error);
  }
});
