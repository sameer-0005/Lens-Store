const Lens = require('../models/Lens');

// @desc    Get all lenses with optional filters
// @route   GET /api/lens
// @access  Private
const getLenses = async (req, res) => {
  try {
    const { sph, cyl, axis, addition, boxNumber } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (sph !== undefined && sph !== '') {
      filter.sph = parseFloat(sph);
    }
    if (cyl !== undefined && cyl !== '') {
      filter.cyl = parseFloat(cyl);
    }
    if (axis !== undefined && axis !== '') {
      filter.axis = parseInt(axis);
    }
    if (addition !== undefined && addition !== '') {
      filter.addition = parseFloat(addition);
    }
    if (boxNumber !== undefined && boxNumber !== '') {
      filter.boxNumber = boxNumber;
    }
    
    const lenses = await Lens.find(filter).sort({ createdAt: -1 });
    res.json(lenses);
  } catch (error) {
    console.error('Get lenses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/lens/stats
// @access  Private
const getStats = async (req, res) => {
  try {
    const totalLenses = await Lens.countDocuments();
    const lowStock = await Lens.countDocuments({ quantity: { $lt: 4, $gt: 0 } });
    const outOfStock = await Lens.countDocuments({ quantity: 0 });
    
    // Get unique box numbers count
    const uniqueBoxes = await Lens.distinct('boxNumber');
    const totalBoxes = uniqueBoxes.length;
    
    res.json({
      totalLenses,
      lowStock,
      outOfStock,
      totalBoxes,
      hasLowStock: lowStock > 0 || outOfStock > 0
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get low stock lenses (qty < 4)
// @route   GET /api/lens/low-stock
// @access  Private
const getLowStock = async (req, res) => {
  try {
    const lenses = await Lens.find({ quantity: { $lt: 4 } }).sort({ quantity: 1 });
    res.json(lenses);
  } catch (error) {
    console.error('Get low stock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single lens
// @route   GET /api/lens/:id
// @access  Private
const getLens = async (req, res) => {
  try {
    const lens = await Lens.findById(req.params.id);
    
    if (!lens) {
      return res.status(404).json({ message: 'Lens not found' });
    }
    
    res.json(lens);
  } catch (error) {
    console.error('Get lens error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Lens not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new lens (or update quantity if duplicate)
// @route   POST /api/lens
// @access  Private
const createLens = async (req, res) => {
  try {
    const { sph, cyl, axis, addition, boxNumber, quantity } = req.body;
    
    if (!boxNumber) {
      return res.status(400).json({ message: 'Box number is required' });
    }
    
    if (quantity === undefined || quantity === null) {
      return res.status(400).json({ message: 'Quantity is required' });
    }
    
    // Parse values
    const parsedSph = sph !== undefined && sph !== '' ? parseFloat(sph) : null;
    const parsedCyl = cyl !== undefined && cyl !== '' ? parseFloat(cyl) : null;
    const parsedAxis = axis !== undefined && axis !== '' ? parseInt(axis) : null;
    const parsedAddition = addition !== undefined && addition !== '' ? parseFloat(addition) : null;
    const parsedQuantity = parseInt(quantity);
    
    // Check for existing lens with same specs + box number
    const existingLens = await Lens.findOne({
      sph: parsedSph,
      cyl: parsedCyl,
      axis: parsedAxis,
      addition: parsedAddition,
      boxNumber: boxNumber
    });
    
    if (existingLens) {
      // Update quantity of existing lens
      existingLens.quantity += parsedQuantity;
      await existingLens.save();

      return res.status(200).json({
        ...existingLens.toObject(),
        message: `Quantity updated. Added ${parsedQuantity} to existing stock.`,
        updated: true
      });
    }
    
    // Create new lens if no duplicate found
    const lens = await Lens.create({
      sph: parsedSph,
      cyl: parsedCyl,
      axis: parsedAxis,
      addition: parsedAddition,
      boxNumber,
      quantity: parsedQuantity
    });
    
    res.status(201).json({ ...lens.toObject(), updated: false });
  } catch (error) {
    console.error('Create lens error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update lens
// @route   PUT /api/lens/:id
// @access  Private
const updateLens = async (req, res) => {
  try {
    const { sph, cyl, axis, addition, boxNumber, quantity } = req.body;
    
    let lens = await Lens.findById(req.params.id);
    
    if (!lens) {
      return res.status(404).json({ message: 'Lens not found' });
    }
    
    // Update fields
    lens.sph = sph !== undefined && sph !== '' ? parseFloat(sph) : null;
    lens.cyl = cyl !== undefined && cyl !== '' ? parseFloat(cyl) : null;
    lens.axis = axis !== undefined && axis !== '' ? parseInt(axis) : null;
    lens.addition = addition !== undefined && addition !== '' ? parseFloat(addition) : null;
    lens.boxNumber = boxNumber || lens.boxNumber;
    lens.quantity = quantity !== undefined ? parseInt(quantity) : lens.quantity;
    
    await lens.save();
    
    res.json(lens);
  } catch (error) {
    console.error('Update lens error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Lens not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete lens
// @route   DELETE /api/lens/:id
// @access  Private
const deleteLens = async (req, res) => {
  try {
    const lens = await Lens.findById(req.params.id);
    
    if (!lens) {
      return res.status(404).json({ message: 'Lens not found' });
    }
    
    await lens.deleteOne();
    
    res.json({ message: 'Lens removed' });
  } catch (error) {
    console.error('Delete lens error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Lens not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Adjust lens quantity
// @route   PATCH /api/lens/:id/quantity
// @access  Private
const adjustQuantity = async (req, res) => {
  try {
    const { adjustment } = req.body;
    
    if (adjustment === undefined || ![-2, -1, 1, 2].includes(adjustment)) {
      return res.status(400).json({ message: 'Invalid adjustment value. Use -2, -1, 1, or 2' });
    }
    
    const lens = await Lens.findById(req.params.id);
    
    if (!lens) {
      return res.status(404).json({ message: 'Lens not found' });
    }
    
    const newQuantity = lens.quantity + adjustment;
    
    if (newQuantity < 0) {
      return res.status(400).json({ message: 'Quantity cannot go below 0' });
    }
    
    lens.quantity = newQuantity;
    await lens.save();
    
    res.json({
      lens,
      warning: newQuantity < 4 ? 'Low stock warning: quantity is below 4' : null
    });
  } catch (error) {
    console.error('Adjust quantity error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Lens not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Bulk import lenses
// @route   POST /api/lens/import
// @access  Private
const importLenses = async (req, res) => {
  try {
    const { lenses } = req.body;
    
    if (!lenses || !Array.isArray(lenses) || lenses.length === 0) {
      return res.status(400).json({ message: 'No valid lenses to import' });
    }
    
    const results = {
      success: 0,
      errors: []
    };
    
    for (let i = 0; i < lenses.length; i++) {
      try {
        const item = lenses[i];
        
        await Lens.create({
          sph: item.sph !== undefined && item.sph !== '' && item.sph !== null ? parseFloat(item.sph) : null,
          cyl: item.cyl !== undefined && item.cyl !== '' && item.cyl !== null ? parseFloat(item.cyl) : null,
          axis: item.axis !== undefined && item.axis !== '' && item.axis !== null ? parseInt(item.axis) : null,
          addition: item.addition !== undefined && item.addition !== '' && item.addition !== null ? parseFloat(item.addition) : null,
          boxNumber: item.boxNumber,
          quantity: parseInt(item.quantity) || 0
        });
        
        results.success++;
      } catch (err) {
        results.errors.push({
          row: i + 1,
          error: err.message
        });
      }
    }
    
    res.json({
      message: `Imported ${results.success} lenses successfully`,
      ...results
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ message: 'Server error during import' });
  }
};

module.exports = {
  getLenses,
  getStats,
  getLowStock,
  getLens,
  createLens,
  updateLens,
  deleteLens,
  adjustQuantity,
  importLenses
};
