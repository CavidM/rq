import React from 'react';
import { Link } from 'react-router-dom';
import {OfflineBanner} from "../../../features/offline-banner/OfflineBanner";

interface AppLayoutProps {
  children: React.ReactNode;
}

const navStyle = { padding: '20px', backgroundColor: '#f0f0f0', marginBottom: '20px' };
const linkStyle = { margin: '0 15px', textDecoration: 'none', color: '#007bff' };
const mainStyle = { padding: '20px' };

/**
 * Layout component with navigation and main content area
 */
export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="app-layout">
        <OfflineBanner/>
      <nav style={navStyle}>
        <Link to="/" style={linkStyle}>Home</Link>
        <Link to="/about" style={linkStyle}>About</Link>
        <Link to="/contact" style={linkStyle}>Contact</Link>
      </nav>
      <main style={mainStyle}>
        {children}
      </main>
    </div>
  );
};
