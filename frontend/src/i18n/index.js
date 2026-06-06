import en from './en.json';
import hi from './hi.json';
import gu from './gu.json';

const locales = { en, hi, gu };

/**
 * Translate a key using the given language.
 * Supports {{placeholder}} interpolation.
 *
 * @param {string} key - The translation key (e.g. "login.heading")
 * @param {string} language - The locale code ("en", "hi", "gu")
 * @param {Object} [replacements] - Key-value pairs for interpolation
 * @returns {string} The translated string, or the key itself if not found
 */
export const t = (key, language = 'en', replacements = {}) => {
    const locale = locales[language] || locales.en;
    let value = locale[key] || locales.en[key] || key;

    // Replace {{placeholder}} patterns
    Object.entries(replacements).forEach(([placeholder, replacement]) => {
        value = value.replace(new RegExp(`{{${placeholder}}}`, 'g'), replacement);
    });

    return value;
};

export default t;
