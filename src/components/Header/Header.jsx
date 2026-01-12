"use client";
import "./Header.css";

const Header = ({ onFilterToggle, showFilters }) => {
  return (
    <header className="chrome-header">
      <div className="header-logo">
        <h1>CHROME HUB</h1>
      </div>
      
      <div className="header-actions">
        <button 
          className={`header-filter-btn ${showFilters ? 'active' : ''}`}
          onClick={onFilterToggle}
        >
          Filters
        </button>
      </div>
    </header>
  );
};

export default Header;
