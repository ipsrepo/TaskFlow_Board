const variantClasses = {
    primary: 'bg-primary-100 text-primary-700',
    secondary: 'bg-slate-100 text-slate-600',
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-red-50 text-red-700',
    info: 'bg-blue-50 text-blue-700',
};

const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
};

const Badge = ({children, variant = 'secondary', size = 'md', className = '', dot = false, style}) => (
    <span
        style={style}
        className={`badge-base ${variantClasses[variant] || variantClasses.secondary} ${sizeClasses[size] || sizeClasses.md} ${className}`}
    >
    {dot && <span className="h-1.5 w-1.5 rounded-full bg-current"/>}
        {children}
  </span>
);

export default Badge;
