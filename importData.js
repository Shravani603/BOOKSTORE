console.log("Current directory:", __dirname);
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// connect DB
mongoose.connect('mongodb://127.0.0.1:27017/bookstore');

// schema
const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  isbn: String,
  price: Number,
  category: String,
  stock: Number,
  imageUrl: String,
  description: String
});

const Book = mongoose.model('Book', bookSchema);

// ✅ Use absolute path (VERY IMPORTANT)
const filePath = path.join(__dirname, 'books_ready.json');

// read file
const rawData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

// 🔍 Debug (check if updated data is actually loaded)
console.log("Total books:", rawData.length);
console.log("Sample book:", rawData[0]);

// insert into DB
Book.insertMany(rawData)
  .then(() => {
    console.log("✅ Dataset inserted successfully");
    mongoose.connection.close();
  })
  .catch(err => console.log("❌ Error:", err));