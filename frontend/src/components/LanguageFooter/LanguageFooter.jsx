import useLanguageStore from '../../store/useLanguageStore';
import './LanguageFooter.css';

const languages = [
    { code: 'en', label: 'English' },
    { code: 'gu', label: 'ગુજરાતી' },
    { code: 'hi', label: 'हिन्दी' },
];

const LanguageFooter = () => {
    const { language, setLanguage } = useLanguageStore();

    return (
        <footer className="language-footer" id="language-footer">
            <div className="language-footer__inner">
                {languages.map((lang, index) => (
                    <span key={lang.code} className="language-footer__item">
                        <button
                            id={`lang-btn-${lang.code}`}
                            className={`language-footer__btn ${language === lang.code ? 'language-footer__btn--active' : ''}`}
                            onClick={() => setLanguage(lang.code)}
                            aria-label={`Switch to ${lang.label}`}
                        >
                            {lang.label}
                        </button>
                        {index < languages.length - 1 && (
                            <span className="language-footer__divider">|</span>
                        )}
                    </span>
                ))}
            </div>
        </footer>
    );
};

export default LanguageFooter;
