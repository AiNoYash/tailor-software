import { t } from '../../../i18n';
import useLanguageStore from '../../../store/useLanguageStore';

const SearchOrder = () => {
    const language = useLanguageStore((state) => state.language);
    return (
        <div className="placeholder-page">
            <div className="placeholder-card">
                <h2>{t('nav.customer.search', language)}</h2>
                <p>{t('placeholder.message', language)}</p>
            </div>
        </div>
    );
};

export default SearchOrder;
