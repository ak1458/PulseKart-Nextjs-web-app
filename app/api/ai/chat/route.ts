import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
    let messages: any[] = [];
    try {
        const apiKey = process.env.OPENAI_API_KEY;
        const body = await req.json();
        messages = body.messages;

        // Mock Mode if no key or explicit mock request
        if (!apiKey || apiKey.includes('placeholder')) {
            throw new Error('MOCK_MODE');
        }

        const openai = new OpenAI({ apiKey });

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are the AI Admin Worker for PulseKart, a pharmacy and e-commerce platform.
                    You have access to the following capabilities (simulated):
                    - Check orders, inventory, prescriptions.
                    - Execute actions like approving Rx, refunding orders, updating stock.
                    
                    When the user asks to perform an action, respond with a JSON object in the 'actions' field of your response (if possible) or just describe what you would do.
                    
                    For this MVP, you are a helpful assistant. If the user asks for data, simulate a realistic response based on a pharmacy context.
                    
                    Keep responses concise and professional.`
                },
                ...messages
            ],
        });

        const aiMessage = completion.choices[0].message.content;

        return NextResponse.json({
            role: 'assistant',
            content: aiMessage,
            actions: extractActions(aiMessage || '')
        });

    } catch (error: any) {
        console.warn('AI Service Error (Falling back to Mock):', error.message);

        // Fallback Mock Logic
        // Fallback Mock Logic
        const safeMessages = Array.isArray(messages) ? messages : [];
        const lastUserMsg = safeMessages[safeMessages.length - 1]?.content?.toLowerCase() || '';
        let mockContent = "I'm currently running in Offline Mode (Mock). I can't process complex reasoning right now, but I can help you navigate.";
        let mockActions: any[] = [];

        if (lastUserMsg.includes('order')) {
            mockContent = "I found 5 pending orders. Would you like to review them?";
            mockActions = [{ id: 'view-orders', label: 'View Orders', type: 'primary' }];
        } else if (lastUserMsg.includes('inventory') || lastUserMsg.includes('stock')) {
            mockContent = "Inventory status: 98% healthy. 3 items are low on stock.";
            mockActions = [{ id: 'restock', label: 'Restock Low Items', type: 'primary' }];
        } else if (lastUserMsg.includes('approve')) {
            mockContent = "I've approved the pending items.";
        }

        return NextResponse.json({
            role: 'assistant',
            content: mockContent,
            actions: mockActions,
            isMock: true
        });
    }
}

function extractActions(text: string) {
    if (text.toLowerCase().includes('approve')) return [{ id: 'approve', label: 'Approve', type: 'primary' }];
    return undefined;
}
