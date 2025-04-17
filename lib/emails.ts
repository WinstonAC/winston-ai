interface EmailTemplate {
  subject: string;
  html: string;
}

export function outreachEmail(name: string): EmailTemplate {
  return {
    subject: `${name}, quick question about your business`,
    html: `
      <div style="font-family: 'Courier New', monospace; max-width: 600px; margin: 0 auto; line-height: 1.6;">
        <p>Hi ${name},</p>
        
        <p>I noticed your company and wanted to reach out. We've been helping businesses 
        like yours automate their outreach and book more calls while they sleep.</p>
        
        <p>Would you be interested in seeing a quick demo of how it works?</p>
        
        <div style="margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/demo" 
             style="display: inline-block; 
                    padding: 12px 24px; 
                    background-color: black; 
                    color: white; 
                    text-decoration: none; 
                    font-weight: bold;
                    border: 3px solid black;">
            Watch 2-Minute Demo
          </a>
        </div>
        
        <p>Best regards,<br>Winston AI</p>
      </div>
    `
  };
}

export function demoFollowUp(name: string): EmailTemplate {
  return {
    subject: `Your Winston AI Demo Access`,
    html: `
      <div style="font-family: 'Courier New', monospace; max-width: 600px; margin: 0 auto; line-height: 1.6;">
        <p>Hey ${name}!</p>
        
        <p>Thanks for your interest in Winston AI. I've put together everything you need:</p>
        
        <div style="margin: 30px 0; padding: 20px; background-color: #f5f5f5; border: 3px solid black;">
          <p style="font-weight: bold; margin-bottom: 15px;">🎥 Watch the Demo</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/demo" 
             style="display: inline-block; 
                    padding: 12px 24px; 
                    background-color: black; 
                    color: white; 
                    text-decoration: none; 
                    font-weight: bold;
                    border: 3px solid black;
                    margin-bottom: 20px;">
            Watch Demo Video
          </a>
          
          <p style="font-weight: bold; margin-bottom: 15px;">📅 Schedule a Call</p>
          <a href="https://calendly.com/your-link" 
             style="display: inline-block; 
                    padding: 12px 24px; 
                    background-color: black; 
                    color: white; 
                    text-decoration: none; 
                    font-weight: bold;
                    border: 3px solid black;">
            Book a 15-Minute Call
          </a>
        </div>
        
        <p>Looking forward to speaking with you!</p>
        
        <p>Best regards,<br>Winston AI Team</p>
      </div>
    `
  };
} 