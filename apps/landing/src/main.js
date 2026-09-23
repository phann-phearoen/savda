// Persists the visitor's chosen locale (set on any locale page visit) and wires the language switcher.
const COOKIE_NAME = "savda_locale";
const COOKIE_MAX_AGE_DAYS = 365;

function setCookie(name, value, days) {
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

const currentLocale = document.documentElement.lang;
if (currentLocale) {
  setCookie(COOKIE_NAME, currentLocale, COOKIE_MAX_AGE_DAYS);
}

document.querySelectorAll(".lang-switch a").forEach((link) => {
  link.addEventListener("click", () => {
    const targetLocale = link.getAttribute("href").replace(/\//g, "");
    setCookie(COOKIE_NAME, targetLocale, COOKIE_MAX_AGE_DAYS);
  });
});
