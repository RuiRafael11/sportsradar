const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const CURRENCY_RE = /^[a-z]{3}$/;

function isValidDateString(value) {
  if (!ISO_DATE_RE.test(String(value || ''))) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isValidTimeString(value) {
  return TIME_RE.test(String(value || ''));
}

function normalizeCurrency(value = 'eur') {
  const currency = String(value || 'eur').toLowerCase().trim();
  return CURRENCY_RE.test(currency) ? currency : null;
}

function parsePositiveInteger(value) {
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) return null;
  return number;
}

module.exports = {
  isValidDateString,
  isValidTimeString,
  normalizeCurrency,
  parsePositiveInteger,
};
