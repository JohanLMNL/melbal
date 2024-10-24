export function toShortDate(dateString) {
  const date = new Date(dateString);
  const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const months = [
    'Jan',
    'Fév',
    'Mar',
    'Avr',
    'Mai',
    'Juin',
    'Jui',
    'Aoû',
    'Sep',
    'Oct',
    'Nov',
    'Déc',
  ];
  const dayOfWeek = days[date.getDay()];
  const dayOfMonth = date.getDate();
  const month = months[date.getMonth()];

  return `${dayOfWeek} ${dayOfMonth} ${month}`;
}

export function toShortTime(timeString) {
  if (!timeString || typeof timeString !== 'string') {
    return '';
  }

  const [hours, minutes] = timeString.split(':');

  if (hours === undefined || minutes === undefined) {
    console.error('Invalid time format');
    return '';
  }

  return `${hours}h${minutes}`;
}

export const getCurrentDate = () => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
