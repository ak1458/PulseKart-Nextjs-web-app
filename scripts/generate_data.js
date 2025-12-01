const fs = require('fs');
const path = require('path');

const CATEGORIES = [
    'Medicines',
    'Personal Care',
    'Health Devices',
    'Supplements',
    'Baby Care'
];

const ADJECTIVES = ['Advanced', 'Fast-Acting', 'Premium', 'Organic', 'Clinical', 'Daily', 'Essential', 'Ultra'];
const NOUNS = ['Relief', 'Support', 'Formula', 'Complex', 'System', 'Care', 'Booster', 'Shield'];

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateProduct(id, category) {
    const title = `${getRandomItem(ADJECTIVES)} ${category} ${getRandomItem(NOUNS)}`;
    const price = getRandomInt(100, 5000);
    const discount = getRandomInt(0, 30);

    return {
        id: `prod_${id}`,
        category,
        title,
        shortDesc: `High-quality ${title.toLowerCase()} for your needs.`,
        fullDesc: `This ${title} is scientifically formulated to provide the best results. It is suitable for daily use and recommended by experts.`,
        price,
        discountPercentage: discount,
        finalPrice: Math.round(price * (1 - discount / 100)),
        rating: (Math.random() * 2 + 3).toFixed(1), // 3.0 to 5.0
        reviewCount: getRandomInt(10, 500),
        inStock: Math.random() > 0.1,
        isExpress: Math.random() > 0.7, // 30% chance of express delivery
        attributes: {
            brand: `Brand-${getRandomInt(1, 10)}`,
            form: getRandomItem(['Tablet', 'Syrup', 'Cream', 'Device', 'Powder']),
            packSize: `${getRandomInt(1, 10)} units`
        },
        highlights: [
            'Clinically tested',
            'Fast delivery available',
            '100% Authentic'
        ],
        seo: {
            metaTitle: `${title} | Buy Online at PulseKart`,
            metaDescription: `Buy ${title} online. Best price, fast delivery, and genuine products at PulseKart.`
        },
        images: [
            `https://placehold.co/400x400?text=${encodeURIComponent(title)}`,
            `https://placehold.co/400x400?text=${encodeURIComponent(title + ' Back')}`
        ]
    };
}

const products = [];
let idCounter = 1;

CATEGORIES.forEach(cat => {
    for (let i = 0; i < 50; i++) {
        products.push(generateProduct(idCounter++, cat));
    }
});

const outputPath = path.join(__dirname, '../public/data/products.json');
const outputDir = path.dirname(outputPath);

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(products, null, 2));

console.log(`Generated ${products.length} products in ${outputPath}`);
