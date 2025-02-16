const express = require('express');
const Task = require('../models/Task');

const router = express.Router();

const isAuthenticated = (req, res, next) => {
    if (!req.session.user || !req.session.user._id) {
        console.error("Unauthorized access attempt.");
        req.flash('error', 'You must be logged in.');
        return res.redirect('/auth/login');
    }
    next();
};

router.get('/', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user._id;
        let filter = { user: userId };

        if (req.query.status === 'completed') {
            filter.completed = true;
        } else if (req.query.status === 'pending') {
            filter.completed = false;
        }

        if (req.query.search) {
            filter.title = { $regex: req.query.search, $options: 'i' };
        }

        const sortOption = req.query.sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };

        const tasks = await Task.find(filter).sort(sortOption).lean();
        console.log("Retrieved Tasks:", tasks);

        res.render('tasks', { 
            tasks, 
            user: req.session.user 
        });
    } catch (err) {
        console.error("Error retrieving tasks:", err);
        req.flash('error', 'Error retrieving tasks.');
        res.redirect('/');
    }
});

router.post('/', isAuthenticated, async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!title || !description) {
            req.flash('error', '⚠️ Fill in all fields!');
            return res.redirect('/');
        }

        const userId = req.session.user._id;
        console.log("Creating task for user:", userId);

        const task = new Task({
            title,
            description,
            user: userId
        });

        await task.save();
        req.flash('success', 'Task created successfully!');
        res.redirect('/');
    } catch (err) {
        console.error("Error creating task:", err);
        req.flash('error', 'Error creating task.');
        res.redirect('/');
    }
});

router.put('/:id', isAuthenticated, async (req, res) => {
    try {
        const { title, description, completed } = req.body;

        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            {
                title,
                description,
                completed: completed === 'on' || completed === 'true'
            },
            { new: true }
        );

        if (!updatedTask) {
            req.flash('error', 'Task not found.');
            return res.redirect('/');
        }

        console.log(`Task Updated: ${updatedTask}`);
        req.flash('success', 'Task updated successfully!');
        res.redirect('/');
    } catch (err) {
        console.error("Error updating task:", err);
        req.flash('error', 'Error updating task.');
        res.redirect('/');
    }
});

router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        console.log(`Task Deleted: ${req.params.id}`);
        req.flash('success', 'Task deleted successfully!');
        res.redirect('/');
    } catch (err) {
        console.error("Error deleting task:", err);
        req.flash('error', 'Error deleting task.');
        res.redirect('/');
    }
});

module.exports = router;
