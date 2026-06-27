import { useState, useEffect, useCallback, useRef } from 'react';
import { PlusCircle, Pencil, Trash2, X, Calendar } from 'lucide-react';
import useAuthStore from '../../../store/useAuthStore';
import useLanguageStore from '../../../store/useLanguageStore';
import { t } from '../../../i18n';
import { fetchExpenses, createExpense, updateExpense, deleteExpense } from '../../../api/expenses';
import './AddExpense.css';

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

const AddExpense = () => {
    const token = useAuthStore((state) => state.token);
    const language = useLanguageStore((state) => state.language);

    const formRef = useRef(null);

    // Expenses records
    const [records, setRecords] = useState([]);
    const [recordsLoading, setRecordsLoading] = useState(true);

    // Form state (unified add / edit)
    const defaultForm = { expense_date: todayISO(), description: '', amount: '' };
    const [form, setForm] = useState(defaultForm);
    const [editingRecord, setEditingRecord] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    // Filter state
    const [filterMonth, setFilterMonth] = useState(() => {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        return `${yyyy}-${mm}`;
    });

    const loadRecords = useCallback(async () => {
        try {
            setRecordsLoading(true);
            const data = await fetchExpenses(token, filterMonth);
            setRecords(data.records || []);
        } catch (err) {
            console.error('Failed to load expense records:', err);
        } finally {
            setRecordsLoading(false);
        }
    }, [token, filterMonth]);

    useEffect(() => {
        loadRecords();
    }, [loadRecords]);

    // ---- Form Handling ----
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');

        if (!form.expense_date || !form.amount) {
            setFormError(t('expense.error.required', language));
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                expense_date: form.expense_date,
                description: form.description,
                amount: Number(form.amount) || 0,
            };

            if (editingRecord) {
                await updateExpense(editingRecord.id, payload, token);
                setFormSuccess(t('expense.success.updated', language));
                setEditingRecord(null);
            } else {
                await createExpense(payload, token);
                setFormSuccess(t('expense.success.created', language));
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
        if (record.expense_date) {
            const d = new Date(record.expense_date);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            dateVal = `${yyyy}-${mm}-${dd}`;
        }

        setEditingRecord(record);
        setForm({
            expense_date: dateVal,
            description: record.description || '',
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
        if (!window.confirm(t('expense.delete_confirm', language))) return;

        try {
            await deleteExpense(id, token);
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
    let headingStr = t('expense.add_heading', language);
    if (editingRecord) {
        headingStr = t('expense.update_heading', language);
    }

    return (
        <div className="add-expense-page">
            {/* Form Section */}
            <section
                className={`add-expense-form-section ${editingRecord ? 'add-expense-form-section--editing' : ''}`}
                id="add-expense-form-section"
                ref={formRef}
            >
                <div className="section-heading-row">
                    <h2 className="section-heading">
                        {editingRecord ? <Pencil size={20} /> : <PlusCircle size={20} />}
                        {headingStr}
                    </h2>
                    {editingRecord && (
                        <button
                            className="btn-icon btn-icon--cancel-edit"
                            onClick={cancelEdit}
                            aria-label={t('expense.cancel_edit', language)}
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                <form className="add-expense-form" onSubmit={handleSubmit}>
                    <div className="form-row form-row--2col">
                        {/* Date */}
                        <div className="form-group">
                            <label className="form-label" htmlFor="expense-date">
                                {t('expense.date', language)}
                            </label>
                            <input
                                id="expense-date"
                                className="form-input"
                                type="date"
                                value={form.expense_date}
                                onChange={(e) => setForm({ ...form, expense_date: e.target.value })}
                                disabled={submitting}
                            />
                        </div>

                        {/* Amount */}
                        <div className="form-group">
                            <label className="form-label" htmlFor="expense-amount">
                                {t('expense.amount', language)}
                            </label>
                            <input
                                id="expense-amount"
                                className="form-input"
                                type="number"
                                inputMode="numeric"
                                min="0"
                                step="0.01"
                                placeholder={t('expense.amount.placeholder', language)}
                                value={form.amount}
                                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                disabled={submitting}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        {/* Description */}
                        <div className="form-group">
                            <label className="form-label" htmlFor="expense-description">
                                {t('expense.description', language)}
                            </label>
                            <textarea
                                id="expense-description"
                                className="form-input"
                                placeholder={t('expense.description.placeholder', language)}
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                disabled={submitting}
                                rows="3"
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
                                ? (editingRecord ? t('expense.updating', language) : t('expense.saving', language))
                                : (editingRecord ? t('expense.update', language) : t('expense.save', language))}
                        </button>
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={handleClear}
                            disabled={submitting}
                        >
                            {t('expense.clear', language)}
                        </button>
                    </div>
                </form>
            </section>

            {/* Expense Records Table */}
            <section className="add-expense-records-section" id="add-expense-records-section">
                <div className="section-heading-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 className="section-heading" style={{ margin: 0 }}>
                        {t('expense.list_heading', language)}
                    </h2>
                    <input 
                        type="month" 
                        className="form-input" 
                        value={filterMonth} 
                        onChange={(e) => setFilterMonth(e.target.value)}
                        style={{ width: 'auto', margin: 0, padding: '8px 12px' }}
                    />
                </div>

                {recordsLoading ? (
                    <div className="expense-loading">Loading...</div>
                ) : records.length === 0 ? (
                    <div className="expense-empty">{t('expense.empty', language)}</div>
                ) : (
                    <>
                        {/* Table header */}
                        <div className="expense-table-header">
                            <span className="exp-col exp-col--date">{t('expense.col.date', language)}</span>
                            <span className="exp-col exp-col--desc">{t('expense.col.description', language)}</span>
                            <span className="exp-col exp-col--amount">{t('expense.col.amount', language)}</span>
                            <span className="exp-col exp-col--actions">{t('expense.col.actions', language)}</span>
                        </div>

                        {/* Records */}
                        <div className="expense-records-list">
                            {records.map((rec) => (
                                <div
                                    key={rec.id}
                                    className={`expense-record ${editingRecord?.id === rec.id ? 'expense-record--editing' : ''}`}
                                    id={`expense-record-${rec.id}`}
                                >
                                    <span className="exp-col exp-col--date" data-label={t('expense.col.date', language)}>
                                        <Calendar size={14} />
                                        {formatDate(rec.expense_date)}
                                    </span>
                                    <span className="exp-col exp-col--desc" data-label={t('expense.col.description', language)}>
                                        {rec.description || '-'}
                                    </span>
                                    <span className="exp-col exp-col--amount" data-label={t('expense.col.amount', language)}>
                                        ₹{Number(rec.amount).toLocaleString('en-IN')}
                                    </span>
                                    <span className="exp-col exp-col--actions">
                                        <button
                                            className="btn-icon btn-icon--edit"
                                            onClick={() => startEdit(rec)}
                                            aria-label={t('expense.edit', language)}
                                        >
                                            <Pencil size={15} />
                                        </button>
                                        <button
                                            className="btn-icon btn-icon--delete"
                                            onClick={() => handleDelete(rec.id)}
                                            aria-label={t('expense.delete', language)}
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

export default AddExpense;
