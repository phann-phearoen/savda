// Detects preferred locale and redirects "/" to "/en/" or "/km/", remembering the choice via cookie.
const COOKIE_NAME = "savda_locale";
const SUPPORTED_LOCALES = ["en", "km"];
const DEFAULT_LOCALE = "en";

function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function detectLocale() {
  const cookieLocale = getCookie(COOKIE_NAME);
  if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)) return cookieLocale;

  const browserLocale = (navigator.language || DEFAULT_LOCALE).slice(0, 2).toLowerCase();
  return SUPPORTED_LOCALES.includes(browserLocale) ? browserLocale : DEFAULT_LOCALE;
}

const locale = detectLocale();
window.location.replace(`/${locale}/`);
