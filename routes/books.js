const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const Feedback = require('../models/Feedback');
const Contact = require('../models/Contact');
const Order = require('../models/Order');

const { isLoggedIn, isOwner } = require('../middleware/auth');


// 📚 Get all books
router.get('/books', async (req, res) => {
    try {
        const books = await Book.find().sort({ createdAt: -1 });
        console.log("BOOKS:", books); 
        res.render('books', { books });
    } catch (error) {
        console.error(error);
        res.redirect('/');
    }
});


// ➕ Show add book form
router.get('/books/add', (req, res) => {
    res.render('add-book');
});

// 🔍 Search books
router.get('/books/search', async (req, res) => {
    try {
        const query = req.query.q;
        const books = await Book.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { author: { $regex: query, $options: 'i' } },
                { category: { $regex: query, $options: 'i' } }
            ]
        });
        res.render('books', { books, searchQuery: query });
    } catch (error) {
        console.error(error);
        res.redirect('/books');
    }
});

// 📖 View single book details
router.get('/books/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).send('book not found');
        }
        res.render('book-details', { book });
    } catch (error) {
        console.error('Error loading book details:', error);
        res.status(500).send('Server Error');
    }
});


// 🆕 Add new book
router.post('/books', isLoggedIn, async (req, res) => {
    try {
        const { title, author, isbn, price, category, description, stock, imageUrl } = req.body;
        const newBook = new book({
            title,
            author,
            isbn,
            price: parseFloat(price),
            category: category.trim().toLowerCase(),
            description,
            stock: parseInt(stock),
            imageUrl: imageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300',

            createdBy: req.session.user._id   // ⭐ ADD THIS LINE
});

        await newBook.save();
        res.redirect('/books');
    } catch (error) {
        console.error(error);
        res.redirect('/books/add');
    }
});

// ✏️ Edit book form
router.get('/books/edit/:id', isLoggedIn, isOwner(book), async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.redirect('/books');
        res.render('edit-book', { book });
    } catch (error) {
        console.error(error);
        res.redirect('/books');
    }
});

// 💾 Update book
router.put('/books/:id', isLoggedIn, isOwner(book), async (req, res) => {
    try {
        const { title, author, isbn, price, category, description, stock, imageUrl } = req.body;
        await Book.findByIdAndUpdate(req.params.id, {
            title,
            author,
            isbn,
            price: parseFloat(price),
            category,
            description,
            stock: parseInt(stock),
            imageUrl: imageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300'
        });
        res.redirect('/books');
    } catch (error) {
        console.error(error);
        res.redirect(`/books/edit/${req.params.id}`);
    }
});

// ❌ Delete book
router.delete('/books/:id', isLoggedIn, isOwner(book), async (req, res) => {
    try {
        await Book.findByIdAndDelete(req.params.id);
        res.redirect('/books');
    } catch (error) {
        console.error(error);
        res.redirect('/books');
    }
});



// 📞 Contact Us page
router.get('/contact', async (req, res) => {
    const success = req.query.success;
    res.render('contact', { success });
});

// 📬 Handle contact form (save to MongoDB)
router.post('/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        await new Contact({ name, email, message }).save();
        res.redirect('/contact?success=true');
    } catch (error) {
        console.error('Error saving contact:', error);
        res.redirect('/contact?success=false');
    }
});

// 💬 Feedback page
router.get('/feedback', async (req, res) => {
    try {
        const feedbacks = await Feedback.find().sort({ createdAt: -1 });
        res.render('feedback', { feedbacks });
    } catch (error) {
        console.error('Error loading feedback page:', error);
        res.redirect('/');
    }
});

// 💾 Handle feedback form submission
router.post('/feedback', isLoggedIn, async (req, res) => {
    try {
        const { customerName, rating, bookTitle, review } = req.body;
        const newFeedback = new Feedback({
            customerName,
            rating,
            bookTitle,
            review,
            user: req.session.user._id   // ⭐ ADD THIS
        });
        await newFeedback.save();
        res.redirect('/feedback');
    } catch (error) {
        console.error('Error saving feedback:', error);
        res.redirect('/feedback');
    }
});

// edit feedback page
router.get('/feedback/edit/:id', isLoggedIn, async (req, res) => {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) return res.redirect('/feedback');

    if (
        feedback.user.toString() !== req.session.user._id &&
        req.session.user.role !== 'admin'
    ) {
        return res.send("Not allowed");
    }

    res.render('edit-feedback', { feedback });
});

// update 
router.put('/feedback/:id', isLoggedIn, async (req, res) => {
    const feedback = await Feedback.findById(req.params.id);

    if (
        feedback.user.toString() !== req.session.user._id &&
        req.session.user.role !== 'admin'
    ) {
        return res.send("Not allowed");
    }

    await Feedback.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/feedback');
});


//DELETE
router.delete('/feedback/:id', isLoggedIn, async (req, res) => {
    const feedback = await Feedback.findById(req.params.id);

    if (
        !feedback.user ||
        (feedback.user.toString() !== req.session.user._id &&
        req.session.user.role !== 'admin')
    ) {
        return res.send("Not allowed");
    }

    await Feedback.findByIdAndDelete(req.params.id);
    res.redirect('/feedback');
});


// 🏷️ Categories page
router.get('/categories', async (req, res) => {
    try {
        const categories = await Book.distinct('category');
        const booksByCategory = {};

        for (let category of categories) {
            booksByCategory[category] = await Book.find({ category }).limit(4);
        }

        res.render('categories', { categories, booksByCategory });
    } catch (error) {
        console.error(error);
        res.redirect('/');
    }
});

// 📗 Books by category (Fix for slashes or spaces)
router.get('/categories/:category', async (req, res) => {
    try {
        const category = decodeURIComponent(req.params.category);
        const books = await Book.find({ category });
        res.render('books', { books, category });
    } catch (error) {
        console.error(error);
        res.redirect('/categories');
    }
});

// 🧾 About Us page
router.get('/about', (req, res) => {
    res.render('about');
});




// 🛒 View Cart
router.get('/cart', (req, res) => {
    const cart = req.session.cart || [];
    res.render('cart', { cart });
});

// 🛒 Add book to cart
router.post('/books/:id/buy', isLoggedIn, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).send('Book not found');

        if (!req.session.cart) req.session.cart = [];
        req.session.cart.push(book);

        res.redirect('/cart');
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).send('Server Error');
    }
});

// ❌ Remove book from cart
router.post('/cart/remove/:index', (req, res) => {
    if (req.session.cart) {
        req.session.cart.splice(req.params.index, 1);
    }
    res.redirect('/cart');
});

// ✅ Step 1: Go to checkout page (DO NOT clear cart here)
router.post('/cart/checkout', (req, res) => {
    const cart = req.session.cart || [];
    res.render('checkout', { cart });
});

// ✅ Step 2: Place order (NOW clear cart)
router.post('/place-order', async (req, res) => {
    try {
        const { name, phone, address, payment } = req.body;
        const cart = req.session.cart || [];

        // Prepare items
        const items = cart.map(book => ({
            title: book.title,
            price: book.price,
            quantity: 1
        }));

        // Calculate total
        const totalAmount = cart.reduce((sum, b) => sum + b.price, 0);

        // Save order
        const newOrder = new Order({
            name,
            phone,
            address,
            payment,
            items,
            totalAmount
        });

        await newOrder.save();

        // Clear cart AFTER saving
        req.session.cart = [];

        res.render('checkout-success');

    } catch (error) {
        console.error('Error saving order:', error);
        res.redirect('/cart');
    }
});

router.get('/orders', async (req, res) => {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.render('orders', { orders });
});




module.exports = router;
