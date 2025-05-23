document.addEventListener('DOMContentLoaded', function() {
    // Handle clicks on main menu items
    document.querySelectorAll('.meniu-element > a').forEach(function(link) {
        link.addEventListener('click', function(e) {
            const menuItem = this.parentElement;
            const submenu = menuItem.querySelector('.submeniu');
            
            // If this menu item has a submenu
            if (submenu) {
                e.preventDefault(); // Prevent navigation
                
                // Toggle active state for this menu item
                const wasActive = menuItem.classList.contains('active');
                
                // Close all open submenus
                document.querySelectorAll('.meniu-element.active').forEach(function(item) {
                    item.classList.remove('active');
                });
                
                // If it wasn't active before, make it active now (toggle behavior)
                if (!wasActive) {
                    menuItem.classList.add('active');
                }
            } else {
                // No submenu - just navigate normally and close hamburger
                document.getElementById('hamburgerToggle').checked = false;
            }
        });
    });
    
    // Handle clicks on submenu items - navigate and close menu
    document.querySelectorAll('.submeniu a').forEach(function(link) {
        link.addEventListener('click', function(e) {
            // Let the link work normally - no preventDefault here
            
            // Close hamburger menu
            document.getElementById('hamburgerToggle').checked = false;
            
            // Also close the submenu by removing active class from parent
            const menuItem = this.closest('.meniu-element');
            if (menuItem) {
                menuItem.classList.remove('active');
            }
        });
    });
});