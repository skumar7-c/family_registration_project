const express = require('express');
const router = express.Router();
const Family = require('../models/family');

router.post('/', async (req, res) => {
  const { email, dob } = req.body;

  try {
    if (!email || !dob) {
      return res.render('login', { error: 'Please enter email and DOB' });
    }

    // Parse incoming DOB (from input type="date") to string 'YYYY-MM-DD'
    const inputDob = new Date(dob).toISOString().split('T')[0];

    // Find user and compare only the date part
    const user = await Family.findOne({
      email: email.trim(),
      status: 'approved'
    });

    if (!user) {
      return res.render('login', { error: 'Incorrect email or DOB' });
    }

    const dbDob = new Date(user.dob).toISOString().split('T')[0];

    if (inputDob !== dbDob) {
      return res.render('login', { error: 'Incorrect email or DOB' });
    }

    // ✅ Login successful – store user in session if needed
    res.redirect('/dashboard.html'); // Or use res.render('dashboard', { user }) for EJS

  } catch (err) {
    console.error('Login error:', err);
    res.render('login', { error: 'Server error. Please try again.' });
  }
});

module.exports = router;
