require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const Family = require('./models/family');
const cors = require('cors');
const session = require('express-session');
const adminRoutes = require('./routes/admin');

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors({
  origin: `http://localhost:5000/sunmit-form`, // change to 3000 if your HTML runs there
  credentials: true
}));

app.use(session({
  secret: 'mysecretkey',
  resave: false,
  saveUninitialized: true
}));

// Static files
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/admin', adminRoutes);

// ✅ Multer setup for profile image and dynamic member fields
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads/'));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + path.extname(file.originalname);
    cb(null, file.fieldname + '-' + unique);
  }
});
const upload = multer({ storage });

// UPDATED Multer fields configuration to include dynamic member arrays
const cpUpload = upload.fields([
  { name: 'profileImage', maxCount: 1 }, // Main profile image
  { name: 'memberName[]', maxCount: 100 }, // Max 100 members, adjust as needed
  { name: 'memberRelation[]', maxCount: 100 },
  { name: 'memberAge[]', maxCount: 100 },
  { name: 'memberMaritalStatus[]', maxCount: 100 },
  { name: 'memberQualification[]', maxCount: 100 },
  { name: 'memberBloodGroup[]', maxCount: 100 },
  { name: 'memberOccupation[]', maxCount: 100 }
]);

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB error:", err));

// ✅ Serve index.html (frontend form)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html')); // make sure path is correct
});

// ✅ Handle form submission
app.post('/submit-form', cpUpload, async (req, res) => {
  try {
    console.log("🛬 Received form submission");
    console.log("Body:", req.body); // Now req.body should contain all text fields, including arrays from members
    console.log("Files:", req.files); // Now req.files should contain profileImage

    const {
      familyHead, gender, dob, phone, email, city, locality,
      occupation, gotra, nativePlace, bloodGroup, address,
      // Multer processes these array fields into simple arrays on req.body
      'memberName[]': memberName,
      'memberRelation[]': memberRelation,
      'memberAge[]': memberAge,
      'memberMaritalStatus[]': memberMaritalStatus,
      'memberQualification[]': memberQualification,
      'memberBloodGroup[]': memberBloodGroup,
      'memberOccupation[]': memberOccupation
    } = req.body;

    if (!dob || !email || !familyHead) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const members = [];

    // Correctly handle member data from arrays in req.body
    if (Array.isArray(memberName)) {
      memberName.forEach((name, i) => {
        members.push({
          name: name,
          relation: memberRelation[i],
          age: parseInt(memberAge[i]),
          maritalStatus: memberMaritalStatus[i],
          bloodGroup: memberBloodGroup[i],
          qualification: memberQualification[i],
          occupation: memberOccupation[i]
        });
      });
    } else if (memberName) { // Handle case with a single member (not an array)
        members.push({
            name: memberName,
            relation: memberRelation,
            age: parseInt(memberAge),
            maritalStatus: memberMaritalStatus,
            bloodGroup: memberBloodGroup,
            qualification: memberQualification,
            occupation: memberOccupation
        });
    }


    const newFamily = new Family({
      profileImage: req.files?.profileImage?.[0]?.path || '',
      familyHead,
      gender,
      dob: new Date(dob),
      phone,
      email,
      city,
      locality,
      occupation,
      gotra,
      nativePlace,
      bloodGroup,
      address,
      members,
      status: 'pending'
    });

    await newFamily.save();
    res.status(200).json({ message: '✅ Registered! Please wait for admin approval.' });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// ✅ Login (user)
app.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.render('login', { error: null });
});

app.post('/login', async (req, res) => {
  const { email, dob } = req.body;
  if (!email || !dob) {
    return res.render('login', { error: 'Email and DOB required' });
  }

  try {
    const user = await Family.findOne({ email, status: 'approved' });
    if (!user) return res.render('login', { error: 'User not approved or not found' });

    const inputDOB = new Date(dob).toISOString().split('T')[0];
    const storedDOB = new Date(user.dob).toISOString().split('T')[0];

    if (inputDOB !== storedDOB) {
      return res.render('login', { error: 'Incorrect DOB' });
    }

    req.session.user = {
      id: user._id,
      email: user.email,
      name: user.familyHead
    };
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('login', { error: 'Login failed' });
  }
});

// ✅ Dashboard
app.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('dashboard', { user: req.session.user });
});

// ✅ Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

// ✅ Admin Login View
app.get('/admin-login', (req, res) => {
  res.render('admin-login');
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
