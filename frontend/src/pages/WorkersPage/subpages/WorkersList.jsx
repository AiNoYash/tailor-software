import { useState, useEffect, useCallback, useRef } from 'react';
import { UserPlus, Pencil, X, Shield, Wrench, Trash2 } from 'lucide-react';
import useAuthStore from '../../../store/useAuthStore';
import useLanguageStore from '../../../store/useLanguageStore';
import { t } from '../../../i18n';
import { fetchWorkers, createWorker, updateWorker, deleteWorker } from '../../../api/workers';
import './WorkersList.css';

const WorkersList = () => {
    const token = useAuthStore((state) => state.token);
    const language = useLanguageStore((state) => state.language);
    // Optional: getting authUser to conditionally prevent deleting oneself could be added here

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const formRef = useRef(null);

    // Unified form state for Add and Edit
    const [form, setForm] = useState({ name: '', mobile_no: '', password: '' });
    const [editingUser, setEditingUser] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    const loadUsers = useCallback(async () => {
        try {
            const data = await fetchWorkers(token);
            setUsers(data.users || []);
        } catch (err) {
            console.error('Failed to load users:', err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    // ---- Form Handling ----
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');

        // Name and mobile are always required
        if (!form.name.trim() || !form.mobile_no.trim()) {
            setFormError(t('workers.error.required', language));
            return;
        }

        // If adding, password is required
        if (!editingUser && !form.password.trim()) {
            setFormError(t('workers.error.required', language));
            return;
        }

        setSubmitting(true);
        try {
            if (editingUser) {
                // Update mode
                const updates = { name: form.name, mobile_no: form.mobile_no };
                if (form.password.trim()) {
                    updates.password = form.password;
                }
                await updateWorker(editingUser.id, updates, token);
                setFormSuccess(t('workers.success.updated', language));
                setEditingUser(null);
                setForm({ name: '', mobile_no: '', password: '' });
            } else {
                // Create mode
                await createWorker(form, token);
                setFormSuccess(t('workers.success.created', language));
                setForm({ name: '', mobile_no: '', password: '' });
            }
            await loadUsers();
            setTimeout(() => setFormSuccess(''), 3000);
        } catch (err) {
            setFormError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const startEdit = (user) => {
        setEditingUser(user);
        setForm({ name: user.name, mobile_no: user.mobile_no, password: '' });
        setFormError('');
        setFormSuccess('');
        if (formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const cancelEdit = () => {
        setEditingUser(null);
        setForm({ name: '', mobile_no: '', password: '' });
        setFormError('');
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('workers.delete_confirm', language))) return;

        try {
            await deleteWorker(id, token);
            await loadUsers();

            // If the deleted user was being edited, cancel edit
            if (editingUser && editingUser.id === id) {
                cancelEdit();
            }
        } catch (err) {
            alert(err.message);
        }
    };

    // Calculate dynamic heading based on state
    let headingStr = t('workers.add_heading', language);
    if (editingUser) {
        const rawStr = t('workers.update_heading', language);
        headingStr = rawStr.replace('{{name}}', editingUser.name);
    }

    return (
        <div className="workers-list-page">
            {/* Form Section */}
            <section className={`workers-add-section ${editingUser ? 'workers-add-section--editing' : ''}`} id="workers-add-section" ref={formRef}>
                <div className="section-heading-row">
                    <h2 className="section-heading">
                        {editingUser ? <Pencil size={20} /> : <UserPlus size={20} />}
                        {headingStr}
                    </h2>
                    {editingUser && (
                        <button className="btn-icon btn-icon--cancel-edit" onClick={cancelEdit} aria-label={t('workers.cancel_edit', language)}>
                            <X size={20} />
                        </button>
                    )}
                </div>

                <form className="workers-add-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label" htmlFor="worker-name">
                                {t('workers.name', language)}
                            </label>
                            <input
                                id="worker-name"
                                className="form-input"
                                type="text"
                                placeholder={t('workers.name.placeholder', language)}
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                disabled={submitting}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="worker-mobile">
                                {t('workers.mobile', language)}
                            </label>
                            <input
                                id="worker-mobile"
                                className="form-input"
                                type="tel"
                                inputMode="numeric"
                                placeholder={t('workers.mobile.placeholder', language)}
                                value={form.mobile_no}
                                onChange={(e) => setForm({ ...form, mobile_no: e.target.value })}
                                disabled={submitting}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="worker-password">
                                {t('workers.password', language)}
                            </label>
                            <input
                                id="worker-password"
                                className="form-input"
                                type="password"
                                placeholder={editingUser ? t('workers.password.edit_placeholder', language) : t('workers.password.placeholder', language)}
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                disabled={submitting}
                            />
                        </div>
                    </div>

                    {formError && <p className="form-error" role="alert">{formError}</p>}
                    {formSuccess && <p className="form-success" role="status">{formSuccess}</p>}

                    <div className="form-actions">
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={submitting}
                        >
                            {submitting
                                ? (editingUser ? t('workers.updating', language) : t('workers.adding', language))
                                : (editingUser ? t('workers.update', language) : t('workers.submit', language))}
                        </button>
                    </div>
                </form>
            </section>

            {/* Workers List */}
            <section className="workers-list-section" id="workers-list-section">
                <h2 className="section-heading">
                    {t('workers.list_heading', language)}
                </h2>

                {loading ? (
                    <div className="workers-loading">Loading...</div>
                ) : (
                    <div className="workers-list">
                        {users.map((user) => (
                            <div
                                key={user.id}
                                className={`worker-card ${user.role === 'admin' ? 'worker-card--admin' : ''} ${editingUser?.id === user.id ? 'worker-card--editing' : ''}`}
                                id={`worker-card-${user.id}`}
                            >
                                <div className="worker-card__view">
                                    <div className="worker-card__info">
                                        <div className="worker-card__icon">
                                            {user.role === 'admin' ? <Shield size={18} /> : <Wrench size={18} />}
                                        </div>
                                        <div className="worker-card__details">
                                            <span className="worker-card__name">{user.name}</span>
                                            <span className="worker-card__mobile">{user.mobile_no}</span>
                                        </div>
                                        <span className={`worker-card__badge ${user.role === 'admin' ? 'worker-card__badge--admin' : ''}`}>
                                            {user.role === 'admin'
                                                ? t('workers.admin_label', language)
                                                : t('workers.worker_label', language)}
                                        </span>
                                    </div>
                                    <div className="worker-card__actions">
                                        <button
                                            className="btn-icon btn-icon--edit"
                                            onClick={() => startEdit(user)}
                                            aria-label={t('workers.edit', language)}
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        {user.role !== "admin" && (
                                            <button
                                                className="btn-icon btn-icon--delete"
                                                onClick={() => handleDelete(user.id)}
                                                aria-label={t('workers.delete', language)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default WorkersList;
