import Icon from './Icon';

const Select = ({
                    id,
                    label,
                    options = [],
                    value,
                    onChange,
                    error,
                    required = false,
                    name,
                    disabled = false,
                    className = '',
                    selectClassName = '',
                    placeholder = 'Select...',
                    multiple = false,
                }) => {
    const selectId = id || name;

    return (
        <div className={`min-w-0 ${className}`}>
            {label && (
                <label htmlFor={selectId} className="field-label">
                    {label}
                    {required && <span className="ml-1 text-danger">*</span>}
                </label>
            )}
            <div className="relative">
                <select
                    id={selectId}
                    name={name}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    required={required}
                    multiple={multiple}
                    className={`select-base ${error ? 'input-error' : ''} ${multiple ? 'h-auto min-h-[120px] py-2 pr-3' : ''} ${selectClassName}`}
                >
                    {!multiple && <option value="">{placeholder}</option>}
                    {options.map((option) => (
                        <option key={option.value ?? option} value={option.value ?? option}>
                            {option.label ?? option}
                        </option>
                    ))}
                </select>
                {!multiple && (
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
            <Icon name="chevronDown" size={16}/>
          </span>
                )}
            </div>
            {error && <p className="mt-1.5 text-xs font-medium text-danger">{error}</p>}
        </div>
    );
};

export default Select;
