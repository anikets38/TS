const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Nutrition data for different age groups
const NUTRITION_GUIDE = {
    '0-6': {
        title: '0-6 Months: Exclusive Milk Feeding',
        description: 'Breast milk or formula provides all necessary nutrients. No solid foods or water needed.',
        foods: [
            {
                category: 'Primary Nutrition',
                icon: '🍼',
                items: [
                    { emoji: '🤱', name: 'Breast Milk', benefit: 'Best source of nutrition, antibodies, perfect temperature' },
                    { emoji: '🍼', name: 'Iron-Fortified Formula', benefit: 'Complete nutrition if breastfeeding not possible' },
                    { emoji: '💧', name: 'No Water Needed', benefit: 'Milk provides adequate hydration' }
                ]
            }
        ],
        avoid: [
            'Solid foods before 6 months',
            'Honey (botulism risk)',
            'Cow\'s milk as main drink',
            'Water (except as advised by doctor)',
            'Juice or sweetened beverages'
        ],
        tips: [
            { title: 'Feeding Frequency', description: 'Feed 8-12 times per day (every 2-3 hours)' },
            { title: 'Watch for Hunger Cues', description: 'Rooting, sucking on hands, fussiness' },
            { title: 'Burp Regularly', description: 'After each feeding to prevent gas' }
        ],
        sampleMealPlan: [
            { time: 'Every 2-3 hours', items: 'Breast milk or formula (2-4 oz per feeding)' }
        ]
    },
    '6-8': {
        title: '6-8 Months: Introduction to Solid Foods',
        description: 'Start introducing pureed foods while continuing breast milk or formula.',
        foods: [
            {
                category: 'First Foods',
                icon: '🥄',
                items: [
                    { emoji: '🥣', name: 'Iron-Fortified Cereals', benefit: 'Rice, oatmeal - mix with breast milk/formula' },
                    { emoji: '🥕', name: 'Pureed Vegetables', benefit: 'Carrots, sweet potatoes, peas, squash' },
                    { emoji: '🍎', name: 'Pureed Fruits', benefit: 'Apples, pears, bananas, avocado' },
                    { emoji: '🍗', name: 'Pureed Meats', benefit: 'Chicken, turkey - iron source' }
                ]
            },
            {
                category: 'Continue Milk',
                icon: '🍼',
                items: [
                    { emoji: '🤱', name: 'Breast Milk', benefit: 'Still primary nutrition source' },
                    { emoji: '🍼', name: 'Formula', benefit: '24-32 oz per day' }
                ]
            }
        ],
        avoid: [
            'Honey (until 12 months)',
            'Whole cow\'s milk as main drink',
            'Choking hazards (nuts, popcorn, grapes)',
            'Added salt or sugar',
            'Egg whites (allergies)'
        ],
        tips: [
            { title: 'Start Slowly', description: 'Begin with 1-2 tablespoons once a day' },
            { title: 'One Food at a Time', description: 'Wait 3-5 days before introducing new foods to watch for allergies' },
            { title: 'Texture Matters', description: 'Smooth purees first, gradually increase thickness' }
        ],
        sampleMealPlan: [
            { time: 'Morning', items: 'Breast milk/formula + 2 tbsp iron-fortified cereal' },
            { time: 'Midday', items: 'Breast milk/formula + 2 tbsp pureed vegetables' },
            { time: 'Evening', items: 'Breast milk/formula + 2 tbsp pureed fruits' },
            { time: 'Throughout Day', items: 'Breast milk/formula every 3-4 hours' }
        ]
    },
    '8-12': {
        title: '8-12 Months: Expanding Variety',
        description: 'Introduce more textures and finger foods. Continue breast milk or formula.',
        foods: [
            {
                category: 'Proteins',
                icon: '🍗',
                items: [
                    { emoji: '🥚', name: 'Eggs', benefit: 'Scrambled or hard-boiled' },
                    { emoji: '🍗', name: 'Poultry', benefit: 'Chicken, turkey - diced small' },
                    { emoji: '🐟', name: 'Fish', benefit: 'Salmon, cod - boneless, flaked' },
                    { emoji: '🫘', name: 'Legumes', benefit: 'Beans, lentils - mashed' }
                ]
            },
            {
                category: 'Grains',
                icon: '🍞',
                items: [
                    { emoji: '🍞', name: 'Bread', benefit: 'Whole grain, cut small' },
                    { emoji: '🍝', name: 'Pasta', benefit: 'Small shapes, well-cooked' },
                    { emoji: '🍚', name: 'Rice', benefit: 'Soft-cooked' }
                ]
            },
            {
                category: 'Dairy',
                icon: '🧀',
                items: [
                    { emoji: '🧀', name: 'Cheese', benefit: 'Mild varieties, shredded or cubed' },
                    { emoji: '🥛', name: 'Yogurt', benefit: 'Plain, full-fat' }
                ]
            },
            {
                category: 'Fruits & Vegetables',
                icon: '🥦',
                items: [
                    { emoji: '🥦', name: 'Soft Vegetables', benefit: 'Cooked broccoli, carrots, green beans' },
                    { emoji: '🍌', name: 'Soft Fruits', benefit: 'Banana, melon, berries (cut small)' }
                ]
            }
        ],
        avoid: [
            'Honey (until 12 months)',
            'Whole nuts (choking hazard)',
            'Raw vegetables',
            'Large pieces of food',
            'Added salt or sugar'
        ],
        tips: [
            { title: 'Encourage Self-Feeding', description: 'Offer finger foods baby can pick up' },
            { title: 'Variety is Key', description: 'Introduce different flavors and textures' },
            { title: 'Family Meals', description: 'Let baby join family meals for social eating' }
        ],
        sampleMealPlan: [
            { time: 'Breakfast', items: 'Oatmeal with mashed banana + breast milk/formula' },
            { time: 'Mid-Morning', items: 'Breast milk/formula' },
            { time: 'Lunch', items: 'Soft vegetables, diced chicken, rice + water' },
            { time: 'Afternoon', items: 'Yogurt with soft fruit + breast milk/formula' },
            { time: 'Dinner', items: 'Pasta with cheese, steamed broccoli + water' },
            { time: 'Before Bed', items: 'Breast milk/formula' }
        ]
    },
    '12+': {
        title: '12+ Months: Family Foods',
        description: 'Transition to family meals with healthy variety. Can start whole milk.',
        foods: [
            {
                category: 'Proteins',
                icon: '🥩',
                items: [
                    { emoji: '🥩', name: 'Lean Meats', benefit: 'Beef, pork, lamb - tender cuts' },
                    { emoji: '🍗', name: 'Poultry', benefit: 'Chicken, turkey' },
                    { emoji: '🐟', name: 'Fish', benefit: 'Variety of fish, boneless' },
                    { emoji: '🥚', name: 'Eggs', benefit: 'Any style' },
                    { emoji: '🫘', name: 'Beans', benefit: 'All varieties' }
                ]
            },
            {
                category: 'Dairy',
                icon: '🥛',
                items: [
                    { emoji: '🥛', name: 'Whole Milk', benefit: '16-24 oz per day (after 12 months)' },
                    { emoji: '🧀', name: 'Cheese', benefit: 'Various types' },
                    { emoji: '🥛', name: 'Yogurt', benefit: 'Plain or low-sugar varieties' }
                ]
            },
            {
                category: 'Grains',
                icon: '🍞',
                items: [
                    { emoji: '🍞', name: 'Whole Grain Bread', benefit: 'Toast, sandwiches' },
                    { emoji: '🍝', name: 'Pasta', benefit: 'Various shapes' },
                    { emoji: '🍚', name: 'Rice', benefit: 'Brown or white' },
                    { emoji: '🥣', name: 'Cereals', benefit: 'Low-sugar options' }
                ]
            },
            {
                category: 'Fruits & Vegetables',
                icon: '🥗',
                items: [
                    { emoji: '🥗', name: 'All Vegetables', benefit: 'Cooked or raw (age-appropriate)' },
                    { emoji: '🍎', name: 'All Fruits', benefit: 'Fresh, cut appropriately' }
                ]
            }
        ],
        avoid: [
            'Choking hazards (whole grapes, nuts, popcorn)',
            'Excessive juice or sweetened drinks',
            'Foods high in salt or sugar',
            'Unpasteurized dairy or juice',
            'Raw or undercooked eggs/meat'
        ],
        tips: [
            { title: 'Balanced Meals', description: 'Include protein, grains, fruits/vegetables' },
            { title: 'Limit Milk', description: 'Too much milk can reduce appetite for solids' },
            { title: 'Healthy Snacks', description: 'Offer nutritious snacks between meals' },
            { title: 'Stay Hydrated', description: 'Offer water throughout the day' }
        ],
        sampleMealPlan: [
            { time: 'Breakfast', items: 'Scrambled eggs, whole grain toast, fruit, milk' },
            { time: 'Mid-Morning Snack', items: 'Yogurt with berries, water' },
            { time: 'Lunch', items: 'Turkey sandwich, carrot sticks, cheese, milk' },
            { time: 'Afternoon Snack', items: 'Apple slices with peanut butter, water' },
            { time: 'Dinner', items: 'Grilled chicken, rice, steamed vegetables, water' },
            { time: 'Before Bed', items: 'Small snack if needed, water' }
        ]
    }
};

