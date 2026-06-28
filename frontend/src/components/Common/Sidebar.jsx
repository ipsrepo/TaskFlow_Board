import {NavLink, useLocation} from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import {ADMIN, NAVITEMS} from './constants';
import Avatar from '../UI/Avatar';
import Button from '../UI/Button';
import Icon from '../UI/Icon';

const Sidebar = ({ open, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = NAVITEMS.filter((item) =>
      item.roles.includes(user?.role)
  );

  const isAdmin = user.role === ADMIN

  const isKanbanRoute = /^\/projects\/[^/]+\/kanban$/.test(
      location.pathname
  );

  return (
      <>
        {open && (
            <button
                type="button"
                className="fixed inset-0 z-30 bg-secondary/30 lg:hidden"
                onClick={onClose}
                aria-label="Close navigation"
            />
        )}

        <aside
            className={`fixed inset-y-16 left-0 z-40 flex w-72 flex-col border-r border-line bg-white transition-transform duration-200 lg:static lg:z-10 lg:w-64 lg:translate-x-0 ${
                open ? 'translate-x-0 shadow-card-hover' : '-translate-x-full'
            }`}
        >
          <div className="border-b border-line px-3 py-3">
            <button
                type="button"
                className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-slate-50"
            >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-primary-100 bg-primary-50 text-sm font-semibold text-primary-700">
              W
            </span>

              <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-secondary">
                My workspace
              </span>

              <span className="block truncate text-xs text-muted">
                Team collaboration
              </span>
            </span>

              <Icon
                  name="chevronDown"
                  size={16}
                  className="text-slate-400"
              />
            </button>
          </div>

          {isAdmin &&

          <div className="px-3 pt-4">
            <NavLink
                to="/projects?new=true"
                onClick={onClose}
                className="btn btn-primary btn-md w-full"
            >
              <Icon name="plus" size={17} />
              Add new
            </NavLink>
          </div>
          }

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5 custom-scrollbar">
            <p className="section-label px-3 pb-2">Workspace</p>

            {navItems.map((item) => (
                <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) => {
                      const isBoardItem = item.to === '/board';

                      const shouldHighlight =
                          isActive || (isBoardItem && isKanbanRoute);

                      return `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                          shouldHighlight
                              ? 'bg-primary-50 text-primary-700 shadow-sm'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-secondary'
                      }`;
                    }}
                >
                  <Icon name={item.icon} size={18} />
                  <span>{item.label}</span>
                </NavLink>
            ))}
          </nav>

          <div className="border-t border-line p-3">
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="flex items-center gap-2.5">
                <Avatar user={user} size="sm" showStatus />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-secondary">
                    {user?.name}
                  </p>

                  <p className="truncate text-xs text-muted">
                    {user?.role}
                  </p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button
                    size="sm"
                    variant="ghost"
                    className="justify-start px-2.5"
                    icon={<Icon name="help" size={15} />}
                >
                  Help
                </Button>

                <Button
                    size="sm"
                    variant="outline"
                    className="justify-start px-2.5"
                    icon={<Icon name="users" size={15} />}
                >
                  Invite
                </Button>
              </div>
            </div>
          </div>
        </aside>
      </>
  );
};

export default Sidebar;