import React from 'react';
import ReactDOM from 'react-dom/client';
import { MilkyWay } from './pages/MilkyWay';
import './styles/GoogleMapsUI.css';
import './styles/responsive.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MilkyWay />
  </React.StrictMode>
);
