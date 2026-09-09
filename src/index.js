import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'slick-carousel/slick/slick.css';
import './scss/style.scss';
import './icons';

const container = document.getElementById('root');

const tree = (
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

/*
 * Adopt the markup that is already there, or build it.
 *
 * The build now writes each route's rendered HTML into this element, so in
 * production there is a page to attach to: hydrating keeps it, and the text
 * stays on screen from the first paint instead of being discarded and drawn
 * again. The development server writes nothing, and hydrating an empty
 * element would report a mismatch on every load, so an empty root is rendered
 * the ordinary way.
 */
if (container.hasChildNodes()) {
  ReactDOM.hydrateRoot(container, tree);
} else {
  ReactDOM.createRoot(container).render(tree);
}
