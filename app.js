const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const path = require('path');
const session = require('express-session'); // ✅ Only one declaration
const app = express();
const book = require('./models/book');
require("dotenv").config();


// MongoDB Connection -  database

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => {
    console.error("❌ MongoDB Connection Failed:", err);
});

// Check connection
const db = mongoose.connection;

db.on('error', (error) => {
    console.error('❌ MongoDB connection error:', error);
});

db.once('open', function() {
    console.log('✅ Connected to MongoDB successfully!');
    console.log('📚 Database: bookstore');
});

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// ✅ Session middleware (only once, here)
app.use(session({
    secret: 'bookstore',
    resave: false,
    saveUninitialized: true
}));

app.use((req, res, next) => {
    res.locals.currentUser = req.session.user;
    next();
});

app.use((req, res, next) => {
    res.locals.currentUser = req.session.user || null;
    next();
});


// Routes
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');

app.use('/', authRoutes);
app.use('/', bookRoutes);

// Home route
app.get('/', (req, res) => {
    res.render('index');
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 Online Bookstore is ready!`);
});


// html
app.get('/mobile', (req, res) => {
    res.sendFile(__dirname + '/public/mobile.html');
});

// GET all books (API)
app.get('/api/books', async (req, res) => {
    const books = await book.find();
    res.json(books);
});

// GET single book
app.get('/api/books/:id', async (req, res) => {
    const book = await book.findById(req.params.id);
    res.json(book);
});


// cart
app.post('/cart/checkout', (req, res) => {
    res.render('checkout');
});

app.get('/cart', (req, res) => {
    res.render('cart', { cart: req.session.cart || [] });
});


app.post('/place-order', (req, res) => {
    const { name, phone, address, payment } = req.body;

    console.log({ name, phone, address, payment });

    // You can later save this in DB
    res.send("✅ Order placed successfully!");
});







