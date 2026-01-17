// ================================
// APPLICATION CONFIGURATION
// ================================

const CONFIG = {
    // API Configuration
    API_BASE_URL: 'http://localhost:5000/api',
    N8N_WEBHOOK_URL: 'http://localhost:5678/webhook/carebuddy-agent',
    
    // App Settings
    APP_NAME: 'CareNest AI',
    APP_VERSION: '1.0.0',
    
    // Feature Flags
    FEATURES: {
        AI_ASSISTANT: true,
        VACCINATION_REMINDERS: true,
        NUTRITION_GUIDE: true,
        PREGNANCY_TRACKER: true,
        BABY_TRACKING: true,
        DISEASE_AWARENESS: true,
    },
    
    // Storage Keys
    STORAGE_KEYS: {
        TOKEN: 'token',
        USER: 'user',
        BABY_PROFILE: 'babyProfile',
        THEME: 'theme',
    },
    
    // Vaccination Schedule (Age in weeks)
    VACCINATION_SCHEDULE: [
        { name: 'BCG', age: 0, description: 'Bacillus Calmette-Guérin (Tuberculosis)' },
        { name: 'Hepatitis B - Birth Dose', age: 0, description: 'First dose at birth' },
        { name: 'OPV 0', age: 0, description: 'Oral Polio Vaccine (Birth dose)' },
        { name: 'Hepatitis B - 1', age: 6, description: 'First dose after birth' },
        { name: 'DTP 1', age: 6, description: 'Diphtheria, Tetanus, Pertussis' },
        { name: 'IPV 1', age: 6, description: 'Inactivated Polio Vaccine' },
        { name: 'Hib 1', age: 6, description: 'Haemophilus influenzae type B' },
        { name: 'PCV 1', age: 6, description: 'Pneumococcal Conjugate Vaccine' },
        { name: 'Rotavirus 1', age: 6, description: 'Rotavirus Vaccine' },
        { name: 'Hepatitis B - 2', age: 10, description: 'Second dose' },
        { name: 'DTP 2', age: 10, description: 'Second dose' },
        { name: 'IPV 2', age: 10, description: 'Second dose' },
        { name: 'Hib 2', age: 10, description: 'Second dose' },
        { name: 'PCV 2', age: 10, description: 'Second dose' },
        { name: 'Rotavirus 2', age: 10, description: 'Second dose' },
        { name: 'Hepatitis B - 3', age: 14, description: 'Third dose' },
        { name: 'DTP 3', age: 14, description: 'Third dose' },
        { name: 'IPV 3', age: 14, description: 'Third dose' },
        { name: 'Hib 3', age: 14, description: 'Third dose' },
        { name: 'PCV 3', age: 14, description: 'Third dose' },
        { name: 'Rotavirus 3', age: 14, description: 'Third dose' },
        { name: 'MMR 1', age: 52, description: 'Measles, Mumps, Rubella (1 year)' },
        { name: 'Varicella 1', age: 52, description: 'Chickenpox (1 year)' },
    ],
    
    // Nutrition Guidelines by Age (in months)
    NUTRITION_GUIDE: {
        '0-6': {
            title: '0-6 Months: Exclusive Milk',
            description: 'During the first 6 months, babies need only breast milk or formula.',
            foods: [
                {
                    category: 'Primary Nutrition',
                    icon: '🍼',
                    items: [
                        { name: 'Breast Milk', emoji: '👶', benefit: 'Best nutrition with antibodies' },
                        { name: 'Formula Milk', emoji: '🍼', benefit: 'Complete alternative to breast milk' }
                    ]
                }
            ],
            avoid: [
                'Any solid foods',
                'Water (not needed if exclusively breastfed)',
                'Honey (risk of botulism)',
                'Cow milk (difficult to digest)'
            ],
            tips: [
                { title: 'Feed on Demand', description: 'Respond to baby\'s hunger cues rather than a schedule' },
                { title: 'Burp After Feeding', description: 'Help prevent gas and discomfort' },
                { title: 'Monitor Wet Diapers', description: '6-8 wet diapers daily indicates good hydration' }
            ],
            sampleMealPlan: [
                { time: 'Every 2-3 hours', items: 'Breast milk or formula (on demand)' }
            ]
        },
        '6-8': {
            title: '6-8 Months: Starting Solids',
            description: 'Introduce solid foods while continuing breast milk or formula.',
            foods: [
                {
                    category: 'First Foods',
                    icon: '🥣',
                    items: [
                        { name: 'Rice Cereal', emoji: '🍚', benefit: 'Iron-fortified, easy to digest' },
                        { name: 'Pureed Vegetables', emoji: '🥕', benefit: 'Carrots, sweet potato, pumpkin' },
                        { name: 'Mashed Fruits', emoji: '🍌', benefit: 'Banana, apple, pear' },
                        { name: 'Dal Water', emoji: '🥘', benefit: 'Protein-rich introduction' }
                    ]
                },
                {
                    category: 'Proteins',
                    icon: '🍖',
                    items: [
                        { name: 'Moong Dal', emoji: '🫘', benefit: 'Easy to digest protein' },
                        { name: 'Pureed Chicken', emoji: '🍗', benefit: 'Iron and protein' }
                    ]
                }
            ],
            avoid: [
                'Honey (until 12 months)',
                'Cow milk as main drink',
                'Nuts and seeds (choking hazard)',
                'Citrus fruits (may cause rash)',
                'Salt and sugar'
            ],
            tips: [
                { title: 'Single Ingredient Rule', description: 'Introduce one new food at a time, wait 3 days' },
                { title: 'Watch for Allergies', description: 'Look for rash, vomiting, or diarrhea' },
                { title: 'Continue Milk', description: 'Breast milk or formula is still primary nutrition' }
            ],
            sampleMealPlan: [
                { time: 'Morning', items: 'Breast milk/formula' },
                { time: 'Mid-morning', items: '2-3 tbsp rice cereal or pureed fruit' },
                { time: 'Afternoon', items: 'Breast milk/formula' },
                { time: 'Evening', items: '2-3 tbsp pureed vegetables' },
                { time: 'Night', items: 'Breast milk/formula' }
            ]
        },
        '8-12': {
            title: '8-12 Months: Exploring Textures',
            description: 'Progress to thicker textures and small soft pieces.',
            foods: [
                {
                    category: 'Grains',
                    icon: '🌾',
                    items: [
                        { name: 'Soft Rice', emoji: '🍚', benefit: 'Energy and easy digestion' },
                        { name: 'Oats', emoji: '🥣', benefit: 'Fiber and nutrients' },
                        { name: 'Roti Pieces', emoji: '🫓', benefit: 'Introduce wheat' }
                    ]
                },
                {
                    category: 'Proteins',
                    icon: '🥚',
                    items: [
                        { name: 'Egg Yolk', emoji: '🥚', benefit: 'Iron, protein, healthy fats' },
                        { name: 'Yogurt', emoji: '🥛', benefit: 'Probiotics for digestion' },
                        { name: 'Soft Fish', emoji: '🐟', benefit: 'Omega-3 fatty acids' },
                        { name: 'Cooked Dal', emoji: '🫘', benefit: 'Complete protein source' }
                    ]
                },
                {
                    category: 'Fruits & Vegetables',
                    icon: '🥬',
                    items: [
                        { name: 'Banana', emoji: '🍌', benefit: 'Potassium and energy' },
                        { name: 'Avocado', emoji: '🥑', benefit: 'Healthy fats for brain' },
                        { name: 'Steamed Broccoli', emoji: '🥦', benefit: 'Vitamins and minerals' }
                    ]
                }
            ],
            avoid: [
                'Honey (until 12 months)',
                'Whole nuts (choking hazard)',
                'Raw vegetables',
                'Large chunks of food',
                'Added salt and sugar'
            ],
            tips: [
                { title: 'Finger Foods', description: 'Soft pieces baby can pick up and self-feed' },
                { title: 'Three Meals Daily', description: 'Establish regular meal times' },
                { title: 'Texture Progression', description: 'Move from purees to mashed to small pieces' }
            ],
            sampleMealPlan: [
                { time: 'Breakfast', items: 'Oats porridge with mashed banana' },
                { time: 'Mid-morning', items: 'Breast milk/formula' },
                { time: 'Lunch', items: 'Rice with dal and soft vegetables' },
                { time: 'Snack', items: 'Yogurt or fruit puree' },
                { time: 'Dinner', items: 'Soft roti with vegetable curry' },
                { time: 'Bedtime', items: 'Breast milk/formula' }
            ]
        },
        '12+': {
            title: '12+ Months: Family Foods',
            description: 'Transition to modified family foods with varied textures.',
            foods: [
                {
                    category: 'Grains & Carbs',
                    icon: '🍞',
                    items: [
                        { name: 'Whole Wheat Bread', emoji: '🍞', benefit: 'Fiber and energy' },
                        { name: 'Pasta', emoji: '🍝', benefit: 'Easy to eat, versatile' },
                        { name: 'Rice Dishes', emoji: '🍚', benefit: 'Familiar staple food' }
                    ]
                },
                {
                    category: 'Proteins',
                    icon: '🍗',
                    items: [
                        { name: 'Whole Egg', emoji: '🥚', benefit: 'Complete protein' },
                        { name: 'Chicken', emoji: '🍗', benefit: 'Lean protein' },
                        { name: 'Paneer', emoji: '🧀', benefit: 'Calcium and protein' },
                        { name: 'Beans', emoji: '🫘', benefit: 'Plant-based protein' }
                    ]
                },
                {
                    category: 'Dairy',
                    icon: '🥛',
                    items: [
                        { name: 'Whole Milk', emoji: '🥛', benefit: 'Calcium for bones' },
                        { name: 'Cheese', emoji: '🧀', benefit: 'Protein and calcium' },
                        { name: 'Yogurt', emoji: '🍶', benefit: 'Probiotics' }
                    ]
                },
                {
                    category: 'Fruits & Vegetables',
                    icon: '🥗',
                    items: [
                        { name: 'Chopped Fruits', emoji: '🍎', benefit: 'Vitamins and fiber' },
                        { name: 'Cooked Vegetables', emoji: '🥕', benefit: 'Essential nutrients' },
                        { name: 'Berries', emoji: '🫐', benefit: 'Antioxidants' }
                    ]
                }
            ],
            avoid: [
                'Choking hazards (whole grapes, nuts, popcorn)',
                'Excessive sugar and salt',
                'Processed foods',
                'Sugary drinks and juice',
                'Low-fat dairy (need full fat until 2 years)'
            ],
            tips: [
                { title: 'Self-Feeding', description: 'Encourage using spoon and fork' },
                { title: 'Regular Meals', description: 'Three meals and 2-3 snacks daily' },
                { title: 'Family Meals', description: 'Eat together to model good habits' },
                { title: 'Variety', description: 'Offer different colors, textures, and flavors' }
            ],
            sampleMealPlan: [
                { time: 'Breakfast', items: 'Scrambled egg with toast and fruit' },
                { time: 'Mid-morning Snack', items: 'Yogurt with berries' },
                { time: 'Lunch', items: 'Chicken curry with rice and vegetables' },
                { time: 'Afternoon Snack', items: 'Cheese cubes and crackers' },
                { time: 'Dinner', items: 'Pasta with vegetables and paneer' },
                { time: 'Bedtime', items: 'Whole milk' }
            ]
        }
    },
    
    // Pregnancy Month-wise Guidance
    PREGNANCY_MONTHS: {
        1: {
            babySize: 'Poppy seed (0.1mm)',
            development: 'Fertilization occurs. The embryo starts to form. Cells are rapidly dividing.',
            checklist: [
                'Take a home pregnancy test',
                'Start taking prenatal vitamins with folic acid',
                'Schedule your first prenatal appointment',
                'Avoid alcohol and smoking',
                'Stop any unsafe medications'
            ],
            nutrition: [
                'Folic acid rich foods (leafy greens, citrus)',
                'Drink plenty of water (8-10 glasses)',
                'Whole grains for energy',
                'Lean proteins'
            ],
            tests: ['Home pregnancy test', 'Confirm with blood test'],
            avoid: [
                'Alcohol and smoking',
                'Raw or undercooked meat',
                'Unpasteurized dairy products',
                'High mercury fish',
                'Excessive caffeine'
            ],
            exercise: [
                'Continue moderate exercise',
                'Walking 30 minutes daily',
                'Avoid contact sports',
                'Listen to your body'
            ]
        },
        2: {
            babySize: 'Blueberry (7-9mm)',
            development: 'Heart begins to beat. Brain and spinal cord are forming. Limb buds appear.',
            checklist: [
                'First prenatal doctor visit',
                'Discuss medications with doctor',
                'Manage morning sickness',
                'Get adequate rest',
                'Start pregnancy journal'
            ],
            nutrition: [
                'Small, frequent meals for nausea',
                'Ginger tea for morning sickness',
                'Protein-rich foods',
                'Complex carbohydrates',
                'Vitamin B6 foods'
            ],
            tests: ['First ultrasound scan', 'Blood group and Rh factor', 'Complete blood count'],
            avoid: [
                'Hot tubs and saunas',
                'Raw eggs and fish',
                'Soft cheeses',
                'Deli meats',
                'Too much vitamin A'
            ],
            exercise: [
                'Gentle yoga',
                'Swimming',
                'Light aerobics',
                'Pelvic floor exercises'
            ]
        },
        3: {
            babySize: 'Strawberry (2.5cm)',
            development: 'All major organs are forming. Fingers and toes develop. Baby starts moving.',
            checklist: [
                'NT scan (nuchal translucency)',
                'First trimester screening',
                'Manage fatigue',
                'Plan to tell family and friends',
                'Research maternity benefits'
            ],
            nutrition: [
                'Iron-rich foods (spinach, lentils)',
                'Calcium for bone development',
                'Omega-3 fatty acids',
                'Colorful fruits and vegetables',
                'Stay hydrated'
            ],
            tests: ['NT scan', 'First trimester screening', 'CVS if recommended'],
            avoid: [
                'Stress and anxiety',
                'Heavy lifting',
                'Cleaning cat litter',
                'Harsh chemicals',
                'X-rays'
            ],
            exercise: [
                'Prenatal yoga',
                'Walking',
                'Swimming',
                'Kegel exercises'
            ]
        },
        4: {
            babySize: 'Lemon (10cm)',
            development: 'Face is well-formed. Hair and nails growing. Can make facial expressions.',
            checklist: [
                'Second prenatal visit',
                'Start shopping for maternity clothes',
                'Begin bonding with baby',
                'Plan nursery setup',
                'Research childbirth classes'
            ],
            nutrition: [
                'Increase protein intake',
                'Fiber to prevent constipation',
                'Healthy snacks',
                'Vitamin D foods',
                '300 extra calories daily'
            ],
            tests: ['Routine prenatal checkup', 'Urine test', 'Blood pressure check'],
            avoid: [
                'Tight clothing',
                'Sleeping on back',
                'Standing for long periods',
                'Very hot showers',
                'Empty stomach for long'
            ],
            exercise: [
                'Brisk walking',
                'Low-impact aerobics',
                'Stationary cycling',
                'Stretching'
            ]
        },
        5: {
            babySize: 'Bell pepper (14cm)',
            development: 'Baby can hear sounds. Developing sleep patterns. Active movement.',
            checklist: [
                'Anatomy scan ultrasound',
                'Feel baby movements (quickening)',
                'Prepare for glucose test',
                'Start thinking about baby names',
                'Plan maternity leave'
            ],
            nutrition: [
                'Calcium-rich dairy products',
                'Healthy fats (avocado, nuts)',
                'Green leafy vegetables',
                'Whole grain bread and pasta',
                'Fresh fruits'
            ],
            tests: ['Anatomy scan (18-22 weeks)', 'Amniocentesis if needed'],
            avoid: [
                'Processed junk food',
                'Excessive sugar',
                'Carbonated drinks',
                'Spicy foods if causing heartburn',
                'Stressful situations'
            ],
            exercise: [
                'Prenatal swimming',
                'Yoga for flexibility',
                'Walking 30-45 minutes',
                'Pilates (modified)'
            ]
        },
        6: {
            babySize: 'Banana (23cm)',
            development: 'Eyes can open and close. Fingerprints formed. Regular sleep-wake cycles.',
            checklist: [
                'Glucose screening test',
                'Start childbirth education classes',
                'Plan baby shower',
                'Register for hospital',
                'Start buying baby essentials'
            ],
            nutrition: [
                'Iron supplements if needed',
                'Magnesium-rich foods',
                'Healthy carbs for energy',
                'Adequate protein',
                'Lots of water'
            ],
            tests: ['Glucose tolerance test', 'Hemoglobin check', 'Blood pressure monitoring'],
            avoid: [
                'Skipping meals',
                'Too much sugar',
                'Lying flat on back',
                'Heavy physical work',
                'Travel to high altitudes'
            ],
            exercise: [
                'Pregnancy-safe exercises',
                'Swimming',
                'Pelvic tilts',
                'Shoulder circles'
            ]
        },
        7: {
            babySize: 'Cauliflower (30cm)',
            development: 'Rapid brain development. Can recognize your voice. Lungs developing.',
            checklist: [
                'Start monitoring baby movements',
                'Third trimester begins',
                'Prepare hospital bag',
                'Tour the hospital/birthing center',
                'Discuss birth plan with doctor'
            ],
            nutrition: [
                'Protein for growth',
                'DHA for brain development',
                'Iron-rich foods',
                'Small frequent meals',
                'Healthy snacks'
            ],
            tests: ['Routine prenatal checkup', 'RhoGAM shot if Rh negative'],
            avoid: [
                'Sleeping on back',
                'Long car rides',
                'Standing for too long',
                'Stress',
                'Dehydration'
            ],
            exercise: [
                'Gentle walking',
                'Prenatal yoga',
                'Stretching',
                'Breathing exercises'
            ]
        },
        8: {
            babySize: 'Pineapple (40cm)',
            development: 'Baby gaining weight rapidly. Organs are maturing. Getting into birth position.',
            checklist: [
                'Weekly prenatal appointments begin',
                'Finalize birth plan',
                'Install car seat',
                'Pack hospital bag',
                'Prepare older siblings'
            ],
            nutrition: [
                'Complex carbohydrates',
                'Lean proteins',
                'Plenty of fluids',
                'Smaller portions',
                'Prune juice for constipation'
            ],
            tests: ['Group B strep test', 'Biophysical profile if needed', 'Position check'],
            avoid: [
                'Heavy meals before bed',
                'Lying flat',
                'Excessive salt',
                'Long travel',
                'Stress and anxiety'
            ],
            exercise: [
                'Short walks',
                'Pelvic floor exercises',
                'Breathing techniques',
                'Gentle stretches'
            ]
        },
        9: {
            babySize: 'Watermelon (50cm)',
            development: 'Fully developed and ready for birth. Gaining weight. Lungs mature.',
            checklist: [
                'Watch for signs of labor',
                'Have hospital bag ready',
                'Know your contractions',
                'Rest as much as possible',
                'Stay in touch with doctor'
            ],
            nutrition: [
                'Energy-rich foods',
                'Date fruit (helps labor)',
                'Hydrating fluids',
                'Easy-to-digest foods',
                'Small frequent meals'
            ],
            tests: ['Weekly checkups', 'Cervix examination', 'Non-stress test if needed'],
            avoid: [
                'Long distance travel',
                'Being alone',
                'Heavy physical activity',
                'Spicy foods',
                'Anxiety and panic'
            ],
            exercise: [
                'Walking to encourage labor',
                'Squats (if approved)',
                'Pelvic exercises',
                'Relaxation techniques'
            ]
        }
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
