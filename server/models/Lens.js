const mongoose = require('mongoose');

const lensSchema = new mongoose.Schema({
  sph: {
    type: Number,
    default: null,
    validate: {
      validator: function(v) {
        return v === null || (v >= -20 && v <= 20);
      },
      message: 'SPH must be between -20.00 and +20.00'
    }
  },
  cyl: {
    type: Number,
    default: null,
    validate: {
      validator: function(v) {
        return v === null || (v >= -6 && v <= 6);
      },
      message: 'CYL must be between -6.00 and +6.00'
    }
  },
  axis: {
    type: Number,
    default: null,
    validate: {
      validator: function(v) {
        return v === null || (Number.isInteger(v) && v >= 0 && v <= 180);
      },
      message: 'Axis must be an integer between 0 and 180'
    }
  },
  addition: {
    type: Number,
    default: null,
    validate: {
      validator: function(v) {
        return v === null || (v >= 0.75 && v <= 4);
      },
      message: 'Addition must be between +0.75 and +4.00'
    }
  },
  boxNumber: {
    type: String,
    required: [true, 'Box number is required'],
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
lensSchema.index({ boxNumber: 1 });
lensSchema.index({ quantity: 1 });
lensSchema.index({ sph: 1, cyl: 1, axis: 1, addition: 1 });

module.exports = mongoose.model('Lens', lensSchema);
