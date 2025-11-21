import express from "express";
import dotenv from "dotenv";
import path from "path";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";

import {
  StandardCheckoutClient
} from "pg-sdk-node/dist/payments/v2/StandardCheckoutClient.js";

import { Env } from "pg-sdk-node/dist/Env.js";
import { StandardCheckoutPayRequest } from "pg-sdk-node/dist/payments/v2/models/request/StandardCheckoutPayRequest.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ------------------------------------------------------------------
// ⭐ PROD READY PHONEPE CLIENT (DO NOT TOUCH)
// ------------------------------------------------------------------
const client = StandardCheckoutClient.getInstance(
  process.env.PHONEPE_CLIENT_ID,
  process.env.PHONEPE_CLIENT_SECRET,
  process.env.PHONEPE_CLIENT_VERSION,
  Env.PRODUCTION,     // 🔥 FINAL -> PRODUCTION OR TEST -> UAT
  false               // Event sending OFF for safety
);

// ------------------------------------------------------------------
// CREATE ORDER (PRODUCTION SAFE)
// ------------------------------------------------------------------
app.post("/api/create-order", async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    if (!amount || amount <= 0)
      return res.status(400).json({ error: "Invalid Amount" });

    const merchantTransactionId = "MT_" + Date.now();
    const amountPaise = amount * 100;

    // Build SDK Request
    const payRequest = StandardCheckoutPayRequest
      .builder()
      .merchantOrderId(merchantTransactionId)
      .amount(amountPaise)
      .metaInfo({ user: "USER001" })
      .message("Payment for eBook")
      .redirectUrl(`${process.env.BASE_URL}/download.html`)
      // .redirectUrl(`http://localhost:3000/download.html`)
      .build();

    console.log("📤 Sending Pay Request:", payRequest);


    const response = await client.pay(payRequest);
    console.log("📥 RAW RESPONSE:", JSON.stringify(response, null, 2));

    // ---- SAFE PRODUCTION HANDLING ----
    // ---- SAFE PRODUCTION HANDLING ----
    const redirectUrl =
      response?.instrumentResponse?.redirectInfo?.url ||  // SDK response
      response?.redirectUrl ||                            // RAW PhonePe response
      response?.data?.redirectUrl ||                      // fallback
      null;

    if (!redirectUrl) {
      return res.status(500).json({
        error: "PhonePe did not return redirect URL",
        hint:
          "Check if Standard Checkout (PG) is enabled in your PhonePe dashboard",
        phonepeResponse: response
      });
    }

    return res.json({
      success: true,
      redirectUrl,
      merchantTransactionId
    });


  } catch (err) {
    console.log("❌ PAYMENT ERROR:", err);
    return res.status(500).json({
      error: "Payment Creation Failed",
      message: err.message,
      stack: err.stack
    });
  }
});

// ------------------------------------------------------------------
// VERIFY PAYMENT STATUS
// ------------------------------------------------------------------
app.post("/api/verify-payment", async (req, res) => {
  try {
    const { merchantTransactionId } = req.body;

    const result = await client.getOrderStatus(merchantTransactionId);

    console.log("🔍 ORDER STATUS:", JSON.stringify(result));

    return res.json(result);

  } catch (err) {
    console.log("❌ STATUS ERROR:", err);
    return res.status(500).json({ error: "Status Check Failed" });
  }
});

// ------------------------------------------------------------------
// STATIC FILES
// ------------------------------------------------------------------
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/cart.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "cart.html"));
});

// ------------------------------------------------------------------
// SERVER START
// ------------------------------------------------------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
