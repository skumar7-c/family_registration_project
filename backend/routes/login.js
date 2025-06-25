const express = require('express');
const router = express.Router();
const Family = require('../models/family');

router.post('/', async (req, res) => {
  const { email, dob } = req.body;

  try {
    if (!email || !dob) {
      return res.render('login', { error: 'Please enter email and DOB' });
    }

    const dobDate = new Date(dob);

    const user = await Family.findOne({
      email: email.trim(),
      dob: dobDate,
      status: 'approved'
    });

    if (!user) {
      return res.render('login', { error: 'Incorrect email or DOB' });
    }

    // ✅ Login successful – you can also store session here if needed
    res.redirect('/dashboard.html'); // Change to res.render('dashboard') if you're using EJS
  } catch (err) {
    console.error('Login error:', err);
    res.render('login', { error: 'Server error. Please try again.' });
  }
});

module.exports = router;
