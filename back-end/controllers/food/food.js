import Food from '../../models/food.js';

// Get all foods (paginated)
export const getAllFoods = async (req, res) => {
  try {
    console.log('getAllFoods called');
    console.log('Request user:', req.user);
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Query params for filtering
    const filter = {};
    
    try {
      // Handle both authenticated and non-authenticated cases
      if (req.user && (req.user.id || req.user._id)) {
        const userId = req.user.id || req.user._id.toString();
        // Return system foods or user's custom foods when authenticated
        filter.$or = [
          { isCustom: false },
          { isCustom: true, user: userId }
        ];
        console.log('Authenticated user filter:', JSON.stringify(filter));
      } else {
        // Only return public foods when not authenticated
        filter.isCustom = false;
        console.log('Public foods only filter:', JSON.stringify(filter));
      }
    } catch (filterError) {
      console.error('Error constructing filter:', filterError);
      // Default to public foods only if there's an error
      filter.isCustom = false;
    }
    
    // Optional name search
    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: 'i' };
    }
    
    try {
      console.log('Executing Food.find with filter:', JSON.stringify(filter));
      const foods = await Food.find(filter)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit);
      
      console.log(`Found ${foods.length} foods`);
      
      const total = await Food.countDocuments(filter);
      console.log(`Total foods count: ${total}`);
      
      return res.json({
        foods,
        page,
        pages: Math.ceil(total / limit),
        total
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({ message: 'Database error', error: dbError.message });
    }
  } catch (err) {
    console.error('getAllFoods error:', err);
    console.error('Error stack:', err.stack);
    return res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// Get food by ID
export const getFoodById = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }
    
    // If not authenticated or food is custom but not owned by user, restrict access
    if (food.isCustom && (!req.user || (req.user && food.user.toString() !== req.user.id))) {
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


export const bulkCreateFoods = async (req, res) => {
  try {
    const { foods, isCustom = true } = req.body;
    
    if (!Array.isArray(foods) || foods.length === 0) {
      return res.status(400).json({ message: 'Foods array is required and cannot be empty' });
    }
    
    // Limit the number of foods that can be created at once (optional)
    if (foods.length > 100) {
      return res.status(400).json({ message: 'Maximum 100 foods can be created at once' });
    }
    
    // Add user and isCustom to each food item
    const preparedFoods = foods.map(food => ({
      ...food,
      user:   req.user.id,
      isCustom
    }));
    
    // Insert many foods at once
    const createdFoods = await Food.insertMany(preparedFoods);
    
    return res.status(201).json({
      message: `Successfully created ${createdFoods.length} foods`,
      count: createdFoods.length,
      foods: createdFoods
    });
  } catch (err) {
    console.error(err.message);
    // Handle validation errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
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
    if (!food.isCustom || food.user.toString() !==  req.user.id) {
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
