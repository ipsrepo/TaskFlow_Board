import Card from './Card';
import Icon from './Icon';

const toneClasses = {
    primary: 'bg-primary-50 text-primary-700',
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-red-50 text-red-700',
    info: 'bg-blue-50 text-blue-700',
    neutral: 'bg-slate-100 text-slate-700',
};

const StatCard = ({label, value, icon = 'chart', tone = 'primary', detail}) => (
    <Card className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
            <div><p className="text-2xl font-bold tracking-[-0.04em] text-secondary">{value}</p><p
                className="mt-1 text-sm font-medium text-muted">{label}</p>{detail &&
                <p className="mt-2 text-xs text-muted">{detail}</p>}</div>
            <span
                className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${toneClasses[tone] || toneClasses.primary}`}><Icon
                name={icon} size={19}/></span>
        </div>
    </Card>
);

export default StatCard;
