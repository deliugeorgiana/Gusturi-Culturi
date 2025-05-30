const fs = require('fs');
const path = require('path');

test('image processing handles image paths correctly', () => {
	const imagePath = path.join(__dirname, '../resurse/imagini/erori/imagine1.jpg');
	const processedImage = processImage(imagePath);
	expect(processedImage).toBeDefined();
	expect(fs.existsSync(processedImage)).toBe(true);
});