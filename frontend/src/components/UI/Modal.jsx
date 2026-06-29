import { useEffect } from 'react';
import Icon from './Icon';

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
};

const Modal = ({ isOpen, onClose, title, subtitle, children, size = 'md', hideClose = false }) => {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', onKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-secondary/35 backdrop-blur-sm"
        aria-label="Close modal"
      />
      <section className={`relative flex max-h-[calc(100vh-32px)] w-full flex-col overflow-hidden rounded-3xl border border-white/70 bg-white shadow-modal animate-scale-in ${sizeClasses[size] || sizeClasses.md}`}>
        {(title || !hideClose) && (
          <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
            <div>
              {title && <h2 className="text-lg font-semibold text-secondary">{title}</h2>}
              {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
            </div>
            {!hideClose && (
              <button type="button" onClick={onClose} className="icon-button-sm -mr-1" aria-label="Close modal">
                <Icon name="x" size={18} />
              </button>
            )}
          </header>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto custom-scrollbar">{children}</div>
      </section>
    </div>
  );
};

export default Modal;
