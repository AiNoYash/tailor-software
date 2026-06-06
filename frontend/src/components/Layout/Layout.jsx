import { useLocation } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import TopNav from '../TopNav/TopNav';
import BottomNav from '../BottomNav/BottomNav';
import LanguageFooter from '../LanguageFooter/LanguageFooter';
import navConfig from '../../config/navConfig';
import './Layout.css';

const Layout = ({ children }) => {
    const location = useLocation();
    const user = useAuthStore((state) => state.user);
    const role = user?.role || 'worker';

    // Determine which top-level page we're on
    const currentPage = navConfig.find((page) => {
        if (page.path === '/') return location.pathname === '/';
        return location.pathname.startsWith(page.path);
    });

    // Get sub-pages for current page (only if user has access)
    const subPages =
        currentPage && currentPage.roles.includes(role)
            ? currentPage.subPages
            : [];

    const hasBottomNav = subPages.length > 1;

    return (
        <div className="layout">
            <TopNav />
            <main className={`layout__content ${hasBottomNav ? 'layout__content--with-bottom-nav' : ''}`}>
                {children}
            </main>
            <BottomNav subPages={subPages} />
            <LanguageFooter />
        </div>
    );
};

export default Layout;
