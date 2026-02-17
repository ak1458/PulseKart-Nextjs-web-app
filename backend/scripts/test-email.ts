/**
 * Test email configuration script
 * 
 * Usage: npx ts-node scripts/test-email.ts your-email@example.com
 */

import { ConfigService } from '@nestjs/config';
import { EmailService } from '../src/email/email.service';

async function testEmail() {
    const email = process.argv[2];
    
    if (!email) {
        console.error('Usage: npx ts-node scripts/test-email.ts your-email@example.com');
        process.exit(1);
    }

    console.log('='.repeat(60));
    console.log('Testing Email Configuration');
    console.log('='.repeat(60));
    console.log(`Sending test email to: ${email}`);
    console.log('');

    // Create a mock config service
    const configService = new ConfigService();
    const emailService = new EmailService(configService);

    // Check if email is configured
    if (!emailService.isEmailConfigured()) {
        console.error('❌ Email is NOT configured properly!');
        console.log('');
        console.log('Current configuration:');
        console.log(`  EMAIL_PROVIDER: ${process.env.EMAIL_PROVIDER || 'not set'}`);
        console.log(`  GMAIL_USER: ${process.env.GMAIL_USER ? '***set***' : 'not set'}`);
        console.log(`  SENDGRID_API_KEY: ${process.env.SENDGRID_API_KEY ? '***set***' : 'not set'}`);
        console.log(`  SMTP_HOST: ${process.env.SMTP_HOST || 'not set'}`);
        console.log('');
        console.log('Please check your backend/.env file and ensure email is configured.');
        console.log('See EMAIL_SETUP.md for detailed instructions.');
        process.exit(1);
    }

    console.log('✅ Email service is configured');
    console.log('');

    // Send test email
    const result = await emailService.sendTestEmail(email);

    if (result.success) {
        console.log('✅ Test email sent successfully!');
        console.log(`   Check your inbox: ${email}`);
    } else {
        console.error('❌ Failed to send test email:');
        console.error(`   ${result.error}`);
        process.exit(1);
    }
}

testEmail().catch(console.error);
