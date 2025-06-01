import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import stripePackage from "stripe";
import { connectDB } from "./config/db.js";

import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import categoryRoute from "./routes/categoryRoute.js";
import subCategoryRoute from "./routes/subcategoryRoute.js";
import adminRouter from "./routes/adminRoute.js";

import authUserMiddleware from "./middleware/authUserMiddleware.js";
import * as orderController from "./controllers/orderController.js";
import messageRoute from "./routes/messageRoute.js";

// ==================== ENVIRONMENT CHECK ====================
const port = process.env.PORT || 4000;

const requiredEnv = ["JWT_SECRET", "STRIPE_SECRET_KEY", "FRONTEND_URL"];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`❌ ${key} environment variable is missing!`);
    process.exit(1);
  }
}
console.log("✅ All required environment variables are set.");

const stripe = stripePackage(process.env.STRIPE_SECRET_KEY);


const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("✅ uploads directory created.");
}


const app = express();

app.use(cors());

app.use("/uploads", express.static(uploadsDir));

app.use(express.json());


app.use("/api/food", foodRouter);
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/category", categoryRoute);
app.use("/api/subcategory", subCategoryRoute);
app.use("/api/admin", adminRouter);
app.use('/uploads', express.static('uploads'));
app.use("/api/message", messageRoute);

app.post("/api/order/place", authUserMiddleware, orderController.placeOrder);



app.get("/", (req, res) => {
  res.send("✅ API is working");
});


const startServer = async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB connected");

    app.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

startServer();
