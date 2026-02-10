export const formatHours = (hours: number | undefined | null): string => {
  if (hours === undefined || hours === null) return '0';
  // Round to max 2 decimal places.
  // If it's an integer, it shows as integer (e.g. 5).
  // If it has decimals, it shows up to 2 (e.g. 5.5, 5.25).
  return Number(hours).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};
