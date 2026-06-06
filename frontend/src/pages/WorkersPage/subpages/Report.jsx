import { useState, useEffect, useCallback } from 'react';
import { FileText, Search } from 'lucide-react';
import useAuthStore from '../../../store/useAuthStore';
import useLanguageStore from '../../../store/useLanguageStore';
import { t } from '../../../i18n';
import { fetchWorkers } from '../../../api/workers';
import { fetchReport } from '../../../api/report';
import './Report.css';

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

const Report = () => {
    const token = useAuthStore((state) => state.token);
    const language = useLanguageStore((state) => state.language);

    // Workers list (for dropdown)
    const [workers, setWorkers] = useState([]);
    const [workersLoading, setWorkersLoading] = useState(true);

    // Filter form
    const [form, setForm] = useState({
        user_id: 'all',
        from_date: todayISO(),
        to_date: todayISO(),
    });

    // Report data
    const [reportRows, setReportRows] = useState([]);
    const [reportTotals, setReportTotals] = useState(null);
    const [reportLoading, setReportLoading] = useState(false);
    const [reportError, setReportError] = useState('');
    const [hasSearched, setHasSearched] = useState(false);

    // ---- Load workers for dropdown ----
    const loadWorkers = useCallback(async () => {
        try {
            const data = await fetchWorkers(token);
            setWorkers(data.users || []);
        } catch (err) {
            console.error('Failed to load workers:', err);
        } finally {
            setWorkersLoading(false);
        }
    }, [token]);

    useEffect(() => {
        loadWorkers();
    }, [loadWorkers]);

    // ---- Submit report ----
    const handleSubmit = async (e) => {
        e.preventDefault();
        setReportError('');

        if (!form.from_date || !form.to_date) {
            setReportError(t('report.error.dates_required', language));
            return;
        }

        setReportLoading(true);
        setHasSearched(true);
        try {
            const params = {
                from_date: form.from_date,
                to_date: form.to_date,
            };
            if (form.user_id !== 'all') {
                params.user_id = form.user_id;
            }

            const data = await fetchReport(params, token);
            setReportRows(data.rows || []);
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
        <div className="report-page">
            {/* Filter Section */}
            <section className="report-filter-section" id="report-filter-section">
                <h2 className="section-heading">
                    <FileText size={20} />
                    {t('report.heading', language)}
                </h2>

                <form className="report-filter-form" onSubmit={handleSubmit}>
                    {/* Worker Select */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="report-worker">
                            {t('report.worker', language)}
                        </label>
                        <select
                            id="report-worker"
                            className="form-input form-select"
                            value={form.user_id}
                            onChange={(e) => setForm({ ...form, user_id: e.target.value })}
                            disabled={workersLoading || reportLoading}
                        >
                            <option value="all">{t('report.worker.all', language)}</option>
                            {workers.map((w) => (
                                <option key={w.id} value={w.id}>{w.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Date range */}
                    <div className="form-row form-row--2col">
                        <div className="form-group">
                            <label className="form-label" htmlFor="report-from">
                                {t('report.from', language)}
                            </label>
                            <input
                                id="report-from"
                                className="form-input"
                                type="date"
                                value={form.from_date}
                                onChange={(e) => setForm({ ...form, from_date: e.target.value })}
                                disabled={reportLoading}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="report-to">
                                {t('report.to', language)}
                            </label>
                            <input
                                id="report-to"
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
                            {reportLoading ? t('report.loading', language) : t('report.submit', language)}
                        </button>
                    </div>
                </form>
            </section>

            {/* Results Section */}
            {hasSearched && (
                <section className="report-results-section" id="report-results-section">
                    {reportLoading ? (
                        <div className="report-loading">Loading...</div>
                    ) : reportRows.length === 0 ? (
                        <div className="report-empty">{t('report.empty', language)}</div>
                    ) : (
                        <>
                            {/* Table Header */}
                            <div className="report-table-header">
                                <span className="rpt-col rpt-col--name">{t('report.col.name', language)}</span>
                                <span className="rpt-col rpt-col--pants">{t('report.col.pants', language)}</span>
                                <span className="rpt-col rpt-col--shirts">{t('report.col.shirts', language)}</span>
                                <span className="rpt-col rpt-col--withdrawal">{t('report.col.withdrawal', language)}</span>
                            </div>

                            {/* Rows */}
                            <div className="report-rows">
                                {reportRows.map((row) => (
                                    <div key={row.user_id} className="report-row" id={`report-row-${row.user_id}`}>
                                        <span className="rpt-col rpt-col--name" data-label={t('report.col.name', language)}>
                                            {row.worker_name}
                                        </span>
                                        <span className="rpt-col rpt-col--pants" data-label={t('report.col.pants', language)}>
                                            {row.total_pants}
                                        </span>
                                        <span className="rpt-col rpt-col--shirts" data-label={t('report.col.shirts', language)}>
                                            {row.total_shirts}
                                        </span>
                                        <span className="rpt-col rpt-col--withdrawal" data-label={t('report.col.withdrawal', language)}>
                                            ₹{Number(row.total_withdrawals).toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Totals Row */}
                            {reportTotals && (
                                <div className="report-totals-row">
                                    <span className="rpt-col rpt-col--name rpt-col--total-label">
                                        {t('report.total', language)}
                                    </span>
                                    <span className="rpt-col rpt-col--pants">
                                        {reportTotals.total_pants}
                                    </span>
                                    <span className="rpt-col rpt-col--shirts">
                                        {reportTotals.total_shirts}
                                    </span>
                                    <span className="rpt-col rpt-col--withdrawal">
                                        ₹{Number(reportTotals.total_withdrawals).toLocaleString('en-IN')}
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

export default Report;
