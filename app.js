const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const path = require('path');
const session = require('express-session');
const app = express();
const Book = require('./models/Book');
require("dotenv").config();

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => {
    console.error("❌ MongoDB Connection Failed:", err);
});

const db = mongoose.connection;

db.on('error', (error) => {
    console.error('❌ MongoDB connection error:', error);
});

db.once('open', function() {
    console.log('✅ Connected to MongoDB successfully!');
    console.log('📚 Database: Bookstore');
});

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Session middleware
app.use(session({
    secret: 'bookstore',
    resave: false,
    saveUninitialized: true
}));

// ✅ Single currentUser middleware (removed duplicate)
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

// ✅ Fixed PORT for Render deployment
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 Online Bookstore is ready!`);
});

// HTML mobile route
app.get('/mobile', (req, res) => {
    res.sendFile(__dirname + '/public/mobile.html');
});

// ✅ Fixed: renamed local var to avoid shadowing Book model
app.get('/api/books', async (req, res) => {
    const books = await Book.find();
    res.json(books);
});

app.get('/api/books/:id', async (req, res) => {
    const foundBook = await Book.findById(req.params.id);
    res.json(foundBook);
});