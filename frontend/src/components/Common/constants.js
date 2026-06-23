export const SUCCESS = 'success';


export const NAVITEMS = [
    { label: 'Dashboard', to: '/dashboard', icon: '⊞', roles: ['member', 'lead', 'admin'] },
    { label: 'My Tasks', to: '/my-tasks', icon: '✓', roles: ['member', 'lead', 'admin'] },
    { label: 'Projects', to: '/projects', icon: '◫', roles: ['member', 'lead', 'admin'] },
    { label: 'Users', to: '/users', icon: '◎', roles: ['admin'] },
    { label: 'Profile', to: '/profile', icon: '◷', roles: ['member', 'lead', 'admin'] },
];

export const TOKEN_KEY = 'taskflow_token';
export const USER_KEY = 'taskflow_user';