// @route   GET /api/nutrition/guide
// @desc    Get all nutrition guide data
// @access  Public
router.get('/guide', (req, res) => {
    try {
        res.json({
            success: true,
            data: NUTRITION_GUIDE
        });
    } catch (error) {
        console.error('Error fetching nutrition guide:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching nutrition guide'
        });
    }
});

// @route   GET /api/nutrition/guide/:ageGroup
// @desc    Get nutrition guide for specific age group
// @access  Public
router.get('/guide/:ageGroup', (req, res) => {
    try {
        const { ageGroup } = req.params;
        const data = NUTRITION_GUIDE[ageGroup];

        if (!data) {
            return res.status(404).json({
                success: false,
                message: 'Age group not found'
            });
        }

        res.json({
            success: true,
            data: data
        });
    } catch (error) {
        console.error('Error fetching nutrition guide:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching nutrition guide'
        });
    }
});

// @route   GET /api/nutrition/recommendations/:babyId
// @desc    Get age-appropriate nutrition recommendations for a baby
// @access  Private
router.get('/recommendations/:babyId', protect, async (req, res) => {
    try {
        const Baby = require('../models/Baby');
        const baby = await Baby.findOne({
            _id: req.params.babyId,
            parent: req.user._id
        });

        if (!baby) {
            return res.status(404).json({
                success: false,
                message: 'Baby not found'
            });
        }

        // Determine age group based on baby's age
        const ageInMonths = baby.ageInMonths || 0;
        let ageGroup;

        if (ageInMonths < 6) {
            ageGroup = '0-6';
        } else if (ageInMonths < 8) {
            ageGroup = '6-8';
        } else if (ageInMonths < 12) {
            ageGroup = '8-12';
        } else {
            ageGroup = '12+';
        }

        const recommendations = NUTRITION_GUIDE[ageGroup];

        res.json({
            success: true,
            data: {
                baby: {
                    name: baby.name,
                    ageInMonths: ageInMonths
                },
                ageGroup: ageGroup,
                recommendations: recommendations
            }
        });
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching recommendations'
        });
    }
});

module.exports = router;
