import { t } from '../../../i18n';
import useLanguageStore from '../../../store/useLanguageStore';

const OrderReport = () => {
    const language = useLanguageStore((state) => state.language);
    return (
        <div className="placeholder-page">
            <div className="placeholder-card">
                <h2>{t('nav.customer.report', language)}</h2>
                <p>{t('placeholder.message', language)}</p>
            </div>
        </div>
    );
};

export default OrderReport;
