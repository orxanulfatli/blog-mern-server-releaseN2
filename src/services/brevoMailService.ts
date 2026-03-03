const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL;
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || "BlogDev";

class BrevoMailService {
  async sendActivationEmail(to: string, url: string, text: string) {
    if (!BREVO_API_KEY) {
      throw new Error("BREVO_API_KEY is missing");
    }

    if (!BREVO_SENDER_EMAIL) {
      throw new Error("BREVO_SENDER_EMAIL is missing");
    }

    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          email: BREVO_SENDER_EMAIL,
          name: BREVO_SENDER_NAME,
        },
        to: [{ email: to }],
        subject: "Account activation code",
        htmlContent: `
          <div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
            <h2 style="text-align: center; text-transform: uppercase;color: teal;">Welcome to the DevAT channel.</h2>
            <p>Congratulations! You're almost set to start using BlogDEV.
              Just click the button below to validate your email address.
            </p>
            <a href=${url} style="background: crimson; text-decoration: none; color: white; padding: 10px 20px; margin: 10px 0; display: inline-block;">${text}</a>
            <p>If the button doesn't work for any reason, you can also click on the link below:</p>
            <div>${url}</div>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Brevo API error: ${response.status} ${errorText}`);
    }

    return response.json();
  }
}

export default new BrevoMailService();
