import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Breadcrumbs from '../common/Breadcrumbs';
import './MainLayout.css';

export default function MainLayout({ children }) {
  return (
    <div className="main-layout">
      <Header />
      <Breadcrumbs />
      <main className="main-content">
        {children || <Outlet />}
      </main>
      <Footer />
    </div>
  );
}

