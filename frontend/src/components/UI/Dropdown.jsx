import { useEffect, useRef, useState } from 'react';

const Dropdown = ({ trigger, items = [], className = '', align = 'right' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div onClick={() => setIsOpen((previous) => !previous)}>{trigger}</div>
      {isOpen && (
        <div className={`absolute z-40 mt-2 w-52 overflow-hidden rounded-xl border border-line bg-white p-1 shadow-card-hover animate-scale-in ${align === 'left' ? 'left-0' : 'right-0'}`}>
          {items.map((item, index) => (
            item.divider ? (
              <div key={`divider-${index}`} className="my-1 border-t border-line" />
            ) : (
              <button
                key={item.label || index}
                type="button"
                onClick={() => {
                  item.onClick?.();
                  setIsOpen(false);
                }}
                disabled={item.disabled}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${item.danger ? 'text-danger hover:bg-red-50' : 'text-secondary hover:bg-slate-50'}`}
              >
                {item.icon && <span className="text-muted">{item.icon}</span>}
                {item.label}
              </button>
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
