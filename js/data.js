// This file now acts as a bridge to the API for backward compatibility
// but will eventually be replaced by direct API calls in modern parts of the app

let properties = [];

const loadProperties = async () => {
    try {
        properties = await window.api.getProperties();
        console.log('Properties loaded from API:', properties);
        // Trigger a custom event so other scripts know data is ready
        document.dispatchEvent(new CustomEvent('propertiesLoaded', { detail: properties }));
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
