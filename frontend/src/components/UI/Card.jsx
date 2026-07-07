const Card = ({children, className = '', hover = false, shadow = 'md', onClick, as: Component = 'div'}) => {
    const shadowClass = {
        sm: 'shadow-sm',
        md: 'shadow-card',
        lg: 'shadow-card-hover',
        none: '',
    }[shadow] || 'shadow-card';

    return (
        <Component
            onClick={onClick}
            className={`rounded-2xl border border-line bg-surface ${shadowClass} ${hover ? 'cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover' : ''} ${className}`}
        >
            {children}
        </Component>
    );
};

export default Card;
