import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import '../css/app.css';

import { Ziggy } from './ziggy';
import { route } from 'ziggy-js';

window.route = (name, params, absolute) =>
    route(name, params, absolute, Ziggy);

createInertiaApp({
    progress: {
        delay: 250,        // Wait 250ms before showing the bar
        color: '#29d',     // The color of the progress bar
        includeCSS: true,  // Whether to include the default NProgress styles
        showSpinner: true, // Whether to show the loading spinner
    },
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.jsx');
        return pages[`./Pages/${name}.jsx`]();
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
});
