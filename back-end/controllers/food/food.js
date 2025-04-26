import Food from '../../models/food.js';

// Get all foods (paginated)
export const getAllFoods = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Query params for filtering
    const filter = {};
    
    // Only return system foods or user's custom foods
    filter.$or = [
      { isCustom: false },
      { isCustom: true, user: req.user.id }
    ];
    
    // Optional name search
    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: 'i' };
    }
    
    const foods = await Food.find(filter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);
      
    const total = await Food.countDocuments(filter);
    
    return res.json({
      foods,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ message: 'Server Error' });
  }
};

// Get food by ID
export const getFoodById = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }
    
    // Check if user has access to this food
    if (food.isCustom && food.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    return res.json(food);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Food not found' });
    }
    return res.status(500).json({ message: 'Server Error' });
  }
};

// Create a new custom food
export const createFood = async (req, res) => {
  try {
    const {
      name,
      calories,
      protein,
      carbs,
      fat,
      servingSize,
      fiber,
      sugar,
      sodium
    } = req.body;
    
    // Create new food object
    const newFood = new Food({
      name,
      calories,
      protein,
      carbs,
      fat,
      servingSize,
      fiber,
      sugar,
      sodium,
      user: req.user.id,
      isCustom: true
    });
    
    const food = await newFood.save();
    return res.json(food);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ message: 'Server Error' });
  }
};

// Update an existing custom food
export const updateFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }
    
    // Check if user owns this food
    if (!food.isCustom || food.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    // Update fields
    const {
      name,
      calories,
      protein,
      carbs,
      fat,
      servingSize,
      fiber,
      sugar,
      sodium
    } = req.body;
    
    // Use object assignment for cleaner updates
    Object.assign(food, {
      ...(name && { name }),
      ...(calories !== undefined && { calories }),
      ...(protein !== undefined && { protein }),
      ...(carbs !== undefined && { carbs }),
      ...(fat !== undefined && { fat }),
      ...(servingSize && { servingSize }),
      ...(fiber !== undefined && { fiber }),
      ...(sugar !== undefined && { sugar }),
      ...(sodium !== undefined && { sodium })
    });
    
    await food.save();
    return res.json(food);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Food not found' });
    }
    return res.status(500).json({ message: 'Server Error' });
  }
};

// Delete a custom food
export const deleteFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }
    
    // Check if user owns this food
    if (!food.isCustom || food.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    await food.deleteOne();
    return res.json({ message: 'Food removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Food not found' });
    }
    return res.status(500).json({ message: 'Server Error' });
  }
};
