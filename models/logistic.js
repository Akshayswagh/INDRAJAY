const mongoose = require('mongoose');

const logisticSchema = new mongoose.Schema({
  pickup: {
    type: {
      address: { type: String, required: true },
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    required: true
  },
  delivery: {
    type: {
      address: { type: String, required: true },
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    required: true
  },
  distance: {
    type: String,
    required: true
  },
  estimatedFare: {
    type: String,
    required: true
  },
  truck: {
    type: String,
    required: true
  },
  goodsType: {
    type: String,
    required: true
  },
  weight: {
    type: Number,
    required: true
  },
  weightUnit: {
    type: String,
    required: true,
    enum: ['kg', 'ton']
  },
  mobile: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'confirmed', 'spam', 'cancelled'] // Added more states
  }
});

module.exports = mongoose.model('Logistic', logisticSchema);