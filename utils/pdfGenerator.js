import { jsPDF } from 'jspdf'; // Import jsPDF
import 'jspdf-autotable'; // Import de la fonctionnalité autoTable pour les tableaux
import { getTodayReservationsForSalle } from './supabase/reservation';

export const handlePrint = async (salle) => {
  const doc = new jsPDF(); // Assurez-vous d'utiliser jsPDF ici

  // URLs des logos
  const melkiorLogoUrl = '/logos/LogoMel.png';
  const baltazarLogoUrl = '/logos/LogoBal.png';

  const melkiorOriginalWidth = 283;
  const melkiorOriginalHeight = 265;
  const baltazarOriginalWidth = 163;
  const baltazarOriginalHeight = 277;
  const targetLogoWidth = 10;
  let targetLogoHeight;
  let logoUrl;

  if (salle === 'melkior') {
    logoUrl = melkiorLogoUrl;
    targetLogoHeight =
      (melkiorOriginalHeight / melkiorOriginalWidth) *
      targetLogoWidth;
  } else if (salle === 'baltazar') {
    logoUrl = baltazarLogoUrl;
    targetLogoHeight =
      (baltazarOriginalHeight / baltazarOriginalWidth) *
      targetLogoWidth;
  }

  const pageWidth = doc.internal.pageSize.getWidth();
  const centerX = (pageWidth - targetLogoWidth) / 2;
  doc.addImage(
    logoUrl,
    'PNG',
    centerX,
    10,
    targetLogoWidth,
    targetLogoHeight
  );

  const titleYPosition = 10 + targetLogoHeight + 10;
  doc.setFont('helvetica', 'bold');
  const titleText = 'RÉSERVATIONS';
  doc.text(titleText, pageWidth / 2, titleYPosition, {
    align: 'center',
  });

  const today = new Date();
  const daysOfWeek = [
    'dimanche',
    'lundi',
    'mardi',
    'mercredi',
    'jeudi',
    'vendredi',
    'samedi',
  ];
  const monthsOfYear = [
    'janvier',
    'février',
    'mars',
    'avril',
    'mai',
    'juin',
    'juillet',
    'août',
    'septembre',
    'octobre',
    'novembre',
    'décembre',
  ];
  const dayName = daysOfWeek[today.getDay()];
  const day = String(today.getDate()).padStart(2, '0');
  const month = monthsOfYear[today.getMonth()];
  const fullDate = `${dayName} ${day} ${month}`.toUpperCase();
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(fullDate, pageWidth / 2, titleYPosition + 5, {
    align: 'center',
  });

  const reservations = await getTodayReservationsForSalle(salle);

  if (reservations.length === 0) {
    doc.text(
      `Aucune réservation trouvée pour ${salle} aujourd'hui`,
      10,
      titleYPosition + 15
    );
  } else {
    const rows = reservations.map((reservation) => [
      reservation.nom,
      reservation.nombre,
      reservation.acompte ? `${reservation.acompte} €` : '0 €',
      reservation.commentaire,
      reservation.table || '-',
    ]);

    doc.autoTable({
      head: [['Nom', 'Nombre', 'Acompte', 'Commentaire', 'Table']],
      body: rows,
      startY: titleYPosition + 15,
      styles: { halign: 'center' },
      headStyles: {
        fillColor: [105, 105, 105],
        textColor: [255, 255, 255],
      },
      tableWidth: 'auto',
      margin: { left: 15, right: 15 },
    });
  }

  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);

  const link = document.createElement('a');
  link.href = pdfUrl;
  link.target = '_blank'; // Ouvrir dans un nouvel onglet
  link.download = `reservations_${salle}.pdf`; // Nom du fichier PDF
  document.body.appendChild(link);
  link.click(); // Simuler le clic pour ouvrir le lien
  document.body.removeChild(link); // Nettoyer le DOM
  URL.revokeObjectURL(pdfUrl); // Révoquer l'URL temporaire pour libérer la mémoire
};
