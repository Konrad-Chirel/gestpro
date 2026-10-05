import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;

// Instance Resend pour les envois d'e-mails transactionnels (factures, reçus, alertes)
export const resend = resendApiKey ? new Resend(resendApiKey) : null;
