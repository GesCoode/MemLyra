import nodemailer from 'nodemailer';
import { env } from '$env/dynamic/private';
import { APP_NAME } from '$lib/app';

function smtpConfigured(): boolean {
  return Boolean(env.SMTP_HOST && env.SMTP_FROM);
}

function createTransport() {
  const port = Number(env.SMTP_PORT ?? 587);
  const secure = env.SMTP_SECURE === 'true' || port === 465;

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port,
    secure,
    auth:
      env.SMTP_USER && env.SMTP_PASS
        ? {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS
          }
        : undefined
  });
}

async function sendEmail(options: {
  to: string;
  subject: string;
  text: string;
  html: string;
  logLabel: string;
  logUrl?: string;
}): Promise<boolean> {
  if (!smtpConfigured()) {
    console.warn(`SMTP is not configured. ${options.logLabel}:`, options.logUrl ?? options.text);
    return false;
  }

  const transport = createTransport();

  try {
    await transport.sendMail({
      from: env.SMTP_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    });
    return true;
  } catch (error) {
    console.error(`Failed to send email (${options.logLabel})`, error);
    throw error;
  }
}

<<<<<<< HEAD
export async function sendVerificationEmail(to: string, verifyUrl: string): Promise<boolean> {
  const subject = 'Activate your MemLyra account';
=======
export async function sendVerificationEmail(to: string, verifyUrl: string): Promise<void> {
  const subject = `Activate your ${APP_NAME} account`;
>>>>>>> 83331a6e4e67dedbe41b4a2e32f131f7c2d2ad16
  const text = `Click this link to activate your account: ${verifyUrl}\n\nIf this was not you, then ignore this mail.`;
  const html = `
    <p>Click this link to activate your account:</p>
    <p><a href="${verifyUrl}">${verifyUrl}</a></p>
    <p>If this was not you, then ignore this mail.</p>
  `;

  return sendEmail({
    to,
    subject,
    text,
    html,
    logLabel: 'Verification link',
    logUrl: verifyUrl
  });
}

<<<<<<< HEAD
export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<boolean> {
  const subject = 'Reset your MemLyra password';
=======
export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  const subject = `Reset your ${APP_NAME} password`;
>>>>>>> 83331a6e4e67dedbe41b4a2e32f131f7c2d2ad16
  const text = `Click this link to reset your password: ${resetUrl}\n\nThis link expires in one hour. If this was not you, ignore this email.`;
  const html = `
    <p>Click this link to reset your password:</p>
    <p><a href="${resetUrl}">${resetUrl}</a></p>
    <p>This link expires in one hour. If this was not you, ignore this email.</p>
  `;

  return sendEmail({
    to,
    subject,
    text,
    html,
    logLabel: 'Password reset link',
    logUrl: resetUrl
  });
}
