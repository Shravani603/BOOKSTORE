const mongoose = require('mongoose');
const Book = require('./models/Book'); // adjust path if needed

mongoose.connect('mongodb://127.0.0.1:27017/bookstore') // your DB name
  .then(async () => {
    await Book.deleteMany({});
    console.log("✅ All books deleted");
    process.exit();
  })
  .catch(err => {
    console.error("❌ Error deleting data:", err);
    process.exit(1);
  });