import { useState, useRef, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import PrintBillModal from '../../../components/PrintBillModal';
import { useSearchParams } from 'react-router-dom';
import useAuthStore from '../../../store/useAuthStore';
import useLanguageStore from '../../../store/useLanguageStore';
import { t } from '../../../i18n';
import { fetchOrder, createOrder, updateOrder } from '../../../api/orders';
import { Pant } from '../../../svgs/Pant';
import { Shirt } from '../../../svgs/Shirt';
import './AddOrder.css';

/* ─── helpers ─── */
const todayISO = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

const localDateStr = (dateStr) => {
    if (!dateStr) return todayISO();
    const d = new Date(dateStr);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

/* ─── measurement layout maps ─── */
const defaultPantMeasurements = {
    lambai: '', gothan: '', fiting: '',
    kamar: '', sit: '', sit_loose: '',
    jang: '', jang_loose: '', jolo: '', moli: ''
};

// 4 rows x 6 columns
const PANT_MEASUREMENT_GRID = [
    ['lambai', 'kamar', 'sit', 'jang', 'jolo', 'moli'],
    ['gothan', null, 'sit_loose', 'jang_loose', null, null],
    ['fiting', null, null, null, null, null],
    [null, null, null, null, null, null]
];

/* ─── measurement layout maps ─── */
const defaultShirtMeasurements = {
    lambai: '', chhati: '', chest: '', weist: '', hip: '',
    shoulder: '', sleeve: '', sleeve_moli: '', collar: '',
    kaf_ni_lambai: '', kaf_ni_saij: '', sleeve_fitting_1: '', sleeve_fitting_2: ''
};

// 4 rows x 7 columns
const SHIRT_MEASUREMENT_GRID = [
    ['lambai', 'chhati', 'shoulder', 'sleeve', 'collar', null, 'sleeve_fitting_1'],
    [null, 'chest', null, 'sleeve_moli', 'kaf_ni_lambai', 'kaf_ni_saij', 'sleeve_fitting_2'],
    [null, 'weist', null, null, null, null, null],
    [null, 'hip', null, null, null, null, null]
];

/* ─── pattern images ─── */
const PANT_PATTERNS = Array.from({ length: 17 }, (_, i) => i + 1);
const SHIRT_PATTERNS = Array.from({ length: 3 }, (_, i) => i + 1);

/* ─── dropdown options ─── */
const PANT_TYPES = ['pant', 'hald rubber pant', 'jeans', 'cottan jeans', 'chudidar faratu rabar'];
const PANT_SUB_TYPES = ['T.I 4 | I ° 6'];
const SHIRT_TYPES = ['open', 'bushirt', 'short shirt', 'open kurto', 'kurto', 'zabhbho', 'safari', 'sheravani', 'koti', 'suit', 'blezer', 'indo western', 'highneck kurto'];

/* ─── checkbox option keys ─── */
const PANT_OPTIONS = [
    'grip', 'fitting_shape', 'single_silai', 'double_silai',
    'sandha_chirine_hath_silai', 'sandha_chirine_molima_silai', 'gaj_button_choras_belt',
];

const SHIRT_OPTIONS = [
    'upper_pocket', 'andar_bahar_pocket', 'saada_pocket', 'cut_pocket',
    'upper_patti', 'chinese_collar', 'collar_1_inch', 'fancy_button',
    'ring_button', 'no_pocket', 'logo_takki', 'pachhad_darts',
    'pocket_2_dhankanavala', 'pocket_1_dhankanavala', 'baipatti_gaj_button',
    'fold_patti', 'half_bai',
];

/* ─── default form state ─── */
const defaultCustomer = { customer_name: '', mobile_no: '', address: '', order_date: todayISO() };

const defaultPant = {
    enabled: false, type: PANT_TYPES[0], sub_type: PANT_SUB_TYPES[0],
    measurements: { ...defaultPantMeasurements }, pattern: '',
    options: Object.fromEntries(PANT_OPTIONS.map((k) => [k, false])), quantity: 1, notes: ''
};

const defaultShirt = {
    enabled: false, type: SHIRT_TYPES[0], measurements: { ...defaultShirtMeasurements },
    pattern: '', options: Object.fromEntries(SHIRT_OPTIONS.map((k) => [k, false])), quantity: 1, notes: ''
};

const defaultBottom = { delivery_date: todayISO(), total_amount: '', sewing_total: '', deposit_amount: '' };

/* ═══════════════════════════════════════ */
const AddOrder = () => {
    const token = useAuthStore((state) => state.token);
    const language = useLanguageStore((state) => state.language);
    const formRef = useRef(null);
    const [searchParams, setSearchParams] = useSearchParams();

    const [billNo, setBillNo] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [customer, setCustomer] = useState({ ...defaultCustomer });
    const [pant, setPant] = useState({ ...defaultPant, measurements: { ...defaultPant.measurements }, options: { ...defaultPant.options } });
    const [shirt, setShirt] = useState({ ...defaultShirt, measurements: { ...defaultShirt.measurements }, options: { ...defaultShirt.options } });
    const [bottom, setBottom] = useState({ ...defaultBottom });
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    
    // Print Modal State
    const [showPrintPreview, setShowPrintPreview] = useState(false);

    /* ── bill number lookup ── */
    const handleBillLookup = useCallback(async (overrideBillNo) => {
        const id = (overrideBillNo ?? billNo).toString().trim();
        if (!id) return;
        try {
            const data = await fetchOrder(id, token);
            const order = data.order;
            const items = data.items || [];

            setBillNo(id);
            setCustomer({
                customer_name: order.customer_name || '',
                mobile_no: order.mobile_no || '',
                address: order.address || '',
                order_date: localDateStr(order.order_date),
            });
            setBottom({
                delivery_date: localDateStr(order.delivery_date),
                total_amount: order.total_amount || '',
                sewing_total: order.sewing_total || '',
                deposit_amount: order.deposit_amount || '',
            });

            let newPant = { ...defaultPant, measurements: { ...defaultPant.measurements }, options: { ...defaultPant.options } };
            let newShirt = { ...defaultShirt, measurements: { ...defaultShirt.measurements }, options: { ...defaultShirt.options } };

            for (const item of items) {
                const det = item.details || {};
                if (item.item_type === 'pant') {
                    newPant = {
                        enabled: true, type: det.type || PANT_TYPES[0], sub_type: det.sub_type || PANT_SUB_TYPES[0],
                        measurements: det.measurements || { ...defaultPantMeasurements }, pattern: det.pattern || '',
                        options: { ...defaultPant.options, ...(det.options || {}) }, quantity: item.quantity || 1, notes: det.notes || '',
                    };
                } else if (item.item_type === 'shirt') {
                    newShirt = {
                        enabled: true, type: det.type || SHIRT_TYPES[0], measurements: det.measurements || { ...defaultShirt.measurements },
                        pattern: det.pattern || '', options: { ...defaultShirt.options, ...(det.options || {}) },
                        quantity: item.quantity || 1, notes: det.notes || '',
                    };
                }
            }
            setPant(newPant);
            setShirt(newShirt);
            setIsEditing(true);
            setFormError('');
        } catch (err) {
            setFormError(err.message);
        }
    }, [billNo, token]);

    /* ── auto-load bill from URL query param ── */
    useEffect(() => {
        const billParam = searchParams.get('bill');
        if (billParam) {
            handleBillLookup(billParam);
            setSearchParams({}, { replace: true });
        }
    }, []); 

    /* ── measurement helpers ── */
    const updatePantMeasurement = (key, val) => setPant({ ...pant, measurements: { ...pant.measurements, [key]: val } });
    const updateShirtMeasurement = (key, val) => setShirt({ ...shirt, measurements: { ...shirt.measurements, [key]: val } });
    const togglePantOption = (key) => setPant({ ...pant, options: { ...pant.options, [key]: !pant.options[key] } });
    const toggleShirtOption = (key) => setShirt({ ...shirt, options: { ...shirt.options, [key]: !shirt.options[key] } });

    /* ── submit ── */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        if (!customer.customer_name.trim()) return setFormError(t('order.error.name_required', language));
        if (!pant.enabled && !shirt.enabled) return setFormError(t('order.error.item_required', language));

        setSubmitting(true);
        try {
            const items = [];
            if (pant.enabled) {
                items.push({
                    item_type: 'pant', quantity: Number(pant.quantity) || 1,
                    details: { type: pant.type, sub_type: pant.sub_type, measurements: pant.measurements, pattern: pant.pattern, options: pant.options, notes: pant.notes },
                });
            }
            if (shirt.enabled) {
                items.push({
                    item_type: 'shirt', quantity: Number(shirt.quantity) || 1,
                    details: { type: shirt.type, measurements: shirt.measurements, pattern: shirt.pattern, options: shirt.options, notes: shirt.notes },
                });
            }

            const payload = {
                customer_name: customer.customer_name, mobile_no: customer.mobile_no, address: customer.address,
                order_date: customer.order_date, delivery_date: bottom.delivery_date,
                total_amount: Number(bottom.total_amount) || 0, sewing_total: Number(bottom.sewing_total) || 0, deposit_amount: Number(bottom.deposit_amount) || 0, items,
            };

            if (isEditing && billNo) {
                await updateOrder(billNo, payload, token);
            } else {
                const data = await createOrder(payload, token);
                setBillNo(String(data.bill_id));
                setIsEditing(true);
            }
            // Open print preview modal instead of standard alert
            setShowPrintPreview(true);
            
        } catch (err) {
            setFormError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    /* ── clear form ── */
    const handleClear = () => {
        setBillNo(''); setIsEditing(false);
        setCustomer({ ...defaultCustomer, order_date: todayISO() });
        setPant({ ...defaultPant, measurements: { ...defaultPant.measurements }, options: { ...defaultPant.options } });
        setShirt({ ...defaultShirt, measurements: { ...defaultShirt.measurements }, options: { ...defaultShirt.options } });
        setBottom({ ...defaultBottom, delivery_date: todayISO() });
        setFormError('');
    };

    const remaining = Math.max(0, (Number(bottom.total_amount) || 0) + (Number(bottom.sewing_total) || 0) - (Number(bottom.deposit_amount) || 0));

    /* ═══════════════════════════════════ RENDER ═══════════════════════════════════ */
    return (
        <div className="add-order-page" ref={formRef}>
            <form className="add-order-form" onSubmit={handleSubmit}>
                <div className="order-bill-row">
                    <div className="order-bill-lookup">
                        <label className="form-label">{t('order.bill_no', language)}</label>
                        <div className="order-bill-input-group">
                            <input className="form-input order-bill-input" type="number" inputMode="numeric" placeholder={t('order.bill_no.placeholder', language)} value={billNo} onChange={(e) => setBillNo(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleBillLookup(); } }} />
                            <button type="button" className="btn-icon btn-icon--search" onClick={() => handleBillLookup()}><Search size={18} /></button>
                        </div>
                    </div>
                </div>

                <section className="order-section order-customer-section">
                    <div className="order-customer-grid">
                        <div className="form-group"><label className="form-label">{t('order.name', language)}</label><input className="form-input" type="text" value={customer.customer_name} onChange={(e) => setCustomer({ ...customer, customer_name: e.target.value })} disabled={submitting} /></div>
                        <div className="form-group"><label className="form-label">{t('order.date', language)}</label><input className="form-input" type="date" value={customer.order_date} onChange={(e) => setCustomer({ ...customer, order_date: e.target.value })} disabled={submitting} /></div>
                        <div className="form-group"><label className="form-label">{t('order.address', language)}</label><textarea className="form-input" rows="2" value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} disabled={submitting} /></div>
                        <div className="form-group"><label className="form-label">{t('order.mobile', language)}</label><input className="form-input" type="tel" inputMode="numeric" value={customer.mobile_no} onChange={(e) => setCustomer({ ...customer, mobile_no: e.target.value })} disabled={submitting} /></div>
                    </div>
                </section>

                <section className="order-section order-item-toggles">
                    <label className="order-item-toggle"><input type="checkbox" checked={pant.enabled} onChange={() => setPant({ ...pant, enabled: !pant.enabled })} /><div className="order-item-toggle__svg"><Pant /></div></label>
                    <label className="order-item-toggle"><input type="checkbox" checked={shirt.enabled} onChange={() => setShirt({ ...shirt, enabled: !shirt.enabled })} /><div className="order-item-toggle__svg"><Shirt /></div></label>
                </section>

                {pant.enabled && (
                    <section className="order-section order-item-section">
                        <div className="order-item-inner">
                            <div className="order-item-dropdowns">
                                <select className="form-input form-select" value={pant.type} onChange={(e) => setPant({ ...pant, type: e.target.value })}>{PANT_TYPES.map((pt) => (<option key={pt} value={pt}>{t(`order.pant.type.${pt}`, language)}</option>))}</select>
                                <select className="form-input form-select" value={pant.sub_type} onChange={(e) => setPant({ ...pant, sub_type: e.target.value })}>{PANT_SUB_TYPES.map((st) => (<option key={st} value={st}>{st}</option>))}</select>
                            </div>
                            <div className="order-item-body">
                                <div className="order-measurements pant-measurements">
                                    {PANT_MEASUREMENT_GRID.flat().map((key, index) => key ? <input key={key} className={`meas-box p-box-${key}`} type="text" value={pant.measurements[key] || ''} onChange={(e) => updatePantMeasurement(key, e.target.value)} /> : <input key={`empty-${index}`} className="meas-box empty-meas-box" style={{ visibility: 'hidden' }} readOnly />)}
                                </div>
                                <div className="order-pattern-selector">
                                    <div className="order-pattern-selected">{pant.pattern ? <img src={`/images/pant/${pant.pattern}.png`} alt="Pattern" /> : <div className="order-pattern-placeholder" />}</div>
                                    <div className="order-pattern-grid">
                                        {pant.pattern && <button type="button" className="order-pattern-btn order-pattern-btn--clear" onClick={() => setPant({ ...pant, pattern: '' })}>✕</button>}
                                        {PANT_PATTERNS.map((n) => (<button key={n} type="button" className={`order-pattern-btn ${pant.pattern === String(n) ? 'order-pattern-btn--active' : ''}`} onClick={() => setPant({ ...pant, pattern: String(n) })}><img src={`/images/pant/${n}.png`} alt={`P${n}`} /></button>))}
                                    </div>
                                </div>
                                <div className="order-checkboxes">
                                    {PANT_OPTIONS.map((key) => (<label key={key} className="order-checkbox-label"><input type="checkbox" checked={pant.options[key]} onChange={() => togglePantOption(key)} /><span>{t(`order.pant.opt.${key}`, language)}</span></label>))}
                                </div>
                                <div className="order-nag-vigat">
                                    <div className="form-group"><label className="form-label">{t('order.quantity', language)}</label><input className="form-input" type="number" inputMode="numeric" min="1" value={pant.quantity} onChange={(e) => setPant({ ...pant, quantity: e.target.value })} /></div>
                                    <div className="form-group"><label className="form-label">{t('order.notes', language)}</label><textarea className="form-input" rows="3" value={pant.notes} onChange={(e) => setPant({ ...pant, notes: e.target.value })} /></div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {shirt.enabled && (
                    <section className="order-section order-item-section">
                        <div className="order-item-inner">
                            <div className="order-item-dropdowns">
                                <select className="form-input form-select" value={shirt.type} onChange={(e) => setShirt({ ...shirt, type: e.target.value })}>{SHIRT_TYPES.map((st) => (<option key={st} value={st}>{t(`order.shirt.type.${st}`, language)}</option>))}</select>
                            </div>
                            <div className="order-item-body">
                                <div className="order-measurements shirt-measurements">
                                    {SHIRT_MEASUREMENT_GRID.flat().map((key, index) => key ? <input key={key} className={`meas-box s-box-${key}`} type="text" value={shirt.measurements[key] || ''} onChange={(e) => updateShirtMeasurement(key, e.target.value)} /> : <input key={`empty-s-${index}`} className="meas-box empty-meas-box" style={{ visibility: 'hidden' }} readOnly />)}
                                </div>
                                <div className="order-pattern-selector">
                                    <div className="order-pattern-selected">{shirt.pattern ? <img src={`/images/shirt/${shirt.pattern}.png`} alt="Pattern" /> : <div className="order-pattern-placeholder" />}</div>
                                    <div className="order-pattern-grid">
                                        {shirt.pattern && <button type="button" className="order-pattern-btn order-pattern-btn--clear" onClick={() => setShirt({ ...shirt, pattern: '' })}>✕</button>}
                                        {SHIRT_PATTERNS.map((n) => (<button key={n} type="button" className={`order-pattern-btn ${shirt.pattern === String(n) ? 'order-pattern-btn--active' : ''}`} onClick={() => setShirt({ ...shirt, pattern: String(n) })}><img src={`/images/shirt/${n}.png`} alt={`S${n}`} /></button>))}
                                    </div>
                                </div>
                                <div className="order-checkboxes">
                                    {SHIRT_OPTIONS.map((key) => (<label key={key} className="order-checkbox-label"><input type="checkbox" checked={shirt.options[key]} onChange={() => toggleShirtOption(key)} /><span>{t(`order.shirt.opt.${key}`, language)}</span></label>))}
                                </div>
                                <div className="order-nag-vigat">
                                    <div className="form-group"><label className="form-label">{t('order.quantity', language)}</label><input className="form-input" type="number" inputMode="numeric" min="1" value={shirt.quantity} onChange={(e) => setShirt({ ...shirt, quantity: e.target.value })} /></div>
                                    <div className="form-group"><label className="form-label">{t('order.notes', language)}</label><textarea className="form-input" rows="3" value={shirt.notes} onChange={(e) => setShirt({ ...shirt, notes: e.target.value })} /></div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                <section className="order-section order-bottom-section">
                    <div className="order-bottom-grid">
                        <div className="form-group"><label className="form-label">{t('order.delivery_date', language)}</label><input className="form-input" type="date" value={bottom.delivery_date} onChange={(e) => setBottom({ ...bottom, delivery_date: e.target.value })} disabled={submitting} /></div>
                        <div className="form-group"><label className="form-label">{t('order.total_amount', language)}</label><input className="form-input" type="number" inputMode="numeric" min="0" step="0.01" value={bottom.total_amount} onChange={(e) => setBottom({ ...bottom, total_amount: e.target.value })} disabled={submitting} /></div>
                        <div className="form-group"><label className="form-label">{t('order.sewing_total', language)}</label><input className="form-input" type="number" inputMode="numeric" min="0" step="0.01" value={bottom.sewing_total} onChange={(e) => setBottom({ ...bottom, sewing_total: e.target.value })} disabled={submitting} /></div>
                        <div className="form-group"><label className="form-label">{t('order.deposit_amount', language)}</label><input className="form-input" type="number" inputMode="numeric" min="0" step="0.01" value={bottom.deposit_amount} onChange={(e) => setBottom({ ...bottom, deposit_amount: e.target.value })} disabled={submitting} /></div>
                        <div className="form-group"><label className="form-label">{t('order.remaining', language)}</label><div className="order-remaining-display">₹{remaining.toLocaleString('en-IN')}</div></div>
                    </div>
                </section>

                {formError && <p className="form-error" role="alert">{formError}</p>}
                <div className="form-actions form-actions--2col">
                    <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? t('order.saving', language) : (isEditing ? t('order.update', language) : t('order.save', language))}</button>
                    <button type="button" className="btn-secondary" onClick={handleClear} disabled={submitting}>{t('order.clear', language)}</button>
                </div>
            </form>

            {/* ═══ PRINT MODAL ═══ */}
            {showPrintPreview && (
                <PrintBillModal
                    billNo={billNo}
                    customer={customer}
                    pant={pant}
                    shirt={shirt}
                    bottom={bottom}
                    remaining={remaining}
                    language={language}
                    onClose={() => { setShowPrintPreview(false); handleClear(); }}
                    onCloseLabel="Close & New"
                />
            )}
        </div>
    );
};

export default AddOrder;