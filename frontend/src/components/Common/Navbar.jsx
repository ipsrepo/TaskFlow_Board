import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Avatar from '../UI/Avatar';
import Dropdown from '../UI/Dropdown';
import Icon from '../UI/Icon';

const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');

  const submitSearch = (event) => {
    event.preventDefault();
    const query = searchValue.trim();
    navigate(query ? `/projects?search=${encodeURIComponent(query)}` : '/projects');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { label: 'My profile', icon: <Icon name="user" size={16} />, onClick: () => navigate('/profile') },
    { divider: true },
    { label: 'Sign out', icon: <Icon name="logout" size={16} />, onClick: handleLogout, danger: true },
  ];

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-line bg-white/95 shadow-topbar backdrop-blur">
      <div className="flex h-full items-center gap-3 px-4 lg:px-5">
        <button type="button" onClick={onMenuToggle} className="icon-button lg:hidden" aria-label="Open navigation">
          <Icon name="menu" size={20} />
        </button>

        <Link to="/dashboard" className="flex shrink-0 items-center gap-2.5" aria-label="TaskBoard home">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white shadow-sm">T</span>
          <span className="hidden text-base font-bold tracking-[-0.03em] text-secondary sm:block">TaskBoard</span>
        </Link>

        <form onSubmit={submitSearch} className="mx-auto hidden w-full max-w-md md:block">
          <label className="relative block">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400"><Icon name="search" size={17} /></span>
            <input
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search projects"
              className="h-9 w-full rounded-xl border border-transparent bg-slate-100/90 py-2 pl-9 pr-3 text-sm text-secondary placeholder:text-slate-400 outline-none transition-all focus:border-primary-200 focus:bg-white focus:ring-4 focus:ring-primary-50"
            />
          </label>
        </form>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <button type="button" className="icon-button" aria-label="Open notifications">
            <Icon name="bell" size={19} />
          </button>
          <Dropdown
            trigger={
              <button type="button" className="rounded-full p-0.5 transition-shadow hover:ring-4 hover:ring-primary-50" aria-label="Open user menu">
                <Avatar user={user} size="sm" showStatus />
              </button>
            }
            items={menuItems}
          />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
