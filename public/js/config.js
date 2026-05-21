// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';
const RAZORPAY_KEY = 'your_razorpay_key_id';

const menuData = {
    shawarma: [
        { name: "Classic Chicken Shawarma", desc: "Pickled veggies, tender juicy chicken, and authentic garlic toum layer.", price: 120, tag: "Bestseller" },
        { name: "Whole Meat Shawarma", desc: "Pure zero-filler indulgence: 100% pure slow-roasted chicken and premium garlic mayo.", price: 160, tag: "Meat Lover" },
        { name: "Mefa Special Spicy Shawarma", desc: "Infused directly with our custom signature chili hot glaze.", price: 135, tag: "Spicy" },
        { name: "Cheese Burst Shawarma", desc: "Oozing melted mozzarella cheese layered seamlessly with grilled chicken slices.", price: 155, tag: "" }
    ],
    wraps: [
        { name: "Crispy Chicken Strip Wrap", desc: "Golden fried chicken tenders, shredded crisp lettuce, and tangy garlic dressing.", price: 130, tag: "" },
        { name: "Paneer Tikka Wrap", desc: "Succulent paneer cubes marinated overnight in tandoori spices with fresh mint sauce.", price: 130, tag: "Veg Top Choice" }
    ],
    burgers: [
        { name: "Mefa Crunchy Chicken Burger", desc: "Thick hand-breaded chicken breast crispy fillet, custom burger spread, and iceberg lettuce.", price: 140, tag: "Signature" },
        { name: "The Monster Chicken Double", desc: "Two grilled premium house chicken patties, dual cheddar slices, and a fried egg layer.", price: 210, tag: "Heavyweight" },
        { name: "Classic Veggie Supreme Burger", desc: "Crispy golden potato-and-peas patty layered with sliced onions and sweet dressing.", price: 95, tag: "" }
    ],
    sandwiches: [
        { name: "Classic Veg Grilled Sandwich", desc: "Sliced garden veggies and crisp capsicum layered with house green mint chutney.", price: 80, tag: "" },
        { name: "Corn & Cheese Sandwich", desc: "Sweet corn kernels tossed heavily in thick premium mozzarella strings.", price: 110, tag: "" },
        { name: "Club Triple-Decker Sandwich", desc: "Three toasted layers carrying grilled chicken shreds, fresh sliced boiled egg, and melted cheese.", price: 160, tag: "Filling" }
    ],
    fries: [
        { name: "Classic Salted Fries", desc: "Lightly salted premium select potatoes, perfectly crisped.", price: 80, tag: "" },
        { name: "Peri-Peri Dust Fries", desc: "Tossed thoroughly inside a warm spicy African peri-peri seasoning shake.", price: 95, tag: "Popular" },
        { name: "Mefa Loaded Chicken Fries", desc: "French fries loaded with shredded spit-roasted chicken, sliced jalapenos, and loaded garlic toum.", price: 140, tag: "Chef Special" }
    ],
    nuggets: [
        { name: "Classic Chicken Nuggets", desc: "Golden-brown breast meat nuggets crisp fried, served with standard dip.", price: 90, tag: "6 Pieces" },
        { name: "Veggie Pizza Fingers", desc: "Crisp breaded finger sleeves stuffed thoroughly with pizza veggies and gooey mozzarella flavor.", price: 85, tag: "6 Pieces" }
    ],
    juices: [
        { name: "Fresh Orange Juice", desc: "100% pure naturally squeezed juice served crisp and cold without artificial additives.", price: 70, tag: "Pure Fruit" },
        { name: "Fresh Watermelon Juice", desc: "Highly hydrating clean refreshing watermelon extract splash served chilled.", price: 60, tag: "" }
    ],
    mocktails: [
        { name: "Classic Mint Mojito", desc: "Muddled crisp mint leaves, fresh lime wheels, pure simple syrup base, and club soda fizz.", price: 90, tag: "Cooler" },
        { name: "Blue Lagoon Mocktail", desc: "Vibrant blue curaçao syrup base infused with sharp lemon juice, mint wheels, and Sprite.", price: 95, tag: "Instagrammable" },
        { name: "Mefa Special Sunset", desc: "Stunningly visual multi-layered mocktail featuring fresh orange juice and sweet cranberry concentrate.", price: 110, tag: "House Special" }
    ]
};
