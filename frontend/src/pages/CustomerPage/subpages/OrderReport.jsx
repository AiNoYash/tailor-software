import { useState } from 'react';
import { FileText, Search } from 'lucide-react';
import useAuthStore from '../../../store/useAuthStore';
import useLanguageStore from '../../../store/useLanguageStore';
import { t } from '../../../i18n';
import { fetchOrderReport } from '../../../api/orders';
import './OrderReport.css';

/**
 * Formats a date string to dd/mm/yyyy for display.
 */
const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
};

/**
 * Returns today's date in yyyy-mm-dd format.
 */
const todayISO = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

const OrderReport = () => {
    const token = useAuthStore((state) => state.token);
    const language = useLanguageStore((state) => state.language);

    // Filter form
    const [form, setForm] = useState({
        from_date: todayISO(),
        to_date: todayISO(),
    });

    // Report data
    const [reportRows, setReportRows] = useState([]);
    const [reportTotals, setReportTotals] = useState(null);
    const [reportLoading, setReportLoading] = useState(false);
    const [reportError, setReportError] = useState('');
    const [hasSearched, setHasSearched] = useState(false);

    // ---- Submit report ----
    const handleSubmit = async (e) => {
        e.preventDefault();
        setReportError('');

        if (!form.from_date || !form.to_date) {
            setReportError(t('order_report.error.dates_required', language));
            return;
        }

        setReportLoading(true);
        setHasSearched(true);
        try {
            const data = await fetchOrderReport(
                { from_date: form.from_date, to_date: form.to_date },
                token
            );
            setReportRows(data.records || []);
            setReportTotals(data.totals || null);
        } catch (err) {
            setReportError(err.message);
            setReportRows([]);
            setReportTotals(null);
        } finally {
            setReportLoading(false);
        }
    };

    return (
        <div className="order-report-page">
            {/* Filter Section */}
            <section className="order-report-filter-section" id="order-report-filter-section">
                <h2 className="section-heading">
                    <FileText size={20} />
                    {t('order_report.heading', language)}
                </h2>

                <form className="order-report-filter-form" onSubmit={handleSubmit}>
                    {/* Date range */}
                    <div className="form-row form-row--2col">
                        <div className="form-group">
                            <label className="form-label" htmlFor="order-report-from">
                                {t('order_report.from', language)}
                            </label>
                            <input
                                id="order-report-from"
                                className="form-input"
                                type="date"
                                value={form.from_date}
                                onChange={(e) => setForm({ ...form, from_date: e.target.value })}
                                disabled={reportLoading}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="order-report-to">
                                {t('order_report.to', language)}
                            </label>
                            <input
                                id="order-report-to"
                                className="form-input"
                                type="date"
                                value={form.to_date}
                                onChange={(e) => setForm({ ...form, to_date: e.target.value })}
                                disabled={reportLoading}
                            />
                        </div>
                    </div>

                    {reportError && <p className="form-error" role="alert">{reportError}</p>}

                    <div className="form-actions">
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={reportLoading}
                        >
                            <Search size={16} />
                            {reportLoading ? t('order_report.loading', language) : t('order_report.submit', language)}
                        </button>
                    </div>
                </form>
            </section>

            {/* Results Section */}
            {hasSearched && (
                <section className="order-report-results-section" id="order-report-results-section">
                    {reportLoading ? (
                        <div className="order-report-loading">Loading...</div>
                    ) : reportRows.length === 0 ? (
                        <div className="order-report-empty">{t('order_report.empty', language)}</div>
                    ) : (
                        <>
                            {/* Table Header */}
                            <div className="order-report-table-header">
                                <span className="orpt-col orpt-col--bill">{t('order_report.col.bill_no', language)}</span>
                                <span className="orpt-col orpt-col--name">{t('order_report.col.name', language)}</span>
                                <span className="orpt-col orpt-col--date">{t('order_report.col.date', language)}</span>
                                <span className="orpt-col orpt-col--pants">{t('order_report.col.pants', language)}</span>
                                <span className="orpt-col orpt-col--shirts">{t('order_report.col.shirts', language)}</span>
                                <span className="orpt-col orpt-col--clothes">{t('order_report.col.clothes', language)}</span>
                                <span className="orpt-col orpt-col--sewing">{t('order_report.col.sewing', language)}</span>
                                <span className="orpt-col orpt-col--sum_total">{t('order_report.col.sum_total', language)}</span>
                                <span className="orpt-col orpt-col--deposit">{t('order_report.col.deposit', language)}</span>
                                <span className="orpt-col orpt-col--remaining">{t('order_report.col.remaining', language)}</span>
                            </div>

                            {/* Rows */}
                            <div className="order-report-rows">
                                {reportRows.map((row) => (
                                    <div key={row.bill_no} className="order-report-row" id={`order-report-row-${row.bill_no}`}>
                                        <span className="orpt-col orpt-col--bill" data-label={t('order_report.col.bill_no', language)}>
                                            {row.bill_no}
                                        </span>
                                        <span className="orpt-col orpt-col--name" data-label={t('order_report.col.name', language)}>
                                            {row.customer_name}
                                        </span>
                                        <span className="orpt-col orpt-col--date" data-label={t('order_report.col.date', language)}>
                                            {formatDate(row.order_date)}
                                        </span>
                                        <span className="orpt-col orpt-col--pants" data-label={t('order_report.col.pants', language)}>
                                            {row.total_pants}
                                        </span>
                                        <span className="orpt-col orpt-col--shirts" data-label={t('order_report.col.shirts', language)}>
                                            {row.total_shirts}
                                        </span>
                                        <span className="orpt-col orpt-col--clothes" data-label={t('order_report.col.clothes', language)}>
                                            ₹{Number(row.total_amount).toLocaleString('en-IN')}
                                        </span>
                                        <span className="orpt-col orpt-col--sewing" data-label={t('order_report.col.sewing', language)}>
                                            ₹{Number(row.sewing_total).toLocaleString('en-IN')}
                                        </span>
                                        <span className="orpt-col orpt-col--sum_total" data-label={t('order_report.col.sum_total', language)}>
                                            ₹{(Number(row.total_amount) + Number(row.sewing_total)).toLocaleString('en-IN')}
                                        </span>
                                        <span className="orpt-col orpt-col--deposit" data-label={t('order_report.col.deposit', language)}>
                                            ₹{Number(row.deposit_amount).toLocaleString('en-IN')}
                                        </span>
                                        <span className="orpt-col orpt-col--remaining" data-label={t('order_report.col.remaining', language)}>
                                            ₹{Number(row.remaining).toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Totals Row */}
                            {reportTotals && (
                                <div className="order-report-totals-row">
                                    <span className="orpt-col orpt-col--total-label">
                                        {t('order_report.total_label', language)}
                                    </span>
                                    <span className="orpt-col orpt-col--pants">
                                        {reportTotals.total_pants}
                                    </span>
                                    <span className="orpt-col orpt-col--shirts">
                                        {reportTotals.total_shirts}
                                    </span>
                                    <span className="orpt-col orpt-col--clothes">
                                        ₹{Number(reportTotals.total_amount).toLocaleString('en-IN')}
                                    </span>
                                    <span className="orpt-col orpt-col--sewing">
                                        ₹{Number(reportTotals.sewing_total).toLocaleString('en-IN')}
                                    </span>
                                    <span className="orpt-col orpt-col--sum_total">
                                        ₹{(Number(reportTotals.total_amount) + Number(reportTotals.sewing_total)).toLocaleString('en-IN')}
                                    </span>
                                    <span className="orpt-col orpt-col--deposit">
                                        ₹{Number(reportTotals.deposit_amount).toLocaleString('en-IN')}
                                    </span>
                                    <span className="orpt-col orpt-col--remaining">
                                        ₹{Number(reportTotals.remaining).toLocaleString('en-IN')}
                                    </span>
                                </div>
                            )}
                        </>
                    )}
                </section>
            )}
        </div>
    );
};

export default OrderReport;
