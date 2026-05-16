import { NavLink } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks';
import { RootState } from '../store';
import { setSearchQuery } from '../features/coins/coinsSlice';

const Navbar = () => {
  const dispatch = useAppDispatch();
  const searchQuery = useAppSelector((state: RootState) => state.coins.selection.searchQuery);

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
    </header>
  );
};

export default Navbar;
