require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(flash());

app.set('view engine', 'ejs');

app.use(session({
    secret: process.env.SESSION_SECRET || 'secretkey',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 3600000 }
}));

const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    res.locals.successMessage = req.flash('success');
    res.locals.errorMessage = req.flash('error');
    next();
});

app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        req.flash('error', 'Invalid CSRF token. Please try again.');
        return res.redirect('back');
    }
    next(err);
});

const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
    console.error("Error: MONGO_URI is missing in .env file");
    process.exit(1);
}
mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error("MongoDB Connection Error:", err));

const User = require('./models/User');
const Task = require('./models/Task');

const authenticate = (req, res, next) => {
    if (!req.session.user) {
        req.flash('error', 'You must be logged in.');
        return res.redirect('/auth/login');
    }
    next();
};

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

app.use('/auth', authRoutes);
app.use('/tasks', authenticate, taskRoutes);

app.get('/', authenticate, async (req, res) => {
    try {
        console.log("Session User:", req.session.user);
        if (!req.session.user || !req.session.user._id) {
            console.error("ERROR: No user found in session.");
            req.flash('error', 'Please log in again.');
            return res.redirect('/auth/login');
        }

        const userId = new mongoose.Types.ObjectId(req.session.user._id);
        let filter = { user: userId };

        const { status, search, sort } = req.query;

        if (status === 'completed') {
            filter.completed = true;
        } else if (status === 'pending') {
            filter.completed = false;
        }

        if (search) {
            filter.title = { $regex: search, $options: 'i' };
        }

        const sortOption = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };

        const tasks = await Task.find(filter).sort(sortOption).lean();
        console.log("Retrieved Tasks:", tasks);

        res.render('tasks', { 
            tasks, 
            user: req.session.user, 
            search,
            status,
            sort,
            csrfToken: req.csrfToken()
        });
    } catch (error) {
        console.error("Error fetching tasks:", error);
        req.flash('error', 'Error retrieving tasks.');
        res.redirect('/');
    }
});

app.get('/auth/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login');
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
