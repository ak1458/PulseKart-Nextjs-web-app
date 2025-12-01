
interface ChatResponse {
    message: string;
    options?: string[];
    action?: 'book_appointment' | 'consult_pharmacist' | 'none';
}

export class ChatbotService {

    static async processMessage(message: string, context: any = {}): Promise<ChatResponse> {
        const msg = message.toLowerCase();

        // 1. Symptom Check Flow
        if (msg.includes('headache') || msg.includes('pain')) {
            return {
                message: "I understand you're in pain. How long have you been experiencing this?",
                options: ['Less than 24 hours', '1-3 days', 'More than a week']
            };
        }

        if (msg.includes('fever')) {
            return {
                message: "Have you measured your temperature? If it's above 102°F (39°C), please consult a doctor immediately.",
                options: ['Yes, it is high', 'No, just feeling warm', 'Book Appointment'],
                action: 'book_appointment'
            };
        }

        // 2. Booking Flow
        if (msg.includes('book') || msg.includes('appointment')) {
            return {
                message: "I can help you book a consultation. We have Dr. Sharma available at 4:00 PM today.",
                options: ['Confirm 4:00 PM', 'Check other times'],
                action: 'book_appointment'
            };
        }

        // 3. General Fallback
        return {
            message: "I'm a health assistant, but I can't diagnose conditions. Would you like to speak to a pharmacist?",
            options: ['Yes, connect me', 'No, thanks'],
            action: 'consult_pharmacist'
        };
    }
}
