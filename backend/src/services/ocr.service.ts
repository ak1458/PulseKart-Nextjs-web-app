
export const OCRService = {
    async processImage(imageUrl: string) {
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mock OCR result
        return {
            text: "Rx: Amoxicillin 500mg\nQty: 10\nSig: BID for 5 days",
            confidence: 0.95,
            items: [
                { name: "Amoxicillin", strength: "500mg", quantity: 10, type: "Antibiotic" }
            ],
            doctor: "Dr. A. Smith",
            date: new Date().toISOString()
        };
    }
};
