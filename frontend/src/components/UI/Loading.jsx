const Loading = ({ size = 'md', color = 'primary', fullScreen = false, text = '' }) => {
  const sizeClass = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-11 w-11' }[size] || 'h-8 w-8';
  const colorClass = { primary: 'border-primary', white: 'border-white', secondary: 'border-secondary' }[color] || 'border-primary';

  const content = (
    <div className="flex flex-col items-center gap-3">
      <span className={`${sizeClass} animate-spin rounded-full border-2 border-slate-200 ${colorClass} border-t-transparent`} />
      {text && <p className="text-sm text-muted">{text}</p>}
    </div>
  );

  return fullScreen ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">{content}</div> : content;
};

export const Skeleton = ({ className = '' }) => <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />;

export const CardSkeleton = () => (
  <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
    <Skeleton className="h-4 w-2/3" />
    <Skeleton className="mt-4 h-3 w-full" />
    <Skeleton className="mt-2 h-3 w-4/5" />
    <div className="mt-5 flex gap-2"><Skeleton className="h-6 w-16 rounded-full" /><Skeleton className="h-6 w-20 rounded-full" /></div>
  </div>
);

export default Loading;
