import { useState } from 'react';
import { Search, Trash2, Edit, Printer, X, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PrintBillModal from '../../../components/PrintBillModal';
import TransliterateInput from '../../../components/TransliterateInput/TransliterateInput';
import useAuthStore from '../../../store/useAuthStore';
import useLanguageStore from '../../../store/useLanguageStore';
import { t } from '../../../i18n';
import { searchOrders, deleteOrder, fetchOrder } from '../../../api/orders';
import './SearchOrder.css';

/* ─── Helpers & Grids (Reused from AddOrder) ─── */
const localDateStr = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};



const defaultParams = { billNo: '', name: '', mobile: '', fromDate: '', toDate: '' };

const SearchOrder = () => {
    const token = useAuthStore((state) => state.token);
    const language = useLanguageStore((state) => state.language);
    const navigate = useNavigate();
    
    const [params, setParams] = useState({ ...defaultParams });
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Print Modal State
    const [printData, setPrintData] = useState(null);
    const [isPrinting, setIsPrinting] = useState(false); // To show loading state on the button

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
        navigate(`/customer?bill=${id}`);
    };

    const handleCopy = async (id) => {
        try {
            const data = await fetchOrder(id, token);
            const order = data.order;
            const items = data.items || [];
            navigate('/customer', {
                state: {
                    copyData: {
                        customer: {
                            customer_name: order.customer_name || '',
                            mobile_no: order.mobile_no || '',
                            address: order.address || '',
                        },
                        bottom: {
                            total_amount: order.total_amount || '',
                            sewing_total: order.sewing_total || '',
                            deposit_amount: order.deposit_amount || '',
                        },
                        items,
                    },
                },
            });
        } catch (err) {
            alert('Failed to copy order: ' + err.message);
        }
    };

    const handlePrint = async (id) => {
        setIsPrinting(true);
        try {
            // Fetch full order details including items and measurements
            const data = await fetchOrder(id, token);
            const order = data.order;
            const items = data.items || [];

            const customer = {
                customer_name: order.customer_name || '',
                mobile_no: order.mobile_no || '',
                address: order.address || '',
                order_date: order.order_date,
            };

            const bottom = {
                delivery_date: order.delivery_date,
                total_amount: order.total_amount || 0,
                sewing_total: order.sewing_total || 0,
                deposit_amount: order.deposit_amount || 0,
            };

            let pant = { enabled: false, type: '', sub_type: '', measurements: {}, pattern: '', options: {}, quantity: 0 };
            let shirt = { enabled: false, type: '', measurements: {}, pattern: '', options: {}, quantity: 0 };

            for (const item of items) {
                const det = item.details || {};
                if (item.item_type === 'pant') {
                    pant = {
                        enabled: true,
                        type: det.type || '',
                        sub_type: det.sub_type || '',
                        measurements: det.measurements || {},
                        pattern: det.pattern || '',
                        options: det.options || {},
                        quantity: item.quantity ?? 0,
                        notes: det.notes || '',
                    };
                } else if (item.item_type === 'shirt') {
                    shirt = {
                        enabled: true,
                        type: det.type || '',
                        measurements: det.measurements || {},
                        pattern: det.pattern || '',
                        options: det.options || {},
                        quantity: item.quantity ?? 0,
                        notes: det.notes || '',
                    };
                }
            }

            const remaining = Math.max(0, Number(bottom.total_amount) + Number(bottom.sewing_total) - Number(bottom.deposit_amount));

            setPrintData({ billNo: id, customer, bottom, pant, shirt, remaining });
        } catch (err) {
            alert("Failed to load order details for printing: " + err.message);
        } finally {
            setIsPrinting(false);
        }
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
                    <TransliterateInput as="input" language={language} className="form-input" type="text" 
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
                                const remaining = Math.max(0, Number(order.total_amount) + Number(order.sewing_total || 0) - Number(order.deposit_amount));
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
                                                <button className="btn-icon btn-icon--print" onClick={() => handlePrint(order.id)} disabled={isPrinting} title="Print">
                                                    <Printer size={16} />
                                                </button>
                                                <button className="btn-icon btn-icon--edit" onClick={() => handleEdit(order.id)} title="Edit">
                                                    <Edit size={16} />
                                                </button>
                                                <button className="btn-icon btn-icon--copy" onClick={() => handleCopy(order.id)} title="Copy as New">
                                                    <Copy size={16} />
                                                </button>
                                                <button className="btn-icon btn-icon--delete" onClick={() => handleDelete(order.id)} title="Delete">
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

            {/* ═══ PRINT MODAL ═══ */}
            {printData && (
                <PrintBillModal
                    billNo={printData.billNo}
                    customer={printData.customer}
                    pant={printData.pant}
                    shirt={printData.shirt}
                    bottom={printData.bottom}
                    remaining={printData.remaining}
                    earlyOffset={1}
                    language={language}
                    onClose={() => setPrintData(null)}
                    onCloseLabel="Close"
                />
            )}
        </div>
    );
};

export default SearchOrder;