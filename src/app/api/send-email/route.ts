import { NextResponse, type NextRequest } from 'next/server';
import { resend } from '@/lib/resend';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function generateInvoicePdf(facture: any, companySettings: any, currencySymbol: string): Buffer {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const companyName = companySettings?.companyName || 'GestPro S.A.S';
  const companyAddress = companySettings?.address || '15 Avenue des Champs-Élysées';
  const companyCity = `${companySettings?.zip || '75008'} ${companySettings?.city || 'Paris'}`;
  const companyTva = companySettings?.tva || 'FR 12 345678901';

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

  const totalTTC = Number(facture?.totalTTC) || 24500;
  const totalHT = Number(facture?.totalHT) || (totalTTC ? totalTTC / 1.2 : 20416.67);
  const tva = Number(facture?.tva) || (totalTTC ? totalTTC - totalHT : 4083.33);
  const montantPaye = facture?.montantPaye !== undefined ? Number(facture.montantPaye) : 500;
  const resteDu = facture?.resteDu !== undefined ? Number(facture.resteDu) : 24000;

  // Header GestPro
  doc.setFillColor(234, 88, 12);
  doc.roundedRect(15, 14, 11, 11, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('GP', 17.5, 21.5);

  doc.setFontSize(19);
  doc.setTextColor(234, 88, 12);
  doc.text('GestPro', 30, 21.5);

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text('Solutions de gestion', 30, 26);

  // Header Right: FACTURE
  doc.setFontSize(20);
  doc.setTextColor(19, 19, 19);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURE', 195, 21, { align: 'right' });

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text(`N° ${factureNumber}`, 195, 26.5, { align: 'right' });

  // Émetteur (Left)
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'bold');
  doc.text('ÉMETTEUR', 15, 38);

  doc.setFontSize(10.5);
  doc.setTextColor(19, 19, 19);
  doc.text(companyName, 15, 43.5);

  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.text([companyAddress, companyCity, `TVA : ${companyTva}`], 15, 48.5);

  // Facturé à (Right Box)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(115, 34, 80, 28, 3, 3, 'FD');

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURÉ À', 120, 40);

  doc.setFontSize(11);
  doc.setTextColor(19, 19, 19);
  doc.text(clientNom, 120, 46);

  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.text([clientAddress, `NINEA : ${clientNinea}`], 120, 51);

  // Dates bar
  doc.setDrawColor(226, 232, 240);
  doc.line(15, 68, 195, 68);

  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'bold');
  doc.text("DATE D'ÉMISSION", 15, 73);
  doc.text('ÉCHÉANCE', 65, 73);

  doc.setFontSize(9);
  doc.setTextColor(19, 19, 19);
  doc.text(dateEmission, 15, 78);
  doc.text(dateEcheance, 65, 78);

  // Badge Status
  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(253, 230, 138);
  doc.roundedRect(165, 71, 30, 7, 3.5, 3.5, 'FD');
  doc.setTextColor(180, 83, 9);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('EN ATTENTE', 180, 75.5, { align: 'center' });

  doc.setDrawColor(226, 232, 240);
  doc.line(15, 82, 195, 82);

  // Articles Table
  const tableData = (facture.articles || []).map((art: any) => [
    art.description,
    String(art.quantity),
    formatPrice(art.unitPrice),
    formatPrice(art.total),
  ]);

  autoTable(doc, {
    head: [['Description', 'Qté', 'Prix Unit.', 'Total HT']],
    body: tableData,
    startY: 86,
    theme: 'plain',
    headStyles: {
      textColor: [19, 19, 19],
      fontStyle: 'bold',
      fontSize: 8.5,
      cellPadding: { top: 3.5, bottom: 3.5, left: 2, right: 2 },
      lineColor: [19, 19, 19],
      lineWidth: { bottom: 0.6 },
    },
    bodyStyles: {
      textColor: [50, 50, 50],
      fontSize: 8.5,
      cellPadding: { top: 3.5, bottom: 3.5, left: 2, right: 2 },
      lineColor: [240, 240, 240],
      lineWidth: { bottom: 0.2 },
    },
    columnStyles: {
      0: { cellWidth: 95 },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 32, halign: 'right' },
      3: { cellWidth: 33, halign: 'right', fontStyle: 'bold', textColor: [19, 19, 19] },
    },
    margin: { left: 15, right: 15 },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 130;

  // Totals Section
  const totalsX = 115;
  let currentY = finalY + 6;

  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Total Hors Taxes (HT)', totalsX, currentY);
  doc.setTextColor(19, 19, 19);
  doc.text(formatPrice(totalHT), 195, currentY, { align: 'right' });

  currentY += 5;
  doc.setTextColor(100, 116, 139);
  doc.text('TVA (20%)', totalsX, currentY);
  doc.setTextColor(19, 19, 19);
  doc.text(formatPrice(tva), 195, currentY, { align: 'right' });

  currentY += 2;
  doc.setDrawColor(19, 19, 19);
  doc.setLineWidth(0.4);
  doc.line(totalsX, currentY, 195, currentY);

  currentY += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(19, 19, 19);
  doc.text('Net à Payer (TTC)', totalsX, currentY);
  doc.setFontSize(13);
  doc.text(formatPrice(totalTTC), 195, currentY, { align: 'right' });

  if (montantPaye > 0) {
    currentY += 5;
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(totalsX, currentY, 80, 7, 2, 2, 'FD');
    doc.setFontSize(8);
    doc.setTextColor(22, 163, 74);
    doc.text('Montant réglé', totalsX + 4, currentY + 4.5);
    doc.text(formatPrice(montantPaye), 191, currentY + 4.5, { align: 'right' });
    currentY += 5;
  }

  if (resteDu > 0) {
    currentY += 3;
    doc.setFillColor(254, 249, 195);
    doc.setDrawColor(253, 224, 71);
    doc.roundedRect(totalsX, currentY, 80, 8, 2, 2, 'FD');
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(133, 77, 14);
    doc.text('Solde restant dû', totalsX + 4, currentY + 5.2);
    doc.text(formatPrice(resteDu), 191, currentY + 5.2, { align: 'right' });
    currentY += 8;
  }

  // Remarks box
  currentY = Math.max(currentY + 10, finalY + 36);
  doc.setFillColor(249, 250, 251);
  doc.setDrawColor(229, 231, 235);
  doc.roundedRect(15, currentY, 180, 10, 2, 2, 'FD');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text('Remarques :', 19, currentY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  doc.text('Paiement à 30 jours fin de mois.', 42, currentY + 6);

  // Footer
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.setDrawColor(229, 231, 235);
  doc.line(15, 275, 195, 275);
  doc.text(`${companyName} - ${companyAddress} ${companyCity} - Document officiel`, 105, 280, { align: 'center' });

  return Buffer.from(doc.output('arraybuffer'));
}

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

    const formattedTotalHT = formatPrice(totalHT);
    const formattedTVA = formatPrice(tva);
    const formattedTotalTTC = formatPrice(totalTTC);
    const formattedMontantPaye = formatPrice(montantPaye);
    const formattedResteDu = formatPrice(resteDu);

    // Generate high-resolution official A4 PDF Buffer
    const pdfBuffer = generateInvoicePdf(
      {
        numero: factureNumber,
        clientNom,
        clientAdresse: clientAddress,
        clientSiret: clientNinea,
        dateEmission,
        dateEcheance,
        statut,
        articles,
        totalHT,
        tva,
        totalTTC,
        montantPaye,
        resteDu,
      },
      companySettings,
      currencySymbol
    );

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
    }

    // Articles rows HTML with protection against Gmail blue link styling
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
          <td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #475569; text-align: center;">
            <span style="color: #475569; text-decoration: none;">${qte}</span>
          </td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #475569; text-align: right; white-space: nowrap;">
            <span style="color: #475569; text-decoration: none;">${formatPrice(pu)}</span>
          </td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; font-size: 13px; font-weight: 700; color: #131313; text-align: right; white-space: nowrap;">
            <span style="color: #131313; text-decoration: none;">${formatPrice(lineTotal)}</span>
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

    // Responsive, high-fidelity email HTML
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${emailSubject}</title>
      <style type="text/css">
        a[x-apple-data-detectors],
        .appleLinks a,
        u + #body a,
        #MessageViewBody a {
          color: inherit !important;
          text-decoration: none !important;
          font-size: inherit !important;
          font-family: inherit !important;
          font-weight: inherit !important;
          line-height: inherit !important;
        }
      </style>
    </head>
    <body id="body" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 32px 12px; color: #131313; -webkit-font-smoothing: antialiased;">
      
      <!-- Container -->
      <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 auto; max-width: 600px;">
        <tr>
          <td>

            <!-- Download Notice Card -->
            <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fff7ed; border: 1.5px solid #fed7aa; border-radius: 12px; margin-bottom: 16px;">
              <tr>
                <td style="padding: 14px 18px;">
                  <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="width: 32px; vertical-align: middle;">
                        <span style="font-size: 24px; line-height: 1;">📥</span>
                      </td>
                      <td style="vertical-align: middle; padding-left: 10px;">
                        <div style="font-size: 13.5px; font-weight: 700; color: #9a3412;">
                          Facture officielle jointe en pièce jointe PDF
                        </div>
                        <div style="font-size: 12px; color: #c2410c; margin-top: 2px;">
                          Le document <strong>${factureNumber}.pdf</strong> est disponible en bas de ce mail pour impression et comptabilité.
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            
            <!-- White Invoice Paper Document -->
            <div style="background-color: #ffffff; border-radius: 14px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); padding: 32px 28px; overflow: hidden;">
              
              <!-- Top Header: GestPro brand + Facture number -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <tr>
                  <td style="vertical-align: top;">
                    <table role="presentation" style="border-collapse: collapse;">
                      <tr>
                        <td style="width: 42px; height: 42px; background-color: #fff7ed; border: 1.5px solid #fed7aa; border-radius: 10px; text-align: center; vertical-align: middle;">
                          <table role="presentation" style="margin: 0 auto;"><tr><td style="font-size: 15px; font-weight: 900; color: #ea580c; line-height: 1;">GP</td></tr></table>
                        </td>
                        <td style="padding-left: 12px; vertical-align: middle;">
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
                    <div style="font-size: 12px; color: #475569; line-height: 1.5; margin-top: 3px;">
                      <span style="color: #475569; text-decoration: none;">${companyAddress}</span><br/>
                      <span style="color: #475569; text-decoration: none;">${companyZip} ${companyCity}</span><br/>
                      TVA : ${companyTva}
                    </div>
                  </td>
                  <td style="width: 50%; vertical-align: top; padding-left: 10px;">
                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                      <div style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">FACTURÉ À</div>
                      <div style="font-size: 15px; font-weight: 800; color: #131313;">${clientNom}</div>
                      <div style="font-size: 12px; color: #475569; line-height: 1.5; margin-top: 3px;">
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
                    <th style="padding: 8px 6px; font-size: 11px; font-weight: 800; color: #131313; text-transform: uppercase; text-align: center; width: 45px;">Qté</th>
                    <th style="padding: 8px 6px; font-size: 11px; font-weight: 800; color: #131313; text-transform: uppercase; text-align: right; width: 90px;">Prix Unit.</th>
                    <th style="padding: 8px 6px; font-size: 11px; font-weight: 800; color: #131313; text-transform: uppercase; text-align: right; width: 95px;">Total HT</th>
                  </tr>
                </thead>
                <tbody>
                  ${articlesRowsHtml}
                </tbody>
              </table>

              <!-- Totals Section -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                  <td style="width: 35%;"></td>
                  <td style="width: 65%; vertical-align: top;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 4px 0; font-size: 12px; color: #64748b;">Total Hors Taxes (HT)</td>
                        <td style="padding: 4px 0; font-size: 12px; font-weight: 600; color: #131313; text-align: right; white-space: nowrap;"><span style="color: #131313; text-decoration: none;">${formattedTotalHT}</span></td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; font-size: 12px; color: #64748b;">TVA (20%)</td>
                        <td style="padding: 4px 0; font-size: 12px; font-weight: 600; color: #131313; text-align: right; white-space: nowrap;"><span style="color: #131313; text-decoration: none;">${formattedTVA}</span></td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0 4px 0; font-size: 14px; font-weight: 800; color: #131313; border-top: 2px solid #131313;">Net à Payer (TTC)</td>
                        <td style="padding: 8px 0 4px 0; font-size: 17px; font-weight: 900; color: #131313; text-align: right; border-top: 2px solid #131313; white-space: nowrap;"><span style="color: #131313; text-decoration: none;">${formattedTotalTTC}</span></td>
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
                                <td style="font-size: 11px; font-weight: 700; color: #16a34a; text-align: right; white-space: nowrap;"><span style="color: #16a34a; text-decoration: none;">${formattedMontantPaye}</span></td>
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
                                <td style="font-size: 13px; font-weight: 800; color: #854d0e; text-align: right; white-space: nowrap;"><span style="color: #854d0e; text-decoration: none;">${formattedResteDu}</span></td>
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
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 14px; font-size: 11px; color: #4b5563; margin-bottom: 20px;">
                <strong style="color: #111827;">Remarques :</strong> Paiement à 30 jours fin de mois.
              </div>

              <!-- Centered Legal Footer -->
              <div style="border-top: 1px solid #e5e7eb; padding-top: 12px; text-align: center; font-size: 10px; color: #94a3b8; line-height: 1.5;">
                <span style="color: #94a3b8; text-decoration: none;">${companyName} - ${companyAddress} ${companyZip} ${companyCity} - Document officiel</span>
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
      attachments: [
        {
          filename: `${factureNumber}.pdf`,
          content: pdfBuffer,
        },
      ],
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
