
import { OCRService } from '../services/ocr.service';

console.log("Starting OCR Worker...");

const processQueue = async () => {
    while (true) {
        // Simulate checking queue
        console.log("Checking for pending prescriptions...");

        // In a real app, we'd pop from Redis/DB
        const hasJob = Math.random() > 0.7; // 30% chance of job

        if (hasJob) {
            console.log("Found new prescription! Processing...");
            try {
                const result = await OCRService.processImage("sample-rx.jpg");
                console.log("OCR Complete:", result);
                // Save result to DB
            } catch (error) {
                console.error("OCR Failed:", error);
            }
        }

        // Wait 5 seconds
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
};

processQueue();
