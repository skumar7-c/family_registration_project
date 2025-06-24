const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: String,
  relation: String,
  age: Number,
  maritalStatus: String,
  bloodGroup: String,
  qualification: String,
  occupation: String
});

const familySchema = new mongoose.Schema({
  profileImage: String,
  familyHead: String,
  gender: String,
  dob: Date,
  phone: String,
  email: String,
  city:String,
  locality: [String],
  occupation:[String],
  gotra:String,
  nativePlace: String,
  bloodGroup:[String],
  address:String,
  members: [memberSchema],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  isApproved: {
  type: Boolean,
  default: false
},
password: String
}, 
{ timestamps: true });

module.exports = mongoose.model('Family', familySchema);
