import {useEffect} from 'react';
import Icon from './Icon';

const typeConfig = {
    success: {surface: 'border-emerald-200 bg-emerald-50 text-emerald-800', icon: 'check'},
    error: {surface: 'border-red-200 bg-red-50 text-red-800', icon: 'x'},
    warning: {surface: 'border-amber-200 bg-amber-50 text-amber-800', icon: 'flag'},
    info: {surface: 'border-blue-200 bg-blue-50 text-blue-800', icon: 'target'},
};

const Alert = ({message, type = 'info', onClose, autoClose}) => {
    const config = typeConfig[type] || typeConfig.info;

    useEffect(() => {
        if (!autoClose || !onClose) return undefined;
        const timer = window.setTimeout(onClose, autoClose);
        return () => window.clearTimeout(timer);
    }, [autoClose, onClose]);

    if (!message) return null;

    return (
        <div
            className={`flex items-start gap-3 rounded-xl border px-3.5 py-3 text-sm animate-fade-in ${config.surface}`}
            role="alert">
            <Icon name={config.icon} size={18} className="mt-0.5 shrink-0"/>
            <p className="flex-1 leading-5">{message}</p>
            {onClose && (
                <button type="button" onClick={onClose}
                        className="-mr-1 shrink-0 rounded-md p-0.5 opacity-70 transition-opacity hover:opacity-100"
                        aria-label="Dismiss alert">
                    <Icon name="x" size={16}/>
                </button>
            )}
        </div>
    );
};

export const Toast = ({toasts, removeToast}) => (
    <div className="fixed bottom-5 right-5 z-50 flex w-[min(22rem,calc(100vw-2.5rem))] flex-col gap-2">
        {toasts.map((toast) => (
            <Alert key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)}
                   autoClose={4000}/>
        ))}
    </div>
);

export default Alert;
