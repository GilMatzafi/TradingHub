// Dashboard functionality
function initDashboard() {
    // Add any dashboard-specific initialization here
    console.log('Dashboard initialized');
    
    // Example: Add event listeners for dashboard elements
    const strategyCards = document.querySelectorAll('.strategy-card');
    strategyCards.forEach(card => {
        card.addEventListener('click', function() {
            const strategyUrl = this.getAttribute('data-url');
            if (strategyUrl) {
                window.location.href = strategyUrl;
            }
        });
    });
}

// Export the initialization function
export { initDashboard }; 