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

    const dobDate = new Date(dob);

    const user = await Family.findOne({
      email: email.trim(),
      dob: dobDate,
      status: 'approved'
    });

    if (!user) {
      return res.render('login', { error: 'Login failed. Please check your credentials.' });
    }

    res.redirect('/dashboard'); // Or wherever you want to go after login
  } catch (err) {
    console.error('Login Error:', err);
    res.render('login', { error: 'Something went wrong. Try again.' });
  }
});

module.exports = router;
