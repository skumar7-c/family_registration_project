const express = require('express');
const router = express.Router();
const Family = require('../models/family');

// POST /login - validate email + dob
router.post('/', async (req, res) => {
  const { email, dob } = req.body;

  try {
    console.log("🔍 Email from form:", email);
    console.log("🔍 DOB from form:", dob);

    if (!email || !dob) {
      console.log("❌ Missing email or DOB");
      return res.render('login', { error: 'Please enter both email and date of birth.' });
    }

    const dobDate = new Date(dob);
    console.log("🗓️ Parsed DOB as Date:", dobDate);

    const user = await Family.findOne({
      email: email.trim(),
      dob: dobDate,
      status: 'approved'
    });

    console.log("🔎 DB result:", user);

    if (!user) {
      return res.render('login', { error: 'Login failed. Please try again.' });
    }

    res.redirect('/dashboard');
  } catch (err) {
    console.error('❌ Login Error:', err);
    res.render('login', { error: 'Something went wrong. Try again.' });
  }
});

module.exports = router;
