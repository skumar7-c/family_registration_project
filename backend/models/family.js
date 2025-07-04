const mongoose = require('mongoose');

// Family Member Schema
const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  relation: { type: String, required: true },
  age: { type: Number, required: true },
  maritalStatus: { type: String },
  bloodGroup: { type: String },
  qualification: { type: String },
  occupation: { type: String }
});

// Family Schema
const familySchema = new mongoose.Schema({
  profileImage: { type: String }, // path to the uploaded image
  familyHead: { type: String, required: true },
  gender: { type: String },
  dob: { type: Date, required: true },
  phone: { type: String },
  email: { type: String, required: true },
  city: { type: String },
  locality: { type: String },
  occupation: { type: String },
  gotra: { type: String },
  nativePlace: { type: String },
  bloodGroup: { type: String },
  address: { type: String },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  members: [memberSchema]
}, {
  timestamps: true
});

// Export the model
module.exports = mongoose.model('Family', familySchema);
