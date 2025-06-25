const express = require('express');
const router = express.Router();
const Family = require('../models/family');

// POST /login - validate email + dob
router.post('/', async (req, res) => {
  const { email, dob } = req.body;

  try {
    // Convert 'dd-mm-yyyy' to a Date
    const [day, month, year] = dob.split('-');
    const dobDate = new Date(${year}-${month}-${day});

    // Find approved user
    const user = await Family.findOne({
      email: email.trim(),
      dob: { $eq: dobDate },
      status: 'approved'
    });

    if (!user) {
      return res.render('login', { error: 'Login failed. Please try again.' });
    }

    // Successful login
    return res.redirect('/dashboard'); // or wherever you want to redirect
  } catch (err) {
    console.error('Login Error:', err);
    res.render('login', { error: 'Something went wrong. Try again.' });
  }
});

module.exports = router;
