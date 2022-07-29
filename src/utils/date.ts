const months = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'
];

/**
 * Format date like rocketseat's approach
 * @param dateString Complete date-time string
 */
export function formatDateLikeRocketseat(dateString: string) {
  const firstPublicationDate = new Date(dateString);

  return `${firstPublicationDate.getDate()} ${months[firstPublicationDate.getMonth()]} ${firstPublicationDate.getFullYear()}`;
}
