import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import * as icons from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import useLanguageStore from '../../store/useLanguageStore';
import { t } from '../../i18n';
import navConfig from '../../config/navConfig';
import './TopNav.css';

const TopNav = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuthStore();
    const language = useLanguageStore((state) => state.language);

    const role = user?.role || 'worker';

    // Filter pages by role
    const visiblePages = navConfig.filter((page) => page.roles.includes(role));

    const handleNavigate = (path) => {
        navigate(path);
        setIsOpen(false);
    };

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    const getIcon = (iconName) => {
        const IconComponent = icons[iconName];
        return IconComponent ? <IconComponent size={20} /> : null;
    };

    return (
        <>
            {/* Header bar */}
            <header className="top-nav-header" id="top-nav-header">
                <button
                    className="top-nav-hamburger"
                    id="top-nav-hamburger"
                    onClick={() => setIsOpen(true)}
                    aria-label="Open menu"
                >
                    <Menu size={22} />
                </button>

                <h1 className="top-nav-title" id="top-nav-title">
                    {t('app.title', language)}
                </h1>

                <button
                    className="top-nav-logout"
                    id="top-nav-logout"
                    onClick={handleLogout}
                    aria-label={t('nav.logout', language)}
                >
                    <LogOut size={20} />
                </button>
            </header>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="top-nav-overlay"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Drawer */}
            <nav className={`top-nav-drawer ${isOpen ? 'top-nav-drawer--open' : ''}`} id="top-nav-drawer">
                <div className="top-nav-drawer__header">
                    <span className="top-nav-drawer__title">{t('nav.menu', language)}</span>
                    <button
                        className="top-nav-drawer__close"
                        onClick={() => setIsOpen(false)}
                        aria-label="Close menu"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="top-nav-drawer__links">
                    {visiblePages.map((page) => (
                        <button
                            key={page.key}
                            id={`top-nav-link-${page.key}`}
                            className={`top-nav-drawer__link ${isActive(page.path) ? 'top-nav-drawer__link--active' : ''}`}
                            onClick={() => handleNavigate(page.path)}
                        >
                            {getIcon(page.icon)}
                            <span>{t(page.labelKey, language)}</span>
                        </button>
                    ))}
                </div>

                <div className="top-nav-drawer__footer">
                    <button
                        className="top-nav-drawer__logout"
                        onClick={handleLogout}
                    >
                        <LogOut size={18} />
                        <span>{t('nav.logout', language)}</span>
                    </button>
                </div>
            </nav>
        </>
    );
};

export default TopNav;
