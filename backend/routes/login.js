// routes/login.js
const express = require('express');
const router = express.Router();
const Family = require('../models/family');

// POST /login - validate email + dob
router.post('/', async (req, res) => {
  const { email, dob } = req.body;

  try {
    if (!email || !dob) {
      return res.render('login', { error: 'Please enter both email and date of birth.' });
    }

    // Convert input DOB string to Date (input is in YYYY-MM-DD format)
    const dobDate = new Date(dob);

    // Match user from DB with status approved
    const user = await Family.findOne({
      email: email.trim(),
      dob: { $eq: dobDate },
      status: 'approved'
    });

    if (!user) {
      return res.render('login', { error: 'Login failed. Please try again.' });
    }

    // ✅ Successful login
    res.redirect('/dashboard'); // or wherever your protected page is
  } catch (err) {
    console.error('Login Error:', err);
    res.render('login', { error: 'Something went wrong. Try again.' });
  }
});

module.exports = router;
