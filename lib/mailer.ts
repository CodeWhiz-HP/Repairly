import nodemailer from 'nodemailer';

export async function sendEmail({
    to,
    subject,
    text,
    html,
}: {
    to: string;
    subject: string;
    text: string;
    html?: string;
}) {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!user || !pass) {
        console.warn("SMTP user or password not set in environment. Skipping email sending, printing content instead:");
        console.log(`[To]: ${to}\n[Subject]: ${subject}\n[Body]: ${text}`);
        return;
    }

    const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
            user,
            pass,
        },
    });

    try {
        const info = await transporter.sendMail({
            from: `"Repairly Notification" <${user}>`,
            to,
            subject,
            text,
            html,
        });
        console.log("Email sent successfully: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email via SMTP:", error);
    }
}
