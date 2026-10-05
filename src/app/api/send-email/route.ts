import { NextResponse, type NextRequest } from 'next/server';
import { resend } from '@/lib/resend';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, type = 'facture', facture, companySettings } = body;

    if (!to || typeof to !== 'string') {
      return NextResponse.json({ error: 'Adresse email destinataire manquante' }, { status: 400 });
    }

    const companyName = companySettings?.companyName || 'GestPro S.A.S';
    const companyEmail = companySettings?.email || 'contact@gestpro.app';
    const currency = companySettings?.currency || 'EUR';
    const currencySymbol = currency === 'XOF' ? 'FCFA' : currency === 'USD' ? '$' : '€';

    // If Resend API key is not yet provided, simulate successful sending in development
    if (!resend) {
      return NextResponse.json({
        success: true,
        simulated: true,
        message:
          "Simulation d'envoi réussie. Pour envoyer de véritables emails, ajoutez votre clé RESEND_API_KEY dans les variables d'environnement.",
      });
    }

    const emailSubject =
      subject ||
      (facture?.numero
        ? `Facture ${facture.numero} de ${companyName}`
        : `Notification de ${companyName}`);

    // Build professional responsive HTML email template
    const articlesRows = (facture?.articles || [])
      .map(
        (art: any) => `
        <tr>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-size: 14px;">
            ${art.description || art.designation || 'Article'}
          </td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 14px; text-align: center;">
            ${art.quantite || 1}
          </td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 14px; text-align: right;">
            ${(art.prixUnitaire || 0).toLocaleString('fr-FR')} ${currencySymbol}
          </td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-weight: 600; font-size: 14px; text-align: right;">
            ${(art.total || (art.quantite || 1) * (art.prixUnitaire || 0)).toLocaleString('fr-FR')} ${currencySymbol}
          </td>
        </tr>`
      )
      .join('');

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <title>${emailSubject}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 32px 16px; color: #1e293b;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); padding: 32px 28px; text-align: left; color: #ffffff;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">${companyName}</h1>
            <span style="background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase;">Facture</span>
          </div>
          <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">Votre document de facturation est prêt.</p>
        </div>

        <!-- Body -->
        <div style="padding: 28px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 24px; border-bottom: 1px solid #f1f5f9; padding-bottom: 20px;">
            <div>
              <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600;">Destinataire</p>
              <p style="margin: 4px 0 0 0; font-size: 15px; font-weight: 700; color: #0f172a;">${facture?.clientNom || 'Client'}</p>
              ${facture?.clientAdresse ? `<p style="margin: 2px 0 0 0; font-size: 13px; color: #64748b;">${facture.clientAdresse}</p>` : ''}
            </div>
            <div style="text-align: right;">
              <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600;">Numéro</p>
              <p style="margin: 4px 0 0 0; font-size: 15px; font-weight: 700; color: #ea580c;">${facture?.numero || 'N/A'}</p>
              <p style="margin: 2px 0 0 0; font-size: 13px; color: #64748b;">Date : ${facture?.dateEmission || 'Aujourd’hui'}</p>
            </div>
          </div>

          <!-- Items Table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <thead>
              <tr style="background: #f8fafc; text-align: left;">
                <th style="padding: 10px 16px; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600; border-bottom: 1px solid #e2e8f0;">Désignation</th>
                <th style="padding: 10px 16px; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600; border-bottom: 1px solid #e2e8f0; text-align: center;">Qté</th>
                <th style="padding: 10px 16px; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600; border-bottom: 1px solid #e2e8f0; text-align: right;">Prix unitaire</th>
                <th style="padding: 10px 16px; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600; border-bottom: 1px solid #e2e8f0; text-align: right;">Total HT</th>
              </tr>
            </thead>
            <tbody>
              ${articlesRows || '<tr><td colspan="4" style="padding: 16px; text-align: center; color: #94a3b8;">Aucun article renseigné</td></tr>'}
            </tbody>
          </table>

          <!-- Financial Summary -->
          <div style="background: #f8fafc; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; color: #64748b;">
              <span>Sous-total HT</span>
              <span style="font-weight: 600; color: #1e293b;">${(facture?.totalHT || 0).toLocaleString('fr-FR')} ${currencySymbol}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; color: #64748b;">
              <span>TVA</span>
              <span style="font-weight: 600; color: #1e293b;">${(facture?.tva || 0).toLocaleString('fr-FR')} ${currencySymbol}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 1px solid #cbd5e1; font-size: 16px; font-weight: 700; color: #0f172a;">
              <span>Total TTC</span>
              <span style="color: #ea580c; font-size: 18px;">${(facture?.totalTTC || 0).toLocaleString('fr-FR')} ${currencySymbol}</span>
            </div>
            ${
              facture?.resteDu !== undefined
                ? `
            <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 13px; color: #64748b;">
              <span>Reste à payer</span>
              <span style="font-weight: 600; color: ${facture.resteDu > 0 ? '#dc2626' : '#16a34a'};">
                ${facture.resteDu.toLocaleString('fr-FR')} ${currencySymbol}
              </span>
            </div>`
                : ''
            }
          </div>

          <!-- Notes / Payment terms -->
          <div style="font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 24px;">
            <p style="margin: 0;"><strong>Date d'échéance :</strong> ${facture?.dateEcheance || 'À réception'}</p>
            <p style="margin: 4px 0 0 0;">Pour toute question relative à cette facture, merci de contacter <a href="mailto:${companyEmail}" style="color: #ea580c; text-decoration: none;">${companyEmail}</a>.</p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f1f5f9; padding: 16px 28px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0;">Facture générée automatiquement via <strong>GestPro</strong> pour <strong>${companyName}</strong>.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    const fromAddress =
      process.env.RESEND_FROM_EMAIL ||
      `${companyName.replace(/[^a-zA-Z0-9 ]/g, '')} <onboarding@resend.dev>`;

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [to],
      subject: emailSubject,
      html: htmlContent,
    });

    if (error) {
      console.error('Erreur Resend:', error);
      let userFriendlyMsg = error.message;
      if (error.message?.includes('only send testing emails to your own email address')) {
        userFriendlyMsg = "En mode test gratuit Resend, vous pouvez envoyer des tests uniquement vers l'adresse email de votre compte Resend. Pour envoyer à tous vos clients, validez votre domaine sur resend.com/domains.";
      }
      return NextResponse.json({ error: userFriendlyMsg }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Erreur API send-email:', err);
    return NextResponse.json(
      { error: err.message || 'Une erreur est survenue lors de l’envoi' },
      { status: 500 }
    );
  }
}
