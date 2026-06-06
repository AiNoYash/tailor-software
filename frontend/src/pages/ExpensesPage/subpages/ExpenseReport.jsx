import { useState } from 'react';
import { FileText, Search } from 'lucide-react';
import useAuthStore from '../../../store/useAuthStore';
import useLanguageStore from '../../../store/useLanguageStore';
import { t } from '../../../i18n';
import { fetchExpenseReport } from '../../../api/expenses';
import './ExpenseReport.css';

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

const ExpenseReport = () => {
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
            setReportError(t('expense_report.error.dates_required', language));
            return;
        }

        setReportLoading(true);
        setHasSearched(true);
        try {
            const params = {
                from_date: form.from_date,
                to_date: form.to_date,
            };

            const data = await fetchExpenseReport(params, token);
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
        <div className="expense-report-page">
            {/* Filter Section */}
            <section className="expense-report-filter-section" id="expense-report-filter-section">
                <h2 className="section-heading">
                    <FileText size={20} />
                    {t('expense_report.heading', language)}
                </h2>

                <form className="expense-report-filter-form" onSubmit={handleSubmit}>
                    {/* Date range */}
                    <div className="form-row form-row--2col">
                        <div className="form-group">
                            <label className="form-label" htmlFor="expense-report-from">
                                {t('expense_report.from', language)}
                            </label>
                            <input
                                id="expense-report-from"
                                className="form-input"
                                type="date"
                                value={form.from_date}
                                onChange={(e) => setForm({ ...form, from_date: e.target.value })}
                                disabled={reportLoading}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="expense-report-to">
                                {t('expense_report.to', language)}
                            </label>
                            <input
                                id="expense-report-to"
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
                            {reportLoading ? t('expense_report.loading', language) : t('expense_report.submit', language)}
                        </button>
                    </div>
                </form>
            </section>

            {/* Results Section */}
            {hasSearched && (
                <section className="expense-report-results-section" id="expense-report-results-section">
                    {reportLoading ? (
                        <div className="expense-report-loading">Loading...</div>
                    ) : reportRows.length === 0 ? (
                        <div className="expense-report-empty">{t('expense_report.empty', language)}</div>
                    ) : (
                        <>
                            {/* Table Header */}
                            <div className="expense-report-table-header">
                                <span className="exprpt-col exprpt-col--date">{t('expense.col.date', language)}</span>
                                <span className="exprpt-col exprpt-col--desc">{t('expense.col.description', language)}</span>
                                <span className="exprpt-col exprpt-col--amount">{t('expense.col.amount', language)}</span>
                            </div>

                            {/* Rows */}
                            <div className="expense-report-rows">
                                {reportRows.map((row) => (
                                    <div key={row.id} className="expense-report-row" id={`expense-report-row-${row.id}`}>
                                        <span className="exprpt-col exprpt-col--date" data-label={t('expense.col.date', language)}>
                                            {formatDate(row.expense_date)}
                                        </span>
                                        <span className="exprpt-col exprpt-col--desc" data-label={t('expense.col.description', language)}>
                                            {row.description || '-'}
                                        </span>
                                        <span className="exprpt-col exprpt-col--amount" data-label={t('expense.col.amount', language)}>
                                            ₹{Number(row.amount).toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Totals Row */}
                            {reportTotals && (
                                <div className="expense-report-totals-row">
                                    <span className="exprpt-col exprpt-col--total-label">
                                        {t('expense_report.total', language)}
                                    </span>
                                    <span className="exprpt-col exprpt-col--amount">
                                        ₹{Number(reportTotals.total_amount).toLocaleString('en-IN')}
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

export default ExpenseReport;
