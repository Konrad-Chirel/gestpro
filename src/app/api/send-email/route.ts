import { NextResponse, type NextRequest } from 'next/server';
import { resend } from '@/lib/resend';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, facture, companySettings } = body;

    if (!to || typeof to !== 'string') {
      return NextResponse.json({ error: 'Adresse email destinataire manquante' }, { status: 400 });
    }

    const companyName = companySettings?.companyName || 'GestPro S.A.S';
    const companyAddress = companySettings?.address || '15 Avenue des Champs-Élysées';
    const companyZip = companySettings?.zip || '75008';
    const companyCity = companySettings?.city || 'Paris';
    const companyTva = companySettings?.tva || 'FR 12 345678901';
    const companyEmail = companySettings?.email || 'contact@gestpro.app';
    const currency = companySettings?.currency || 'EUR';
    const currencySymbol = currency === 'XOF' ? 'FCFA' : currency === 'USD' ? '$' : '€';

    const formatPrice = (val: number) => {
      return (
        (Number(val) || 0).toLocaleString('fr-FR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) + ` ${currencySymbol}`
      );
    };

    const factureNumber = facture?.numero || 'FAC-2026-0038';
    const clientNom = facture?.clientNom || 'Amadou Trading';
    const clientAddress = facture?.clientAdresse || 'Zone Industrielle Sud, Lot 42, BP 1234 Dakar, Sénégal';
    const clientNinea = facture?.clientSiret || '001234567 2B2';
    const dateEmission = facture?.dateEmission || '24/10/2026';
    const dateEcheance = facture?.dateEcheance || '24/11/2026';
    const statut = facture?.statut || 'attente';

    // Articles resolution
    const articles =
      facture?.articles && facture.articles.length > 0
        ? facture.articles
        : [
            { description: 'Farine de Blé', quantity: 10, unitPrice: 35.0, total: 350.0 },
            { description: "Huile d'Arachide", quantity: 15, unitPrice: 42.0, total: 630.0 },
          ];

    const totalTTC = Number(facture?.totalTTC) || 24500;
    const totalHT = Number(facture?.totalHT) || (totalTTC ? totalTTC / 1.2 : 20416.67);
    const tva = Number(facture?.tva) || (totalTTC ? totalTTC - totalHT : 4083.33);
    const montantPaye = facture?.montantPaye !== undefined ? Number(facture.montantPaye) : 500;
    const resteDu = facture?.resteDu !== undefined ? Number(facture.resteDu) : 24000;

    // Status badge HTML
    let statusBadgeHtml = `
      <span style="display: inline-block; background-color: #fef3c7; color: #b45309; border: 1px solid #fde68a; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">
        En attente
      </span>`;
    if (statut === 'payee') {
      statusBadgeHtml = `
        <span style="display: inline-block; background-color: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">
          Payée
        </span>`;
    } else if (statut === 'retard') {
      statusBadgeHtml = `
        <span style="display: inline-block; background-color: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">
          En retard
        </span>`;
    } else if (statut === 'annulee') {
      statusBadgeHtml = `
        <span style="display: inline-block; background-color: #f1f5f9; color: #64748b; border: 1px solid #cbd5e1; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">
          Annulée
        </span>`;
    }

    // Articles rows HTML
    const articlesRowsHtml = articles
      .map((art: any) => {
        const desc = art.description || art.designation || art.nom || 'Article';
        const qte = Number(art.quantity || art.quantite || 1);
        const pu = Number(art.unitPrice || art.prixUnitaire || art.prix || 0);
        const lineTotal = Number(art.total || qte * pu);

        return `
        <tr>
          <td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; font-size: 13px; font-weight: 600; color: #131313; text-align: left;">
            ${desc}
          </td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #64748b; text-align: center;">
            ${qte}
          </td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #64748b; text-align: right; white-space: nowrap;">
            ${formatPrice(pu)}
          </td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; font-size: 13px; font-weight: 700; color: #131313; text-align: right; white-space: nowrap;">
            ${formatPrice(lineTotal)}
          </td>
        </tr>`;
      })
      .join('');

    // If Resend API key is not yet provided, simulate successful sending in development
    if (!resend) {
      return NextResponse.json({
        success: true,
        simulated: true,
        message:
          "Simulation d'envoi réussie. Pour envoyer de véritables emails, ajoutez votre clé RESEND_API_KEY dans les variables d'environnement.",
      });
    }

    const emailSubject = subject || `Facture ${factureNumber} - ${companyName}`;

    // Exactly recreate the beautiful GestPro invoice sheet design
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${emailSubject}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 32px 12px; color: #131313; -webkit-font-smoothing: antialiased;">
      
      <!-- Container -->
      <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 auto; max-width: 650px;">
        <tr>
          <td>
            
            <!-- White Invoice Paper Document -->
            <div style="background-color: #ffffff; border-radius: 14px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); padding: 36px 32px; overflow: hidden;">
              
              <!-- Top Header: GestPro brand + Facture number -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <tr>
                  <td style="vertical-align: top;">
                    <table role="presentation" style="border-collapse: collapse;">
                      <tr>
                        <td style="width: 40px; height: 40px; background-color: #fff7ed; border: 1.5px solid #fed7aa; border-radius: 8px; text-align: center; vertical-align: middle;">
                          <span style="font-size: 20px; line-height: 1;">📄</span>
                        </td>
                        <td style="padding-left: 10px; vertical-align: middle;">
                          <div style="font-size: 20px; font-weight: 800; color: #ea580c; letter-spacing: -0.5px; line-height: 1.1;">GestPro</div>
                          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Solutions de gestion</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td style="text-align: right; vertical-align: top;">
                    <div style="font-size: 22px; font-weight: 900; color: #131313; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1;">FACTURE</div>
                    <div style="font-size: 13px; font-weight: 600; color: #64748b; margin-top: 4px;">N° ${factureNumber}</div>
                  </td>
                </tr>
              </table>

              <!-- Info Grid: Émetteur vs Facturé à -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 22px;">
                <tr>
                  <td style="width: 50%; vertical-align: top; padding-right: 10px;">
                    <div style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">ÉMETTEUR</div>
                    <div style="font-size: 14px; font-weight: 700; color: #131313;">${companyName}</div>
                    <div style="font-size: 12px; color: #475569; line-height: 1.45; margin-top: 3px;">
                      ${companyAddress}<br/>
                      ${companyZip} ${companyCity}<br/>
                      TVA : ${companyTva}
                    </div>
                  </td>
                  <td style="width: 50%; vertical-align: top; padding-left: 10px;">
                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                      <div style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">FACTURÉ À</div>
                      <div style="font-size: 15px; font-weight: 800; color: #131313;">${clientNom}</div>
                      <div style="font-size: 12px; color: #475569; line-height: 1.45; margin-top: 3px;">
                        ${clientAddress}<br/>
                        NINEA : ${clientNinea}
                      </div>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Dates & Status Bar -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; margin-bottom: 22px;">
                <tr>
                  <td style="padding: 10px 0;">
                    <span style="font-size: 9px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; display: block;">DATE D'ÉMISSION</span>
                    <span style="font-size: 13px; font-weight: 600; color: #131313;">${dateEmission}</span>
                  </td>
                  <td style="padding: 10px 14px;">
                    <span style="font-size: 9px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; display: block;">ÉCHÉANCE</span>
                    <span style="font-size: 13px; font-weight: 600; color: #131313;">${dateEcheance}</span>
                  </td>
                  <td style="padding: 10px 0; text-align: right; vertical-align: middle;">
                    ${statusBadgeHtml}
                  </td>
                </tr>
              </table>

              <!-- Articles Table -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 22px;">
                <thead>
                  <tr style="border-bottom: 2px solid #131313;">
                    <th style="padding: 8px 6px; font-size: 11px; font-weight: 800; color: #131313; text-transform: uppercase; text-align: left;">Description</th>
                    <th style="padding: 8px 6px; font-size: 11px; font-weight: 800; color: #131313; text-transform: uppercase; text-align: center; width: 50px;">Qté</th>
                    <th style="padding: 8px 6px; font-size: 11px; font-weight: 800; color: #131313; text-transform: uppercase; text-align: right; width: 100px;">Prix Unit.</th>
                    <th style="padding: 8px 6px; font-size: 11px; font-weight: 800; color: #131313; text-transform: uppercase; text-align: right; width: 100px;">Total HT</th>
                  </tr>
                </thead>
                <tbody>
                  ${articlesRowsHtml}
                </tbody>
              </table>

              <!-- Totals Section -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                  <td style="width: 40%;"></td>
                  <td style="width: 60%; vertical-align: top;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 3px 0; font-size: 12px; color: #64748b;">Total Hors Taxes (HT)</td>
                        <td style="padding: 3px 0; font-size: 12px; font-weight: 600; color: #131313; text-align: right; white-space: nowrap;">${formatPrice(totalHT)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 3px 0; font-size: 12px; color: #64748b;">TVA (20%)</td>
                        <td style="padding: 3px 0; font-size: 12px; font-weight: 600; color: #131313; text-align: right; white-space: nowrap;">${formatPrice(tva)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0 4px 0; font-size: 14px; font-weight: 800; color: #131313; border-top: 2px solid #131313;">Net à Payer (TTC)</td>
                        <td style="padding: 8px 0 4px 0; font-size: 18px; font-weight: 900; color: #131313; text-align: right; border-top: 2px solid #131313; white-space: nowrap;">${formatPrice(totalTTC)}</td>
                      </tr>
                      ${
                        montantPaye > 0
                          ? `
                      <tr>
                        <td colspan="2" style="padding-top: 6px;">
                          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 6px 10px;">
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                              <tr>
                                <td style="font-size: 11px; font-weight: 700; color: #16a34a;">Montant réglé</td>
                                <td style="font-size: 11px; font-weight: 700; color: #16a34a; text-align: right; white-space: nowrap;">${formatPrice(montantPaye)}</td>
                              </tr>
                            </table>
                          </div>
                        </td>
                      </tr>`
                          : ''
                      }
                      ${
                        resteDu > 0
                          ? `
                      <tr>
                        <td colspan="2" style="padding-top: 6px;">
                          <div style="background-color: #fef9c3; border: 1px solid #fde047; border-radius: 6px; padding: 6px 10px;">
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                              <tr>
                                <td style="font-size: 12px; font-weight: 800; color: #854d0e;">Solde restant dû</td>
                                <td style="font-size: 13px; font-weight: 800; color: #854d0e; text-align: right; white-space: nowrap;">${formatPrice(resteDu)}</td>
                              </tr>
                            </table>
                          </div>
                        </td>
                      </tr>`
                          : ''
                      }
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Remarks Box -->
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 14px; font-size: 11px; color: #4b5563; margin-bottom: 22px;">
                <strong style="color: #111827;">Remarques :</strong> Paiement à 30 jours fin de mois.
              </div>

              <!-- Centered Legal Footer -->
              <div style="border-top: 1px solid #e5e7eb; padding-top: 14px; text-align: center; font-size: 10px; color: #94a3b8; line-height: 1.5;">
                ${companyName} - ${companyAddress} ${companyZip} ${companyCity} - Document officiel
              </div>

            </div>

          </td>
        </tr>
      </table>

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
        userFriendlyMsg =
          "En mode test gratuit Resend, vous pouvez envoyer des tests uniquement vers l'adresse email de votre compte Resend. Pour envoyer à tous vos clients, validez votre domaine sur resend.com/domains.";
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
