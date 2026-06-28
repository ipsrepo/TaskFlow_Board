export const SUCCESS = 'success';

export const ADMIN = 'admin';
export const LEAD = 'lead';
export const MEMBER = 'member';

export const ALL_ROLES = [ADMIN, LEAD, MEMBER];

export const NAVITEMS = [
    {
        label: 'Dashboard',
        to: '/dashboard',
        icon: 'grid',
        roles: ALL_ROLES
    },
    {
        label: 'My Tasks',
        to: '/my-tasks',
        icon: 'tasks',
        roles: ALL_ROLES
    },
    {
        label: 'Projects',
        to: '/projects',
        icon: 'folder',
        roles: ALL_ROLES
    },
    {
        label: 'Board',
        to: '/board',
        icon: 'columns',
        roles: ALL_ROLES,
    },
    {
        label: 'Users',
        to: '/users',
        icon: 'users',
        roles: ['admin']
    },
    {
        label: 'Profile',
        to: '/profile',
        icon: 'user',
        roles: ALL_ROLES
    }
];

export const TOKEN_KEY = 'taskflow_token';
export const USER_KEY = 'taskflow_user';


export const STATUS_OPTIONS = [{value: 'active', label: 'Active'}, {
    value: 'on-hold',
    label: 'On hold'
}, {value: 'completed', label: 'Completed'}, {value: 'cancelled', label: 'Cancelled'},];