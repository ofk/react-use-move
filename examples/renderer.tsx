import React from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './components/App';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.querySelector('#app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
