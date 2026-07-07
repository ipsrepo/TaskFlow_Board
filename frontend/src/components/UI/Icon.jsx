const paths = {
    menu: <>
        <path d="M4 6h16M4 12h16M4 18h16"/>
    </>,
    grid: <>
        <rect x="4" y="4" width="6" height="6" rx="1"/>
        <rect x="14" y="4" width="6" height="6" rx="1"/>
        <rect x="4" y="14" width="6" height="6" rx="1"/>
        <rect x="14" y="14" width="6" height="6" rx="1"/>
    </>,
    tasks: <>
        <path d="M9 6h11M9 12h11M9 18h11"/>
        <path d="m4 6 1.5 1.5L7.5 5M4 12l1.5 1.5L7.5 11M4 18l1.5 1.5L7.5 17"/>
    </>,
    folder: <>
        <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/>
    </>,
    users: <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </>,
    user: <>
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 21a8 8 0 0 1 16 0"/>
    </>,
    chart: <>
        <path d="M3 3v18h18"/>
        <path d="m7 16 4-5 3 3 5-7"/>
    </>,
    bell: <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>
    </>,
    search: <>
        <circle cx="11" cy="11" r="6"/>
        <path d="m20 20-4.35-4.35"/>
    </>,
    plus: <>
        <path d="M12 5v14M5 12h14"/>
    </>,
    more: <>
        <circle cx="5" cy="12" r="1" fill="currentColor" stroke="none"/>
        <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>
        <circle cx="19" cy="12" r="1" fill="currentColor" stroke="none"/>
    </>,
    chevronDown: <>
        <path d="m6 9 6 6 6-6"/>
    </>,
    chevronRight: <>
        <path d="m9 18 6-6-6-6"/>
    </>,
    arrowLeft: <>
        <path d="M19 12H5M12 19l-7-7 7-7"/>
    </>,
    arrowRight: <>
        <path d="M5 12h14M12 5l7 7-7 7"/>
    </>,
    calendar: <>
        <rect x="3" y="5" width="18" height="16" rx="2"/>
        <path d="M16 3v4M8 3v4M3 11h18"/>
    </>,
    columns: <>
        <rect x="3" y="4" width="18" height="16" rx="2"/>
        <path d="M9 4v16M15 4v16"/>
    </>,
    list: <>
        <path d="M8 6h13M8 12h13M8 18h13"/>
        <path d="M3 6h.01M3 12h.01M3 18h.01"/>
    </>,
    file: <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/>
        <path d="M14 2v6h6M8 13h8M8 17h6"/>
    </>,
    filter: <>
        <path d="M4 5h16M7 12h10M10 19h4"/>
    </>,
    edit: <>
        <path d="M12 20h9"/>
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
    </>,
    trash: <>
        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5"/>
    </>,
    x: <>
        <path d="M18 6 6 18M6 6l12 12"/>
    </>,
    check: <>
        <path d="m5 12 4 4L19 6"/>
    </>,
    handle: <>
        <circle cx="9" cy="6" r="1" fill="currentColor" stroke="none"/>
        <circle cx="15" cy="6" r="1" fill="currentColor" stroke="none"/>
        <circle cx="9" cy="12" r="1" fill="currentColor" stroke="none"/>
        <circle cx="15" cy="12" r="1" fill="currentColor" stroke="none"/>
        <circle cx="9" cy="18" r="1" fill="currentColor" stroke="none"/>
        <circle cx="15" cy="18" r="1" fill="currentColor" stroke="none"/>
    </>,
    flag: <>
        <path d="M5 22V4"/>
        <path d="M5 5h12l-2 4 2 4H5"/>
    </>,
    clock: <>
        <circle cx="12" cy="12" r="9"/>
        <path d="M12 7v5l3 2"/>
    </>,
    message: <>
        <path d="M21 11.5a8.38 8.38 0 0 1-9 8.5 9.5 9.5 0 0 1-4.5-1L3 20l1.2-4.1A8.5 8.5 0 1 1 21 11.5Z"/>
    </>,
    target: <>
        <circle cx="12" cy="12" r="9"/>
        <circle cx="12" cy="12" r="5"/>
        <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>
    </>,
    settings: <>
        <circle cx="12" cy="12" r="3"/>
        <path
            d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.1 2.1-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56v.1h-3v-.1A1.7 1.7 0 0 0 10.7 18.6a1.7 1.7 0 0 0-1.88.34l-.06.06-2.1-2.1.06-.06A1.7 1.7 0 0 0 7.06 15a1.7 1.7 0 0 0-1.56-1.03H5.4v-3h.1A1.7 1.7 0 0 0 7.06 9.94a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.1-2.1.06.06a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 11.73 4.7v-.1h3v.1a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34L17.7 5.86 19.8 8l-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1.03h.1v3h-.1A1.7 1.7 0 0 0 19.4 15Z"/>
    </>,
    logout: <>
        <path d="M10 17l5-5-5-5M15 12H3M21 19V5a2 2 0 0 0-2-2h-4"/>
    </>,
    inbox: <>
        <path d="M4 4h16v12h-5l-3 3-3-3H4Z"/>
        <path d="M4 12h4l1 2h6l1-2h4"/>
    </>,
    help: <>
        <circle cx="12" cy="12" r="9"/>
        <path d="M9.5 9a2.5 2.5 0 1 1 4.25 1.8c-.9.85-1.75 1.4-1.75 2.7M12 17h.01"/>
    </>,
    rocket: <>
        <path d="M14.5 4.5c2.7-2.2 5.5-2 5.5-2s.2 2.8-2 5.5l-4.5 4.5-4.5-4.5Z"/>
        <path d="m9 9-4 1-2 4 4 1M15 15l-1 4-4 2-1-4M8 16l-3 3"/>
    </>,
    eye: <>
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/>
        <circle cx="12" cy="12" r="2.5"/>
    </>,
};

const Icon = ({name, size = 18, strokeWidth = 1.9, className = '', ...props}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
        {...props}
    >
        {paths[name] || paths.grid}
    </svg>
);

export default Icon;
