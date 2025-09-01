import nodemailer from "nodemailer";

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    // Configure based on your email provider
    // Example configurations for different providers:

    if (process.env.EMAIL_PROVIDER === "gmail") {
      this.transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD, // Use App Password for Gmail
        },
      });
    } else if (process.env.EMAIL_PROVIDER === "smtp") {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });
    } else {
      // Default to ethereal for testing (creates test accounts)
      this.createTestAccount();
    }
  }

  async createTestAccount() {
    try {
      const testAccount = await nodemailer.createTestAccount();
      
      this.transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      console.log("Test email account created:");
      console.log("User:", testAccount.user);
      console.log("Pass:", testAccount.pass);
    } catch (error) {
      console.error("Error creating test email account:", error);
    }
  }

  async sendNotificationEmail(to, subject, content, options = {}) {
    try {
      const {
        priority = "medium",
        actionButton = null,
        template = "basic"
      } = options;

      const htmlContent = this.generateEmailTemplate(content, {
        priority,
        actionButton,
        template,
      });

      const mailOptions = {
        from: process.env.EMAIL_FROM || "noreply@yourapp.com",
        to,
        subject,
        text: content, // Plain text version
        html: htmlContent, // HTML version
        priority: this.getPriorityLevel(priority),
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      console.log("Email sent successfully:");
      console.log("Message ID:", info.messageId);
      
      // For test accounts, log the preview URL
      if (process.env.EMAIL_PROVIDER !== "gmail" && process.env.EMAIL_PROVIDER !== "smtp") {
        console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
      }

      return {
        success: true,
        messageId: info.messageId,
        previewUrl: nodemailer.getTestMessageUrl(info),
      };
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }

  generateEmailTemplate(content, options = {}) {
    const { priority, actionButton, template } = options;
    
    const priorityColors = {
      low: "#6b7280",
      medium: "#3b82f6",
      high: "#f59e0b",
      urgent: "#ef4444",
    };

    const priorityColor = priorityColors[priority] || priorityColors.medium;

    let actionButtonHtml = "";
    if (actionButton) {
      actionButtonHtml = `
        <div style="text-align: center; margin: 30px 0;">
          <a href="${actionButton.url}" 
             style="display: inline-block; padding: 12px 24px; background-color: ${priorityColor}; 
                    color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
            ${actionButton.text}
          </a>
        </div>
      `;
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Notification</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="border-left: 4px solid ${priorityColor}; padding-left: 20px; margin-bottom: 20px;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px;">
            <div style="color: ${priorityColor}; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 10px;">
              ${priority.toUpperCase()} PRIORITY NOTIFICATION
            </div>
            <div style="font-size: 16px; line-height: 1.5;">
              ${content.replace(/\n/g, '<br>')}
            </div>
            ${actionButtonHtml}
          </div>
        </div>
        <div style="font-size: 12px; color: #6b7280; text-align: center; margin-top: 20px;">
          This is an automated notification. Please do not reply to this email.
        </div>
      </body>
      </html>
    `;
  }

  getPriorityLevel(priority) {
    const priorityMap = {
      low: "low",
      medium: "normal",
      high: "high",
      urgent: "high",
    };
    return priorityMap[priority] || "normal";
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log("Email service is ready to send emails");
      return true;
    } catch (error) {
      console.error("Email service verification failed:", error);
      return false;
    }
  }
}

export default new EmailService();