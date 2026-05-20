import { NavLink } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks';
import { RootState } from '../store';
import { setSearchQuery } from '../features/coins/coinsSlice';
import { useApiKey } from '../contexts/ApiKeyContext';

const Navbar = () => {
  const dispatch = useAppDispatch();
  const searchQuery = useAppSelector((state: RootState) => state.coins.selection.searchQuery);
  const { isKeySet } = useApiKey();

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <span className="brand-title">Cryptonite</span>
        <span className="brand-subtitle">Crypto Dashboard</span>
      </div>
      <nav className="navbar-links">
        <NavLink to="/" end>
          Home
        </NavLink>
        <NavLink to="/reports">Realtime Report</NavLink>
        <NavLink to="/ai">AI Recommendation</NavLink>
        <NavLink to="/about">About</NavLink>
      </nav>
      <div className="navbar-search">
        <input
          value={searchQuery}
          onChange={(event) => dispatch(setSearchQuery(event.target.value))}
          placeholder="Search coins..."
          aria-label="Search coins"
        />
      </div>
      {isKeySet && (
        <div className="navbar-api-status">
          <span className="api-indicator">🔑 API Key Set</span>
        </div>
      )}
    </header>
  );
};

export default Navbar;
