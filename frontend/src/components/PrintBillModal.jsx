import { Printer, X } from 'lucide-react';
import { t } from '../i18n';
import './PrintBillModal.css';

/* ─── Helpers ─── */
const localDateStr = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${dd}-${mm}-${yyyy}`;
};

/* ─── Measurement grid layouts (shared) ─── */
const PANT_MEASUREMENT_GRID = [
    ['lambai', 'kamar', 'sit', 'jang', 'jolo', 'moli'],
    ['gothan', null, 'sit_loose', 'jang_loose', null, null],
    ['fiting', null, null, null, null, null],
    [null, null, null, null, null, null]
];

const SHIRT_MEASUREMENT_GRID = [
    ['lambai', 'chhati', 'shoulder', 'sleeve', 'collar', null, 'sleeve_fitting_1'],
    [null, 'chest', null, 'sleeve_moli', 'kaf_ni_lambai', 'kaf_ni_saij', 'sleeve_fitting_2'],
    [null, 'weist', null, null, null, null, null],
    [null, 'hip', null, null, null, null, null]
];

/**
 * PrintBillModal — Shared print preview modal.
 *
 * Props:
 *   billNo, customer, pant, shirt, bottom, remaining,
 *   onClose        — close handler
 *   onCloseLabel   — optional label for close button (default "Close")
 *   language       — current app language (used for modal header only)
 */
const PrintBillModal = ({ billNo, customer, pant, shirt, bottom, remaining, onClose, onCloseLabel, language }) => {
    // All bill text is hardcoded Gujarati — use 'gu' for item type lookups
    const GU = 'gu';

    // Compute item rows for customer bill
    const itemRows = [];
    if (pant.enabled) {
        itemRows.push({
            name: t(`order.pant.type.${pant.type}`, GU),
            qty: pant.quantity,
        });
    }
    if (shirt.enabled) {
        itemRows.push({
            name: t(`order.shirt.type.${shirt.type}`, GU),
            qty: shirt.quantity,
        });
    }

    // Fill empty rows to make the table look complete (min 5 rows)
    const MIN_ROWS = 5;
    const emptyRowCount = Math.max(0, MIN_ROWS - itemRows.length);

    const grandTotal = Number(bottom.total_amount || 0) + Number(bottom.sewing_total || 0);

    return (
        <div className="print-modal-overlay">
            <div className="print-modal-content">
                {/* ── Modal Header (hidden on print) ── */}
                <div className="print-modal-header hide-on-print">
                    <h3>{t('order.saved', language)} - Bill #{billNo}</h3>
                    <div className="print-modal-actions">
                        <button type="button" className="btn-primary" onClick={() => window.print()}>
                            <Printer size={18} /> Print
                        </button>
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            <X size={18} /> {onCloseLabel || 'Close'}
                        </button>
                    </div>
                </div>

                {/* ══ A4 Landscape Container ══ */}
                <div className="printable-a4-landscape">

                    {/* ──────────── LEFT SIDE: Tailor Copy ──────────── */}
                    <div className="print-half tailor-half">
                        {pant.enabled && (
                            <div className="tailor-section">
                                <div className="tailor-header">
                                    <span>બિલ: <strong>{billNo}</strong></span>
                                    <span>નામ: <strong>{customer.customer_name}</strong></span>
                                    <span>તારીખ: <strong>{localDateStr(customer.order_date)}</strong></span>
                                </div>
                                <div className="tailor-subheader">
                                    <span>નંગ: <strong>{pant.quantity}</strong></span>
                                    <span>પ્રકાર: <strong>{t(`order.pant.type.${pant.type}`, GU)} {pant.sub_type}</strong></span>
                                </div>
                                <div className="tailor-body">
                                    <div className="tailor-grid-area">
                                        <div className="print-grid print-pant-grid">
                                            {PANT_MEASUREMENT_GRID.flat().map((key, i) => (
                                                <div key={i} className={`print-cell ${key ? 'filled' : 'empty'}`}>
                                                    {key ? pant.measurements[key] : ''}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="tailor-options">
                                            {Object.keys(pant.options).filter(k => pant.options[k]).map(k => t(`order.pant.opt.${k}`, GU)).join(', ')}
                                        </div>
                                        {pant.notes && <div className="tailor-notes"><strong>વિગત:</strong> {pant.notes}</div>}
                                    </div>
                                    {pant.pattern && <img className="tailor-pattern-img" src={`/images/pant/${pant.pattern}.png`} alt="" />}
                                </div>
                            </div>
                        )}

                        {pant.enabled && shirt.enabled && <hr className="tailor-divider" />}

                        {shirt.enabled && (
                            <div className="tailor-section">
                                <div className="tailor-header">
                                    <span>બિલ: <strong>{billNo}</strong></span>
                                    <span>નામ: <strong>{customer.customer_name}</strong></span>
                                    <span>તારીખ: <strong>{localDateStr(customer.order_date)}</strong></span>
                                </div>
                                <div className="tailor-subheader">
                                    <span>નંગ: <strong>{shirt.quantity}</strong></span>
                                    <span>પ્રકાર: <strong>{t(`order.shirt.type.${shirt.type}`, GU)}</strong></span>
                                </div>
                                <div className="tailor-body">
                                    <div className="tailor-grid-area">
                                        <div className="print-grid print-shirt-grid">
                                            {SHIRT_MEASUREMENT_GRID.flat().map((key, i) => (
                                                <div key={i} className={`print-cell ${key ? 'filled' : 'empty'}`}>
                                                    {key ? shirt.measurements[key] : ''}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="tailor-options">
                                            {Object.keys(shirt.options).filter(k => shirt.options[k]).map(k => t(`order.shirt.opt.${k}`, GU)).join(', ')}
                                        </div>
                                        {shirt.notes && <div className="tailor-notes"><strong>વિગત:</strong> {shirt.notes}</div>}
                                    </div>
                                    {shirt.pattern && <img className="tailor-pattern-img" src={`/images/shirt/${shirt.pattern}.png`} alt="" />}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ──────────── RIGHT SIDE: Customer Gujarati Bill ──────────── */}
                    <div className="print-half customer-half">

                        {/* Religious Header */}
                        <div className="bill-religious-header">
                            <div className="bill-religious-line1">|| શ્રી ગણેશાય નમ: ||</div>
                            <div className="bill-religious-line2">|| શ્રી ૧ા ||</div>
                        </div>

                        {/* Shop Branding */}
                        <div className="bill-shop-header">
                            {/* <img src="/logo-icon-on-bill.png" alt="Logo" className="bill-shop-logo-icon" /> */}
                            <img src="/logo-name.png" alt="Raj Selection" className="bill-shop-logo-name" />
                        </div>

                        <div className="contact-1"><strong>હિતેશભાઈ મકવાણા</strong> <br /> 99792 27103</div>
                        <div className="contact-2"><strong>રાજ મકવાણા</strong><br /> 93283 59732</div>
                        {/* Shop Address */}
                        <div className="bill-shop-address">
                            શોપ નં. ૩, અક્ષય કોમ્પ્લેક્સ, પાર્વતી નગર-૨, BRTS સ્ટેશન સામે, બાપા સીતારામ ચોક, કતારગામ, સુરત
                        </div>

                        {/* Customer Info */}
                        <div className="bill-customer-info">
                            <div className="bill-info-field">
                                <span className="bill-info-label">નામ :</span>
                                <span className="bill-info-value">{customer.customer_name}</span>
                            </div>
                            <div className="bill-info-field">
                                <span className="bill-info-label">બિલ નં. :</span>
                                <span className="bill-info-value">{billNo}</span>
                            </div>
                            <div className="bill-info-field">
                                <span className="bill-info-label">મોબાઈલ :</span>
                                <span className="bill-info-value">{customer.mobile_no}</span>
                            </div>
                            <div className="bill-info-field">
                                <span className="bill-info-label">તારીખ :</span>
                                <span className="bill-info-value">{localDateStr(customer.order_date)}</span>
                            </div>
                            <div className="bill-info-field">
                                <span className="bill-info-label">સરનામું :</span>
                                <span className="bill-info-value">{customer.address}</span>
                            </div>
                            <div className="bill-info-field">
                                <span className="bill-info-label">ડિલિવરી :</span>
                                <span className="bill-info-value">{localDateStr(bottom.delivery_date)}</span>
                            </div>
                        </div>

                        {/* Items Table */}
                        <table className="bill-items-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '40px' }}>નં.</th>
                                    <th>વિગત</th>
                                    <th style={{ width: '50px' }}>નંગ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {itemRows.map((item, idx) => (
                                    <tr key={idx}>
                                        <td>{idx + 1}</td>
                                        <td>{item.name}</td>
                                        <td>{item.qty}</td>
                                    </tr>
                                ))}
                                {Array.from({ length: emptyRowCount }).map((_, idx) => (
                                    <tr key={`empty-${idx}`} className="empty-row">
                                        <td>&nbsp;</td>
                                        <td>&nbsp;</td>
                                        <td>&nbsp;</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Financial Summary */}
                        <div className="bill-financials">
                            <div className="bill-financial-row">
                                <span className="bill-fin-label">કાપડ ના ટોટલ :</span>
                                <span className="bill-fin-value">₹{bottom.total_amount || 0}</span>
                            </div>
                            <div className="bill-financial-row">
                                <span className="bill-fin-label">સિલાઈ ના ટોટલ :</span>
                                <span className="bill-fin-value">₹{bottom.sewing_total || 0}</span>
                            </div>
                            <div className="bill-financial-row bill-total-row">
                                <span className="bill-fin-label">કુલ :</span>
                                <span className="bill-fin-value">₹{grandTotal}</span>
                            </div>
                            <div className="bill-financial-row">
                                <span className="bill-fin-label">જમા :</span>
                                <span className="bill-fin-value">₹{bottom.deposit_amount || 0}</span>
                            </div>
                            <div className="bill-financial-row bill-total-row">
                                <span className="bill-fin-label">બાકી :</span>
                                <span className="bill-fin-value">₹{remaining.toLocaleString('en-IN')}</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrintBillModal;
