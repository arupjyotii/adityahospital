import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';

import './index.css';

// Force dark mode globally (black background, white text)
document.documentElement.classList.add('dark');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
