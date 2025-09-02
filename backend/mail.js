// backend/mail.js
const nodemailer = require('nodemailer');

const {
  MAIL_HOST,
  MAIL_PORT,
  MAIL_USER,
  MAIL_PASS,
} = process.env;

let transporter;

function ensureTransporter() {
  if (transporter) return transporter;

  if (!MAIL_HOST || !MAIL_PORT || !MAIL_USER || !MAIL_PASS) {
    console.warn('✉️  Mail: variáveis em falta (MAIL_HOST/PORT/USER/PASS).');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: MAIL_HOST,               // sandbox.smtp.mailtrap.io
    port: Number(MAIL_PORT),       // 2525
    secure: false,                 // STARTTLS (Mailtrap 2525)
    auth: { user: MAIL_USER, pass: MAIL_PASS },
  });

  transporter.verify((err) => {
    if (err) console.warn('✉️  SMTP verify falhou:', err.message);
    else     console.log('✉️  SMTP pronto para enviar.');
  });

  return transporter;
}

async function sendEmail({ to, subject, text, html }) {
  const tx = ensureTransporter();
  if (!tx || !to) return;

  try {
    const info = await tx.sendMail({
      from: 'SportsRadar <demomailtrap.com>',
      to,
      subject,
      text: text || '',
      html: html || undefined,
    });
    console.log('✉️  Email enviado:', info.messageId);
  } catch (e) {
    console.warn('✉️  Falha a enviar email:', e.message);
  }
}

module.exports = { sendEmail };
