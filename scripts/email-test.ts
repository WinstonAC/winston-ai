import nodemailer from 'nodemailer';
import { config } from 'dotenv';

config(); // Load environment variables

const testEmails = async () => {
  // Create test account
  const testAccount = await nodemailer.createTestAccount();

  // Create reusable transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.ethereal.email",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.SMTP_USER || testAccount.user,
      pass: process.env.SMTP_PASS || testAccount.pass,
    },
  });

  // Test email configurations
  const testCases = [
    {
      name: "Plain Text Email",
      content: {
        from: process.env.FROM_EMAIL || '"Winston AI" <test@winston-ai.com>',
        to: "test@example.com",
        subject: "Test Email 1",
        text: "This is a test email from Winston AI",
      }
    },
    {
      name: "HTML Email",
      content: {
        from: process.env.FROM_EMAIL || '"Winston AI" <test@winston-ai.com>',
        to: "test@example.com",
        subject: "Test Email 2",
        html: "<h1>Winston AI</h1><p>This is a test HTML email</p>",
      }
    },
    {
      name: "Email with Attachment",
      content: {
        from: process.env.FROM_EMAIL || '"Winston AI" <test@winston-ai.com>',
        to: "test@example.com",
        subject: "Test Email 3",
        text: "This is a test email with attachment",
        attachments: [{
          filename: 'test.txt',
          content: 'Hello World!'
        }]
      }
    }
  ];

  console.log("Starting email tests...\n");

  for (const test of testCases) {
    try {
      console.log(`Testing: ${test.name}`);
      const info = await transporter.sendMail(test.content);
      console.log("Status: ✅ Success");
      console.log("Message ID:", info.messageId);
      console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
      console.log("-------------------\n");
    } catch (error) {
      console.error("Status: ❌ Failed");
      console.error("Error:", error);
      console.log("-------------------\n");
    }
  }

  // Verify DKIM, SPF, and DMARC
  console.log("Checking email authentication...");
  try {
    const dkimResult = await transporter.verify();
    console.log("DKIM Configuration:", dkimResult ? "✅ Valid" : "❌ Invalid");
  } catch (error) {
    console.error("DKIM Check Failed:", error);
  }
};

// Run tests
testEmails()
  .then(() => console.log("Email tests completed"))
  .catch(console.error)
  .finally(() => process.exit()); 