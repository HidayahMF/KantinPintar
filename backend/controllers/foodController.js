import foodModel from "../models/foodModel.js";
import fs from "fs";
import path from "path";

// CREATE
const addFood = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image file is required" });
    }
    const { name, description, price, category, stock } = req.body;

    // Pastikan stock wajib diisi dan valid
    if (stock == null || isNaN(Number(stock)) || Number(stock) < 0) {
      return res.status(400).json({ success: false, message: "Stock is required and must be >= 0" });
    }

    const food = new foodModel({
      name,
      description,
      price,
      category,
      stock: Number(stock), // <-- TAMBAH STOCK DI SINI
      image: req.file.filename,
    });
    await food.save();
    res.json({ success: true, message: "Food item successfully added", data: food });
  } catch (error) {
    console.error("Add Food Error:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// READ
const listFood = async (req, res) => {
  try {
    const categoryFilter = req.query.category;
    const filter = {};
    if (categoryFilter && categoryFilter !== "All") {
      filter.category = categoryFilter;
    }
    const foods = await foodModel.find(filter);
    res.json({ success: true, data: foods });
  } catch (error) {
    console.error("List Food Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch food list" });
  }
};

// DELETE
const removeFood = async (req, res) => {
  try {
    const food = await foodModel.findById(req.params.id);
    if (!food) return res.status(404).json({ success: false, message: "Food not found" });

    // Hapus file gambar
    const imgPath = path.join("uploads", food.image);
    fs.unlink(imgPath, (err) => {
      if (err) console.error("Failed to delete image file:", err);
    });

    await foodModel.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Food item successfully removed" });
  } catch (error) {
    console.error("Remove Food Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to remove food" });
  }
};

// UPDATE
const updateFood = async (req, res) => {
  try {
    const { name, price, category, description, stock } = req.body;
    const food = await foodModel.findById(req.params.id);
    if (!food) return res.status(404).json({ success: false, message: "Food not found" });

    // Update data field
    if (name) food.name = name;
    if (price) food.price = price;
    if (category) food.category = category;
    if (description) food.description = description;
    // Update stock jika diisi
    if (stock != null) {
      if (isNaN(Number(stock)) || Number(stock) < 0) {
        return res.status(400).json({ success: false, message: "Stock must be a non-negative number" });
      }
      food.stock = Number(stock);
    }

    // Jika ada file baru, hapus gambar lama & update gambar baru
    if (req.file) {
      if (food.image) {
        const oldPath = path.join("uploads", food.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      food.image = req.file.filename;
    }

    await food.save();
    res.json({ success: true, message: "Food updated", data: food });
  } catch (error) {
    console.error("Update Food Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to update food" });
  }
};

// ADD REVIEW
const addReview = async (req, res) => {
  try {
    const { foodId, rating, comment } = req.body;
    const userId = req.userId;   // Dari auth middleware
    const userName = req.user?.name || "Anonymous";

    if (!foodId || !rating || !comment) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const food = await foodModel.findById(foodId);
    if (!food) {
      return res.status(404).json({ success: false, message: "Food not found" });
    }

    // CEGAH SPAM: cek sudah pernah review belum
    const alreadyReviewed = food.reviews?.some(
      (review) => review.userId?.toString() === userId
    );
    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: "You have already reviewed this food." });
    }

    // Tambahkan review baru
    const newReview = {
      userId,
      user: userName,
      rating: Number(rating),
      comment,
      date: new Date(),
    };

    if (!food.reviews) food.reviews = [];
    food.reviews.push(newReview);
    await food.save();

    res.json({ success: true, message: "Review added", food });
  } catch (error) {
    console.error("Add Review Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to add review" });
  }
};

export { addFood, listFood, removeFood, updateFood, addReview };
