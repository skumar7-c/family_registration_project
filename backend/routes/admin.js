const express = require('express');
const router = express.Router();
const Family = require('../models/family');
const sendEmail = require('../utils/sendEmail'); // Make sure this file exists

// ✅ 1. Render the Admin Panel (admin.ejs)
router.get('/', (req, res) => {
  res.render('admin'); // admin.ejs must be inside /views folder
});

// ✅ 2. API: Get list of families (for fetch() in admin.ejs)
router.get('/families', async (req, res) => {
  try {
    const families = await Family.find().sort({ createdAt: -1 });
    res.json(families);
  } catch (error) {
    console.error("❌ Error fetching families:", error);
    res.status(500).json({ error: 'Failed to fetch families' });
  }
});

// ✅ 3. API: Update status (approve/reject) with email
router.post('/families/:id/:status', async (req, res) => {
  const { id, status } = req.params;

  try {
    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const family = await Family.findById(id);
    if (!family) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update status
    family.status = status;
    await family.save();

    // Send email if email exists
    if (family.email) {
      const subject = `Registration ${status === 'approved' ? 'Approved ✅' : 'Rejected ❌'}`;
      const loginLink = 'http://localhost:5000/login'; // update if needed

      const message =
        status === 'approved'
          ? `Hi ${family.familyHead},\n\nYour registration has been approved! 🎉\n Your username is email address and password is date of birth. \n\nYou can now login here:\n${loginLink}`
          : `Hi ${family.familyHead},\n\nWe regret to inform you that your registration has been rejected.\n\nThank you for your interest.`;

      await sendEmail(family.email, subject, message);
    }

    res.send(`✅ User status updated to '${status}' and email sent.`);
  } catch (err) {
    console.error("❌ Error updating status or sending email:", err);
    res.status(500).json({ error: 'Failed to update status or send email' });
  }
});

module.exports = router;
