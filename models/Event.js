const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Event name is required'],
    trim: true,
    maxlength: [100, 'Event name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true
  },
  venue: {
    type: String,
    required: [true, 'Event venue is required'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  time: {
    type: String,
    required: [true, 'Event time is required']
  },
   price: {
    type: Number,
    required: [true, 'Event price is required. Use 0 for free events.'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Event category is required'],
    enum: {
      values: [
        'Corporate Event',
        'Social Event',
        'Sports Event',
        'Cultural Event',
        'Educational Event',
        'Entertainment Event'
      ],
      message: 'Please select a valid event category'
    }
  },
  image: {
    type: String,
    required: [true, 'Event image is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Event', eventSchema);