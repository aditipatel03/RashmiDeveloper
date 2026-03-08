// This file now acts as a bridge to the API for backward compatibility
// but will eventually be replaced by direct API calls in modern parts of the app

let properties = [];

const loadProperties = async () => {
    try {
        properties = await window.api.getProperties();
        // Filter out inactive properties for public view
        const activeProperties = properties.filter(p => p.status === 'Active');
        console.log('Active properties loaded:', activeProperties);
        // Trigger a custom event so other scripts know data is ready
        document.dispatchEvent(new CustomEvent('propertiesLoaded', { detail: activeProperties }));
    } catch (err) {
        console.error('Failed to load properties:', err);
    }
};

// Initial load
if (window.api) {
    loadProperties();
} else {
    document.addEventListener('DOMContentLoaded', loadProperties);
}

// Export for scripts that still use the global properties array
// Note: This won't be reactive. Better to use the event or a getter.
window.getProperties = () => properties;
