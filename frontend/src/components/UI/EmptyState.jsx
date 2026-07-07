import Icon from './Icon';

const EmptyState = ({title = 'Nothing here yet', description, icon = 'folder', action, className = ''}) => (
    <div className={`flex min-h-[260px] flex-col items-center justify-center px-6 py-12 text-center ${className}`}>
    <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
      {typeof icon === 'string' ? <Icon name={icon} size={23}/> : icon}
    </span>
        <h3 className="text-base font-semibold text-secondary">{title}</h3>
        {description && <p className="mt-1.5 max-w-sm text-sm leading-6 text-muted">{description}</p>}
        {action && <div className="mt-5">{action}</div>}
    </div>
);

export default EmptyState;
