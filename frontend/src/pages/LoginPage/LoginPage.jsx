import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import useLanguageStore from '../../store/useLanguageStore';
import { t } from '../../i18n';
import { loginUser } from '../../api/auth';
import { Eye, EyeOff } from 'lucide-react';
import LanguageFooter from '../../components/LanguageFooter/LanguageFooter';
import './LoginPage.css';

const LoginPage = () => {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const language = useLanguageStore((state) => state.language);

    const [role, setRole] = useState('admin');
    const [mobileNo, setMobileNo] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Basic validation
        if (!mobileNo.trim() || !password.trim()) {
            setError(t('login.error.required', language));
            return;
        }

        setLoading(true);

        try {
            const data = await loginUser({
                mobile_no: mobileNo,
                password,
                role,
            });

            login(data.user, data.token);
            navigate('/customer', { replace: true });
        } catch (err) {
            setError(err.message || t('login.error.server', language));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card" id="login-card">
                {/* Header */}
                <div className="login-header">
                    <h1 className="login-title" id="login-title">
                        {t('app.title', language)}
                    </h1>
                    <p className="login-subtitle">
                        {t('login.subheading', language)}
                    </p>
                </div>

                {/* Role Toggle */}
                <div className="role-toggle" id="role-toggle">
                    <button
                        id="role-btn-admin"
                        type="button"
                        className={`role-toggle__btn ${role === 'admin' ? 'role-toggle__btn--active' : ''}`}
                        onClick={() => setRole('admin')}
                    >
                        {t('login.role.admin', language)}
                    </button>
                    <button
                        id="role-btn-worker"
                        type="button"
                        className={`role-toggle__btn ${role === 'worker' ? 'role-toggle__btn--active' : ''}`}
                        onClick={() => setRole('worker')}
                    >
                        {t('login.role.worker', language)}
                    </button>
                </div>

                {/* Form */}
                <form className="login-form" onSubmit={handleSubmit} id="login-form">
                    <div className="form-group">
                        <label className="form-label" htmlFor="mobile-input">
                            {t('login.mobile', language)}
                        </label>
                        <input
                            id="mobile-input"
                            className="form-input"
                            type="tel"
                            inputMode="numeric"
                            autoComplete="tel"
                            placeholder={t('login.mobile.placeholder', language)}
                            value={mobileNo}
                            onChange={(e) => setMobileNo(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="password-input">
                            {t('login.password', language)}
                        </label>
                        <div className="password-wrapper">
                            <input
                                id="password-input"
                                className="form-input"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                placeholder={t('login.password.placeholder', language)}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                            />
                            <button
                                id="toggle-password-btn"
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label="Toggle password visibility"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <p className="login-error" id="login-error" role="alert">
                            {error}
                        </p>
                    )}

                    <button
                        id="login-submit-btn"
                        type="submit"
                        className="login-submit"
                        disabled={loading}
                    >
                        {loading
                            ? t('login.signing_in', language)
                            : t('login.submit', language)}
                    </button>
                </form>
            </div>
            <LanguageFooter />
        </div>
    );
};

export default LoginPage;
