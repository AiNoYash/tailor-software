import { Users } from 'lucide-react';
import useLanguageStore from '../../store/useLanguageStore';
import { t } from '../../i18n';

const CustomerPage = () => {
    const language = useLanguageStore((state) => state.language);

    return (
        <div className="placeholder-page">
            <div className="placeholder-card">
                <Users size={40} strokeWidth={1.5} />
                <h2>{t('nav.customer', language)}</h2>
                <p>{t('placeholder.message', language)}</p>
            </div>
        </div>
    );
};

export default CustomerPage;
