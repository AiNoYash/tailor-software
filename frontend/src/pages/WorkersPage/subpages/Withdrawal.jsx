import { useState, useEffect, useCallback, useRef } from 'react';
import { Wallet, Pencil, Trash2, X, Calendar } from 'lucide-react';
import useAuthStore from '../../../store/useAuthStore';
import useLanguageStore from '../../../store/useLanguageStore';
import { t } from '../../../i18n';
import { fetchWorkers } from '../../../api/workers';
import { fetchWithdrawals, createWithdrawal, updateWithdrawal, deleteWithdrawal } from '../../../api/withdrawals';
import './Withdrawal.css';

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

const Withdrawal = () => {
    const token = useAuthStore((state) => state.token);
    const language = useLanguageStore((state) => state.language);

    const formRef = useRef(null);

    // Workers list (for dropdown)
    const [workers, setWorkers] = useState([]);
    const [workersLoading, setWorkersLoading] = useState(true);

    // Withdrawal records
    const [records, setRecords] = useState([]);
    const [recordsLoading, setRecordsLoading] = useState(true);

    // Form state (unified add / edit)
    const defaultForm = { user_id: '', withdrawal_date: todayISO(), amount: '' };
    const [form, setForm] = useState(defaultForm);
    const [editingRecord, setEditingRecord] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    // ---- Data Loading ----
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

    const loadRecords = useCallback(async () => {
        try {
            const data = await fetchWithdrawals(token);
            setRecords(data.records || []);
        } catch (err) {
            console.error('Failed to load withdrawal records:', err);
        } finally {
            setRecordsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        loadWorkers();
        loadRecords();
    }, [loadWorkers, loadRecords]);

    // ---- Form Handling ----
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');

        if (!form.user_id || !form.withdrawal_date) {
            setFormError(t('withdrawal.error.required', language));
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                user_id: Number(form.user_id),
                withdrawal_date: form.withdrawal_date,
                amount: Number(form.amount) || 0,
            };

            if (editingRecord) {
                await updateWithdrawal(editingRecord.id, payload, token);
                setFormSuccess(t('withdrawal.success.updated', language));
                setEditingRecord(null);
            } else {
                await createWithdrawal(payload, token);
                setFormSuccess(t('withdrawal.success.created', language));
            }

            setForm(defaultForm);
            await loadRecords();
            setTimeout(() => setFormSuccess(''), 3000);
        } catch (err) {
            setFormError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const startEdit = (record) => {
        // Use local timezone methods to avoid off-by-one date shift
        let dateVal = todayISO();
        if (record.withdrawal_date) {
            const d = new Date(record.withdrawal_date);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            dateVal = `${yyyy}-${mm}-${dd}`;
        }

        setEditingRecord(record);
        setForm({
            user_id: String(record.user_id),
            withdrawal_date: dateVal,
            amount: record.amount,
        });
        setFormError('');
        setFormSuccess('');

        if (formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const cancelEdit = () => {
        setEditingRecord(null);
        setForm(defaultForm);
        setFormError('');
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('withdrawal.delete_confirm', language))) return;

        try {
            await deleteWithdrawal(id, token);
            await loadRecords();

            if (editingRecord && editingRecord.id === id) {
                cancelEdit();
            }
        } catch (err) {
            alert(err.message);
        }
    };

    const handleClear = () => {
        if (editingRecord) {
            cancelEdit();
        } else {
            setForm(defaultForm);
            setFormError('');
            setFormSuccess('');
        }
    };

    // ---- Heading ----
    const getWorkerName = (record) => {
        const worker = workers.find((w) => w.id === record.user_id);
        return worker ? worker.name : record.worker_name;
    };

    let headingStr = t('withdrawal.add_heading', language);
    if (editingRecord) {
        headingStr = t('withdrawal.update_heading', language).replace('{{name}}', getWorkerName(editingRecord));
    }

    return (
        <div className="withdrawal-page">
            {/* Form Section */}
            <section
                className={`withdrawal-form-section ${editingRecord ? 'withdrawal-form-section--editing' : ''}`}
                id="withdrawal-form-section"
                ref={formRef}
            >
                <div className="section-heading-row">
                    <h2 className="section-heading">
                        {editingRecord ? <Pencil size={20} /> : <Wallet size={20} />}
                        {headingStr}
                    </h2>
                    {editingRecord && (
                        <button
                            className="btn-icon btn-icon--cancel-edit"
                            onClick={cancelEdit}
                            aria-label={t('withdrawal.cancel_edit', language)}
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                <form className="withdrawal-form" onSubmit={handleSubmit}>
                    <div className="form-row form-row--2col">
                        {/* Worker Select */}
                        <div className="form-group">
                            <label className="form-label" htmlFor="withdrawal-worker">
                                {t('withdrawal.worker', language)}
                            </label>
                            <select
                                id="withdrawal-worker"
                                className="form-input form-select"
                                value={form.user_id}
                                onChange={(e) => setForm({ ...form, user_id: e.target.value })}
                                disabled={submitting || workersLoading}
                            >
                                <option value="">{t('withdrawal.worker.placeholder', language)}</option>
                                {workers.map((w) => (
                                    <option key={w.id} value={w.id}>{w.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Date */}
                        <div className="form-group">
                            <label className="form-label" htmlFor="withdrawal-date">
                                {t('withdrawal.date', language)}
                            </label>
                            <input
                                id="withdrawal-date"
                                className="form-input"
                                type="date"
                                value={form.withdrawal_date}
                                onChange={(e) => setForm({ ...form, withdrawal_date: e.target.value })}
                                disabled={submitting}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        {/* Amount */}
                        <div className="form-group">
                            <label className="form-label" htmlFor="withdrawal-amount">
                                {t('withdrawal.amount', language)}
                            </label>
                            <input
                                id="withdrawal-amount"
                                className="form-input"
                                type="number"
                                inputMode="numeric"
                                min="0"
                                step="0.01"
                                placeholder={t('withdrawal.amount.placeholder', language)}
                                value={form.amount}
                                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                disabled={submitting}
                            />
                        </div>
                    </div>

                    {formError && <p className="form-error" role="alert">{formError}</p>}
                    {formSuccess && <p className="form-success" role="status">{formSuccess}</p>}

                    <div className="form-actions form-actions--2col">
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={submitting}
                        >
                            {submitting
                                ? (editingRecord ? t('withdrawal.updating', language) : t('withdrawal.saving', language))
                                : (editingRecord ? t('withdrawal.update', language) : t('withdrawal.save', language))}
                        </button>
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={handleClear}
                            disabled={submitting}
                        >
                            {t('withdrawal.clear', language)}
                        </button>
                    </div>
                </form>
            </section>

            {/* Withdrawal Records Table */}
            <section className="withdrawal-records-section" id="withdrawal-records-section">
                <h2 className="section-heading">
                    {t('withdrawal.list_heading', language)}
                </h2>

                {recordsLoading ? (
                    <div className="withdrawal-loading">Loading...</div>
                ) : records.length === 0 ? (
                    <div className="withdrawal-empty">{t('withdrawal.empty', language)}</div>
                ) : (
                    <>
                        {/* Table header */}
                        <div className="withdrawal-table-header">
                            <span className="wd-col wd-col--name">{t('withdrawal.col.name', language)}</span>
                            <span className="wd-col wd-col--amount">{t('withdrawal.col.amount', language)}</span>
                            <span className="wd-col wd-col--date">{t('withdrawal.col.date', language)}</span>
                            <span className="wd-col wd-col--actions">{t('withdrawal.col.actions', language)}</span>
                        </div>

                        {/* Records */}
                        <div className="withdrawal-records-list">
                            {records.map((rec) => (
                                <div
                                    key={rec.id}
                                    className={`withdrawal-record ${editingRecord?.id === rec.id ? 'withdrawal-record--editing' : ''}`}
                                    id={`withdrawal-record-${rec.id}`}
                                >
                                    <span className="wd-col wd-col--name" data-label={t('withdrawal.col.name', language)}>
                                        {rec.worker_name}
                                    </span>
                                    <span className="wd-col wd-col--amount" data-label={t('withdrawal.col.amount', language)}>
                                        ₹{Number(rec.amount).toLocaleString('en-IN')}
                                    </span>
                                    <span className="wd-col wd-col--date" data-label={t('withdrawal.col.date', language)}>
                                        <Calendar size={14} />
                                        {formatDate(rec.withdrawal_date)}
                                    </span>
                                    <span className="wd-col wd-col--actions">
                                        <button
                                            className="btn-icon btn-icon--edit"
                                            onClick={() => startEdit(rec)}
                                            aria-label={t('withdrawal.edit', language)}
                                        >
                                            <Pencil size={15} />
                                        </button>
                                        <button
                                            className="btn-icon btn-icon--delete"
                                            onClick={() => handleDelete(rec.id)}
                                            aria-label={t('withdrawal.delete', language)}
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </section>
        </div>
    );
};

export default Withdrawal;
