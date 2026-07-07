import Icon from './Icon';

const Input = ({
                   id,
                   label,
                   error,
                   value,
                   onChange,
                   placeholder,
                   required = false,
                   type = 'text',
                   name,
                   disabled = false,
                   className = '',
                   inputClassName = '',
                   helpText,
                   rows = 4,
                   min,
                   max,
                   autoComplete,
                   icon,
                   rightElement,
                   onKeyDown,
               }) => {
    const inputId = id || name;
    const borderClass = error ? 'input-error' : '';

    return (
        <div className={`min-w-0 ${className}`}>
            {label && (
                <label htmlFor={inputId} className="field-label">
                    {label}
                    {required && <span className="ml-1 text-danger">*</span>}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
            {typeof icon === 'string' ? <Icon name={icon} size={17}/> : icon}
          </span>
                )}
                {type === 'textarea' ? (
                    <textarea
                        id={inputId}
                        name={name}
                        value={value}
                        onChange={onChange}
                        onKeyDown={onKeyDown}
                        placeholder={placeholder}
                        disabled={disabled}
                        required={required}
                        rows={rows}
                        className={`textarea-base ${borderClass} ${inputClassName}`}
                    />
                ) : (
                    <input
                        id={inputId}
                        type={type}
                        name={name}
                        value={value}
                        onChange={onChange}
                        onKeyDown={onKeyDown}
                        placeholder={placeholder}
                        disabled={disabled}
                        required={required}
                        min={min}
                        max={max}
                        autoComplete={autoComplete}
                        className={`input-base ${borderClass} ${icon ? 'pl-10' : ''} ${rightElement ? 'pr-10' : ''} ${inputClassName}`}
                    />
                )}
                {rightElement && <span className="absolute inset-y-0 right-2 flex items-center">{rightElement}</span>}
            </div>
            {error && <p className="mt-1.5 text-xs font-medium text-danger">{error}</p>}
            {helpText && !error && <p className="field-help">{helpText}</p>}
        </div>
    );
};

export default Input;
