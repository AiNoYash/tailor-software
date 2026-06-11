import { useState } from 'react';
import { Search, Trash2, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../../store/useAuthStore';
import useLanguageStore from '../../../store/useLanguageStore';
import { t } from '../../../i18n';
import { searchOrders, deleteOrder } from '../../../api/orders';
import './SearchOrder.css';

const defaultParams = { billNo: '', name: '', mobile: '', fromDate: '', toDate: '' };

const SearchOrder = () => {
    const token = useAuthStore((state) => state.token);
    const language = useLanguageStore((state) => state.language);
    const navigate = useNavigate();
    
    const [params, setParams] = useState({ ...defaultParams });
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = await searchOrders(params, token);
            setResults(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setParams({ ...defaultParams });
        setResults([]);
        setError('');
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('search.delete_confirm', language))) return;
        try {
            await deleteOrder(id, token);
            setResults(results.filter((order) => order.id !== id));
        } catch (err) {
            alert(err.message);
        }
    };

    const handleEdit = (id) => {
        // Assuming AddOrder page acts as the editor when bill_no is inputted
        navigate(`/customer?bill=${id}`);
    };

    return (
        <div className="search-order-page">
            <form className="search-filters" onSubmit={handleSearch}>
                <div className="form-group">
                    <label className="form-label">{t('order.bill_no', language)}</label>
                    <input className="form-input" type="number" 
                        value={params.billNo} onChange={(e) => setParams({ ...params, billNo: e.target.value })} />
                </div>
                <div className="form-group">
                    <label className="form-label">{t('order.name', language)}</label>
                    <input className="form-input" type="text" 
                        value={params.name} onChange={(e) => setParams({ ...params, name: e.target.value })} />
                </div>
                <div className="form-group">
                    <label className="form-label">{t('order.mobile', language)}</label>
                    <input className="form-input" type="tel" 
                        value={params.mobile} onChange={(e) => setParams({ ...params, mobile: e.target.value })} />
                </div>
                <div className="form-group">
                    <label className="form-label">{t('report.from', language)}</label>
                    <input className="form-input" type="date" 
                        value={params.fromDate} onChange={(e) => setParams({ ...params, fromDate: e.target.value })} />
                </div>
                <div className="form-group">
                    <label className="form-label">{t('report.to', language)}</label>
                    <input className="form-input" type="date" 
                        value={params.toDate} onChange={(e) => setParams({ ...params, toDate: e.target.value })} />
                </div>

                <div className="search-actions">
                    <button type="submit" className="btn-primary" disabled={loading}>
                        <Search size={18} /> {loading ? t('report.loading', language) : t('nav.customer.search', language)}
                    </button>
                    <button type="button" className="btn-secondary" onClick={handleClear}>
                        {t('work.clear', language)}
                    </button>
                </div>
            </form>

            {error && <p className="form-error">{error}</p>}

            <div className="search-results-container">
                {results.length > 0 ? (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>{t('order.bill_no', language)}</th>
                                <th>{t('order.name', language)}</th>
                                <th>{t('order.date', language)}</th>
                                <th>{t('order.delivery_date', language)}</th>
                                <th className="text-right">{t('order.remaining', language)}</th>
                                <th className="text-center">{t('work.col.actions', language)}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map((order) => {
                                const remaining = Math.max(0, Number(order.total_amount) - Number(order.deposit_amount));
                                return (
                                    <tr key={order.id}>
                                        <td><strong>#{order.id}</strong></td>
                                        <td>
                                            <div>{order.customer_name}</div>
                                            <div className="text-sm text-muted">{order.mobile_no}</div>
                                        </td>
                                        <td>{new Date(order.order_date).toLocaleDateString('en-GB')}</td>
                                        <td>{new Date(order.delivery_date).toLocaleDateString('en-GB')}</td>
                                        <td className="text-right font-bold">₹{remaining}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="btn-icon btn-icon--edit" onClick={() => handleEdit(order.id)}>
                                                    <Edit size={16} />
                                                </button>
                                                <button className="btn-icon btn-icon--delete" onClick={() => handleDelete(order.id)}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    !loading && <p className="empty-state">{t('search.empty', language)}</p>
                )}
            </div>
        </div>
    );
};

export default SearchOrder;