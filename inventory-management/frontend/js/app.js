/**
 * Application Entry Point and Navigation
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- Navigation Logic ---
    const navLinks = document.querySelectorAll('.sidebar .nav-links li[data-view]');
    const views = document.querySelectorAll('.view');
    const pageTitle = document.getElementById('pageTitle');
    const breadcrumbPath = document.getElementById('breadcrumbPath');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Remove active class from all nav items
            document.querySelectorAll('.sidebar .nav-links li').forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked item
            link.classList.add('active');
            
            // Hide all views
            views.forEach(v => v.style.display = 'none');
            
            // Show target view
            const viewId = link.dataset.view;
            const targetView = document.getElementById(`${viewId}View`);
            if (targetView) {
                targetView.style.display = 'block';
            }
            
            // Update Headers
            const titleMap = {
                'dashboard': 'Dashboard',
                'products': 'Inventory Management',
                'low-stock': 'Low Stock Alerts',
                'analytics': 'Analytics & Reports'
            };
            
            const breadcrumbMap = {
                'dashboard': 'Dashboard',
                'products': 'Products',
                'low-stock': 'Low Stock',
                'analytics': 'Analytics'
            };
            
            pageTitle.textContent = titleMap[viewId];
            breadcrumbPath.textContent = breadcrumbMap[viewId];
            
            // On mobile, auto close sidebar after navigation
            if (window.innerWidth <= 768) {
                document.getElementById('sidebar').classList.remove('open');
            }
        });
    });
    
    // View All Products button from dashboard
    document.getElementById('viewAllBtn')?.addEventListener('click', () => {
        const prodLink = document.querySelector('li[data-view="products"]');
        if (prodLink) prodLink.click();
    });

    // --- Sidebar Mobile Toggle ---
    const sidebar = document.getElementById('sidebar');
    const openBtn = document.getElementById('openSidebarBtn');
    const closeBtn = document.getElementById('closeSidebarBtn');
    
    openBtn?.addEventListener('click', () => sidebar.classList.add('open'));
    closeBtn?.addEventListener('click', () => sidebar.classList.remove('open'));
    
    // Close sidebar if clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && 
            !sidebar.contains(e.target) && 
            !openBtn.contains(e.target) && 
            sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }
    });

    // Close modals on escape key or outside click
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            ui.closeAllModals();
        }
    });
    
    document.getElementById('modalOverlay')?.addEventListener('click', () => {
        ui.closeAllModals();
    });
    
    // Global Search Simulator (Redirects to products tab and searches)
    document.getElementById('globalSearchInput')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = e.target.value;
            // Navigate to products view
            document.querySelector('li[data-view="products"]').click();
            // Set query and trigger input event
            const prodSearch = document.getElementById('productSearchInput');
            prodSearch.value = query;
            prodSearch.dispatchEvent(new Event('input'));
        }
    });

    // --- Initialize Data ---
    productsManager.init();
});
