import { useState, useEffect, useCallback, useRef } from 'react';
import { ClipboardPlus, Pencil, Trash2, X, Calendar } from 'lucide-react';
import useAuthStore from '../../../store/useAuthStore';
import useLanguageStore from '../../../store/useLanguageStore';
import { t } from '../../../i18n';
import { fetchWorkers } from '../../../api/workers';
import { fetchWork, createWork, updateWork, deleteWork } from '../../../api/work';
import './AddWork.css';

/**
 * Formats a date string (ISO or yyyy-mm-dd) to dd/mm/yyyy for display.
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
 * Returns today's date in yyyy-mm-dd format for <input type="date"> default value.
 */
const todayISO = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

const AddWork = () => {
    const token = useAuthStore((state) => state.token);
    const language = useLanguageStore((state) => state.language);

    const formRef = useRef(null);

    // Workers list (for dropdown)
    const [workers, setWorkers] = useState([]);
    const [workersLoading, setWorkersLoading] = useState(true);

    // Work records list
    const [records, setRecords] = useState([]);
    const [recordsLoading, setRecordsLoading] = useState(true);

    // Form state (unified add / edit)
    const defaultForm = { user_id: '', work_date: todayISO(), pants_quantity: 0, shirts_quantity: 0 };
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
            const data = await fetchWork(token);
            setRecords(data.records || []);
        } catch (err) {
            console.error('Failed to load work records:', err);
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

        if (!form.user_id || !form.work_date) {
            setFormError(t('work.error.required', language));
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                user_id: Number(form.user_id),
                work_date: form.work_date,
                pants_quantity: Number(form.pants_quantity) || 0,
                shirts_quantity: Number(form.shirts_quantity) || 0,
            };

            if (editingRecord) {
                await updateWork(editingRecord.id, payload, token);
                setFormSuccess(t('work.success.updated', language));
                setEditingRecord(null);
            } else {
                await createWork(payload, token);
                setFormSuccess(t('work.success.created', language));
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
        // Convert work_date for input[type=date] using local timezone to avoid off-by-one shifts
        let dateVal = todayISO();
        if (record.work_date) {
            const d = new Date(record.work_date);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            dateVal = `${yyyy}-${mm}-${dd}`;
        }

        setEditingRecord(record);
        setForm({
            user_id: String(record.user_id),
            work_date: dateVal,
            pants_quantity: record.pants_quantity,
            shirts_quantity: record.shirts_quantity,
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
        if (!window.confirm(t('work.delete_confirm', language))) return;

        try {
            await deleteWork(id, token);
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

    let headingStr = t('work.add_heading', language);
    if (editingRecord) {
        headingStr = t('work.update_heading', language).replace('{{name}}', getWorkerName(editingRecord));
    }

    return (
        <div className="add-work-page">
            {/* Form Section */}
            <section
                className={`work-form-section ${editingRecord ? 'work-form-section--editing' : ''}`}
                id="work-form-section"
                ref={formRef}
            >
                <div className="section-heading-row">
                    <h2 className="section-heading">
                        {editingRecord ? <Pencil size={20} /> : <ClipboardPlus size={20} />}
                        {headingStr}
                    </h2>
                    {editingRecord && (
                        <button
                            className="btn-icon btn-icon--cancel-edit"
                            onClick={cancelEdit}
                            aria-label={t('work.cancel_edit', language)}
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                <form className="work-form" onSubmit={handleSubmit}>
                    <div className="form-row form-row--2col">
                        {/* Worker Select */}
                        <div className="form-group">
                            <label className="form-label" htmlFor="work-worker">
                                {t('work.worker', language)}
                            </label>
                            <select
                                id="work-worker"
                                className="form-input form-select"
                                value={form.user_id}
                                onChange={(e) => setForm({ ...form, user_id: e.target.value })}
                                disabled={submitting || workersLoading}
                            >
                                <option value="">{t('work.worker.placeholder', language)}</option>
                                {workers.map((w) => (
                                    <option key={w.id} value={w.id}>{w.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Date */}
                        <div className="form-group">
                            <label className="form-label" htmlFor="work-date">
                                {t('work.date', language)}
                            </label>
                            <input
                                id="work-date"
                                className="form-input"
                                type="date"
                                value={form.work_date}
                                onChange={(e) => setForm({ ...form, work_date: e.target.value })}
                                disabled={submitting}
                            />
                        </div>
                    </div>

                    <div className="form-row form-row--2col">
                        {/* Pants */}
                        <div className="form-group">
                            <label className="form-label" htmlFor="work-pants">
                                {t('work.pants', language)}
                            </label>
                            <input
                                id="work-pants"
                                className="form-input"
                                type="number"
                                inputMode="numeric"
                                min="0"
                                value={form.pants_quantity}
                                onChange={(e) => setForm({ ...form, pants_quantity: e.target.value })}
                                disabled={submitting}
                            />
                        </div>

                        {/* Shirts */}
                        <div className="form-group">
                            <label className="form-label" htmlFor="work-shirts">
                                {t('work.shirts', language)}
                            </label>
                            <input
                                id="work-shirts"
                                className="form-input"
                                type="number"
                                inputMode="numeric"
                                min="0"
                                value={form.shirts_quantity}
                                onChange={(e) => setForm({ ...form, shirts_quantity: e.target.value })}
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
                                ? (editingRecord ? t('work.updating', language) : t('work.saving', language))
                                : (editingRecord ? t('work.update', language) : t('work.save', language))}
                        </button>
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={handleClear}
                            disabled={submitting}
                        >
                            {t('work.clear', language)}
                        </button>
                    </div>
                </form>
            </section>

            {/* Work Records Table */}
            <section className="work-records-section" id="work-records-section">
                <h2 className="section-heading">
                    {t('work.list_heading', language)}
                </h2>

                {recordsLoading ? (
                    <div className="work-loading">Loading...</div>
                ) : records.length === 0 ? (
                    <div className="work-empty">{t('work.empty', language)}</div>
                ) : (
                    <>
                        {/* Table header (visible on wider screens) */}
                        <div className="work-table-header">
                            <span className="work-col work-col--name">{t('work.col.name', language)}</span>
                            <span className="work-col work-col--pants">{t('work.col.pants', language)}</span>
                            <span className="work-col work-col--shirts">{t('work.col.shirts', language)}</span>
                            <span className="work-col work-col--date">{t('work.col.date', language)}</span>
                            <span className="work-col work-col--actions">{t('work.col.actions', language)}</span>
                        </div>

                        {/* Records */}
                        <div className="work-records-list">
                            {records.map((rec) => (
                                <div
                                    key={rec.id}
                                    className={`work-record ${editingRecord?.id === rec.id ? 'work-record--editing' : ''}`}
                                    id={`work-record-${rec.id}`}
                                >
                                    <span className="work-col work-col--name" data-label={t('work.col.name', language)}>
                                        {rec.worker_name}
                                    </span>
                                    <span className="work-col work-col--pants" data-label={t('work.col.pants', language)}>
                                        {rec.pants_quantity}
                                    </span>
                                    <span className="work-col work-col--shirts" data-label={t('work.col.shirts', language)}>
                                        {rec.shirts_quantity}
                                    </span>
                                    <span className="work-col work-col--date" data-label={t('work.col.date', language)}>
                                        <Calendar size={14} />
                                        {formatDate(rec.work_date)}
                                    </span>
                                    <span className="work-col work-col--actions">
                                        <button
                                            className="btn-icon btn-icon--edit"
                                            onClick={() => startEdit(rec)}
                                            aria-label={t('work.edit', language)}
                                        >
                                            <Pencil size={15} />
                                        </button>
                                        <button
                                            className="btn-icon btn-icon--delete"
                                            onClick={() => handleDelete(rec.id)}
                                            aria-label={t('work.delete', language)}
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

export default AddWork;
