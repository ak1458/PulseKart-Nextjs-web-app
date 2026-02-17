import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

export interface EmailConfig {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
    };
    from: string;
}

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private transporter: Transporter | null = null;
    private isConfigured = false;

    constructor(private readonly configService: ConfigService) {
        this.initializeTransporter();
    }

    /**
     * Initialize the email transporter based on configuration
     */
    private initializeTransporter(): void {
        const provider = this.configService.get<string>('EMAIL_PROVIDER') || 'smtp';
        
        try {
            switch (provider.toLowerCase()) {
                case 'gmail':
                    this.setupGmail();
                    break;
                case 'sendgrid':
                    this.setupSendGrid();
                    break;
                case 'mailgun':
                    this.setupMailgun();
                    break;
                case 'aws':
                case 'ses':
                    this.setupAWSSES();
                    break;
                case 'smtp':
                default:
                    this.setupSMTP();
                    break;
            }
        } catch (error) {
            this.logger.error('Failed to initialize email transporter:', error.message);
            this.isConfigured = false;
        }
    }

    /**
     * Setup Gmail SMTP
     * Requires App Password (not regular password)
     * https://myaccount.google.com/apppasswords
     */
    private setupGmail(): void {
        const user = this.configService.get<string>('GMAIL_USER') || this.configService.get<string>('SMTP_USER');
        const pass = this.configService.get<string>('GMAIL_APP_PASSWORD') || this.configService.get<string>('SMTP_PASS');

        if (!user || !pass) {
            this.logger.warn('Gmail configuration incomplete. Set GMAIL_USER and GMAIL_APP_PASSWORD');
            return;
        }

        this.transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: { user, pass },
        });

        this.isConfigured = true;
        this.logger.log('Gmail SMTP configured successfully');
    }

    /**
     * Setup SendGrid SMTP
     * https://app.sendgrid.com/settings/api_keys
     */
    private setupSendGrid(): void {
        const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
        
        if (!apiKey) {
            this.logger.warn('SendGrid configuration incomplete. Set SENDGRID_API_KEY');
            return;
        }

        this.transporter = nodemailer.createTransport({
            host: 'smtp.sendgrid.net',
            port: 587,
            secure: false,
            auth: {
                user: 'apikey',
                pass: apiKey,
            },
        });

        this.isConfigured = true;
        this.logger.log('SendGrid SMTP configured successfully');
    }

    /**
     * Setup Mailgun SMTP
     * https://app.mailgun.com/app/account/security/api_keys
     */
    private setupMailgun(): void {
        const user = this.configService.get<string>('MAILGUN_USER');
        const pass = this.configService.get<string>('MAILGUN_API_KEY') || this.configService.get<string>('MAILGUN_PASS');
        const domain = this.configService.get<string>('MAILGUN_DOMAIN');

        if (!user || !pass) {
            this.logger.warn('Mailgun configuration incomplete. Set MAILGUN_USER and MAILGUN_API_KEY');
            return;
        }

        this.transporter = nodemailer.createTransport({
            host: `smtp.mailgun.org`,
            port: 587,
            secure: false,
            auth: { user, pass },
        });

        this.isConfigured = true;
        this.logger.log(`Mailgun SMTP configured successfully (domain: ${domain || 'not set'})`);
    }

    /**
     * Setup AWS SES SMTP
     * https://console.aws.amazon.com/ses/home
     */
    private setupAWSSES(): void {
        const user = this.configService.get<string>('AWS_SES_USER') || this.configService.get<string>('AWS_ACCESS_KEY_ID');
        const pass = this.configService.get<string>('AWS_SES_PASSWORD') || this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
        const region = this.configService.get<string>('AWS_SES_REGION') || this.configService.get<string>('AWS_REGION') || 'us-east-1';

        if (!user || !pass) {
            this.logger.warn('AWS SES configuration incomplete. Set AWS_SES_USER and AWS_SES_PASSWORD');
            return;
        }

        this.transporter = nodemailer.createTransport({
            host: `email-smtp.${region}.amazonaws.com`,
            port: 587,
            secure: false,
            auth: { user, pass },
        });

        this.isConfigured = true;
        this.logger.log(`AWS SES configured successfully (region: ${region})`);
    }

    /**
     * Setup generic SMTP
     */
    private setupSMTP(): void {
        const host = this.configService.get<string>('SMTP_HOST');
        const port = this.configService.get<number>('SMTP_PORT') || 587;
        const user = this.configService.get<string>('SMTP_USER');
        const pass = this.configService.get<string>('SMTP_PASS');
        const secure = this.configService.get<string>('SMTP_SECURE') === 'true' || port === 465;

        if (!host || !user || !pass) {
            this.logger.warn('SMTP configuration incomplete. Check SMTP_HOST, SMTP_USER, SMTP_PASS');
            this.logger.warn('Email functionality will be disabled. Password reset links will be logged to console.');
            return;
        }

        this.transporter = nodemailer.createTransport({
            host,
            port,
            secure,
            auth: { user, pass },
        });

        this.isConfigured = true;
        this.logger.log(`SMTP configured successfully (${host}:${port})`);
    }

    /**
     * Check if email service is properly configured
     */
    isEmailConfigured(): boolean {
        return this.isConfigured && this.transporter !== null;
    }

    /**
     * Send a password reset email
     */
    async sendPasswordResetEmail(
        to: string,
        name: string,
        resetToken: string,
        frontendUrl: string,
    ): Promise<{ success: boolean; previewUrl?: string; error?: string }> {
        const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

        // If email not configured, log to console and return
        if (!this.isEmailConfigured()) {
            this.logger.warn('='.repeat(80));
            this.logger.warn('EMAIL NOT CONFIGURED - Password Reset Link:');
            this.logger.warn(`To: ${to}`);
            this.logger.warn(`Reset URL: ${resetUrl}`);
            this.logger.warn('='.repeat(80));
            return { 
                success: false, 
                error: 'Email service not configured',
                previewUrl: resetUrl 
            };
        }

        const fromEmail = this.configService.get<string>('FROM_EMAIL') || 'noreply@pulsekart.com';
        const companyName = this.configService.get<string>('COMPANY_NAME') || 'PulseKart';

        try {
            const result = await this.transporter!.sendMail({
                from: `"${companyName}" <${fromEmail}>`,
                to,
                subject: `Password Reset Request - ${companyName}`,
                html: this.getPasswordResetTemplate(name, resetUrl, companyName),
                text: this.getPasswordResetText(name, resetUrl, companyName),
            });

            this.logger.log(`Password reset email sent to ${to} (MessageId: ${result.messageId})`);
            return { success: true };
        } catch (error) {
            this.logger.error(`Failed to send password reset email to ${to}:`, error.message);
            
            // Log the link as fallback
            this.logger.warn('='.repeat(80));
            this.logger.warn('EMAIL FAILED - Password Reset Link (Fallback):');
            this.logger.warn(`Reset URL: ${resetUrl}`);
            this.logger.warn('='.repeat(80));
            
            return { 
                success: false, 
                error: error.message,
                previewUrl: resetUrl 
            };
        }
    }

    /**
     * Send a test email to verify configuration
     */
    async sendTestEmail(to: string): Promise<{ success: boolean; error?: string }> {
        if (!this.isEmailConfigured()) {
            return { success: false, error: 'Email service not configured' };
        }

        const fromEmail = this.configService.get<string>('FROM_EMAIL') || 'noreply@pulsekart.com';
        const companyName = this.configService.get<string>('COMPANY_NAME') || 'PulseKart';

        try {
            const result = await this.transporter!.sendMail({
                from: `"${companyName}" <${fromEmail}>`,
                to,
                subject: `Test Email - ${companyName}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #0d9488;">Test Email</h2>
                        <p>This is a test email from ${companyName}.</p>
                        <p>If you received this, your email configuration is working correctly!</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
                        <p style="color: #999; font-size: 12px;">
                            Sent at: ${new Date().toISOString()}
                        </p>
                    </div>
                `,
            });

            this.logger.log(`Test email sent to ${to} (MessageId: ${result.messageId})`);
            return { success: true };
        } catch (error) {
            this.logger.error(`Failed to send test email:`, error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get HTML template for password reset email
     */
    private getPasswordResetTemplate(name: string, resetUrl: string, companyName: string): string {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0d9488, #10b981); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: linear-gradient(135deg, #0d9488, #10b981); color: white; padding: 14px 28px; 
                  text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
        .button:hover { opacity: 0.9; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${companyName}</h1>
        </div>
        <div class="content">
            <h2 style="color: #111827;">Hello ${name},</h2>
            <p>You recently requested to reset your password for your ${companyName} account.</p>
            <p>Click the button below to reset it:</p>
            <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #e5e7eb; padding: 12px; border-radius: 4px; font-size: 14px;">
                ${resetUrl}
            </p>
            <div class="warning">
                <strong>Important:</strong> This link will expire in 1 hour for security reasons.
            </div>
            <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
            <p>This is an automated email, please do not reply.</p>
        </div>
    </div>
</body>
</html>
        `;
    }

    /**
     * Get plain text version for password reset email
     */
    private getPasswordResetText(name: string, resetUrl: string, companyName: string): string {
        return `
Hello ${name},

You recently requested to reset your password for your ${companyName} account.

Click the link below to reset it:
${resetUrl}

This link will expire in 1 hour for security reasons.

If you did not request a password reset, please ignore this email or contact support if you have concerns.

---
${companyName}
This is an automated email, please do not reply.
        `.trim();
    }
}
