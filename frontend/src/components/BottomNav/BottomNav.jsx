import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutGrid, X } from 'lucide-react';
import * as icons from 'lucide-react';
import useLanguageStore from '../../store/useLanguageStore';
import { t } from '../../i18n';
import './BottomNav.css';

const BottomNav = ({ subPages }) => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const language = useLanguageStore((state) => state.language);

    // Don't render if only 1 or no sub-pages
    if (!subPages || subPages.length <= 1) return null;

    const handleNavigate = (path) => {
        navigate(path);
        setIsOpen(false);
    };

    const isActive = (subPage) => {
        // Exact match for index routes, startsWith for nested
        if (subPage.path === location.pathname) return true;
        // For the index sub-page (e.g. /workers), only match exact
        if (subPage.key === subPages[0].key) return location.pathname === subPage.path;
        return location.pathname.startsWith(subPage.path);
    };

    const getIcon = (iconName) => {
        const IconComponent = icons[iconName];
        return IconComponent ? <IconComponent size={18} /> : null;
    };

    // Find the active sub-page label for the trigger button
    const activeSubPage = subPages.find((sp) => isActive(sp)) || subPages[0];

    return (
        <>
            {/* Trigger button — fixed at bottom */}
            <button
                className="bottom-nav-trigger"
                id="bottom-nav-trigger"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Open sub-menu"
            >
                {isOpen ? <X size={20} /> : <LayoutGrid size={20} />}
                <span className="bottom-nav-trigger__label">
                    {t(activeSubPage.labelKey, language)}
                </span>
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="bottom-nav-overlay"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Slide-up panel */}
            <div className={`bottom-nav-panel ${isOpen ? 'bottom-nav-panel--open' : ''}`} id="bottom-nav-panel">
                <div className="bottom-nav-panel__links">
                    {subPages.map((sp) => (
                        <button
                            key={sp.key}
                            id={`bottom-nav-link-${sp.key}`}
                            className={`bottom-nav-panel__link ${isActive(sp) ? 'bottom-nav-panel__link--active' : ''}`}
                            onClick={() => handleNavigate(sp.path)}
                        >
                            {getIcon(sp.icon)}
                            <span>{t(sp.labelKey, language)}</span>
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
};

export default BottomNav;
