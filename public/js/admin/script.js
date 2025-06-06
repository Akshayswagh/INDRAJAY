document.addEventListener("DOMContentLoaded", function() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const wrapper = document.getElementById('wrapper');
    const iconElement = sidebarToggle ? sidebarToggle.querySelector('i') : null;
    const DESKTOP_BREAKPOINT = 768; // Bootstrap's 'md' breakpoint (screen width >= 768px)

    // If essential elements are missing, don't proceed
    if (!sidebarToggle || !wrapper || !iconElement) {
        // console.warn("Sidebar toggle elements not found. Advanced icon logic will not run.");
        return;
    }

    // Function to update the toggle icon based on sidebar state and screen size
    function updateToggleIcon() {
        const isMobile = window.innerWidth < DESKTOP_BREAKPOINT;
        let sidebarEffectivelyOpen;

        if (isMobile) {
            // On mobile, sidebar is open if 'toggled' class IS present on wrapper
            sidebarEffectivelyOpen = wrapper.classList.contains('toggled');
        } else {
            // On desktop, sidebar is open if 'toggled' class IS NOT present on wrapper (default is open)
            sidebarEffectivelyOpen = !wrapper.classList.contains('toggled');
        }

        if (sidebarEffectivelyOpen) {
            iconElement.classList.remove('fa-bars');
            iconElement.classList.add('fa-times');
            sidebarToggle.setAttribute('aria-expanded', 'true');
            sidebarToggle.setAttribute('aria-label', 'Close sidebar');
        } else {
            iconElement.classList.remove('fa-times');
            iconElement.classList.add('fa-bars');
            sidebarToggle.setAttribute('aria-expanded', 'false');
            sidebarToggle.setAttribute('aria-label', 'Open sidebar');
        }
    }

    // Function to apply initial sidebar state from localStorage or defaults
    function initializeSidebarState() {
        const storedPreferenceToggled = localStorage.getItem('sidebarToggled') === 'true'; // boolean

        if (window.innerWidth < DESKTOP_BREAKPOINT) { // We are on mobile
            // Mobile default: closed (no 'toggled' class)
            // Open if user preference was to have it open ('toggled' true)
            if (storedPreferenceToggled) {
                wrapper.classList.add('toggled');
            } else {
                wrapper.classList.remove('toggled');
            }
        } else { // We are on desktop
            // Desktop default: open (no 'toggled' class)
            // Close if user preference was to have it closed ('toggled' true)
            if (storedPreferenceToggled) {
                wrapper.classList.add('toggled');
            } else {
                wrapper.classList.remove('toggled');
            }
        }
        updateToggleIcon(); // Set the correct icon after establishing state
    }

    // Initialize sidebar state and icon on page load
    initializeSidebarState();

    // Event listener for the toggle button click
    sidebarToggle.addEventListener('click', function(event) {
        event.preventDefault();
        wrapper.classList.toggle('toggled'); // This class has different meanings on mobile vs desktop

        // Save the preference: 'toggled' class presence means user wants it hidden on desktop,
        // and open on mobile. We store this state.
        localStorage.setItem('sidebarToggled', wrapper.classList.contains('toggled'));
        updateToggleIcon(); // Update icon after toggling
    });

    // Update icon and sidebar state on window resize
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            // Re-run initialization logic to adapt to new screen size and defaults
            initializeSidebarState();
        }, 250); // Debounce resize event
    });

    // Optional: Close mobile sidebar when a link is clicked
    const sidebarLinks = document.querySelectorAll('#sidebar-wrapper .list-group-item');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth < DESKTOP_BREAKPOINT && wrapper.classList.contains('toggled')) {
                wrapper.classList.remove('toggled');
                localStorage.setItem('sidebarToggled', 'false'); // Reflect that it's now closed on mobile
                updateToggleIcon();
            }
        });
    });
});