import {format, formatDistanceToNow} from 'date-fns';
import Avatar from '../UI/Avatar';
import Badge from '../UI/Badge';
import Icon from '../UI/Icon';

const priorityStyles = {
    high: {variant: 'danger', label: 'High', iconClass: 'text-danger'},
    medium: {variant: 'warning', label: 'Medium', iconClass: 'text-warning'},
    low: {variant: 'success', label: 'Low', iconClass: 'text-success'},
};

const TaskCard = ({task, statusBoards = [], isDragging = false, onOpen, dragHandleProps}) => {
    const priority = priorityStyles[task.priority] || priorityStyles.medium;
    const currentBoard = statusBoards.find((board) => board.name === task.status);
    const commentsCount = task.comments?.length || 0;

    const handleCardClick = () => {
        if (!isDragging) onOpen?.(task);
    };

    return (
        <article
            role={onOpen ? 'button' : undefined}
            tabIndex={onOpen ? 0 : undefined}
            onClick={handleCardClick}
            onKeyDown={(event) => {
                if (onOpen && (event.key === 'Enter' || event.key === ' ')) {
                    event.preventDefault();
                    handleCardClick();
                }
            }}
            className={`group rounded-xl border bg-white p-3.5 shadow-sm transition-all ${onOpen ? 'cursor-pointer hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-card-hover' : ''} ${isDragging ? 'rotate-1 border-primary-300 shadow-card-hover' : task.isOverdue ? 'border-red-200' : 'border-line'}`}
        >
            <div className="mb-3 flex items-start gap-2">
                {dragHandleProps && (
                    <button
                        type="button"
                        ref={dragHandleProps.ref}
                        {...Object.fromEntries(Object.entries(dragHandleProps).filter(([key]) => key !== 'ref'))}
                        onClick={(event) => event.stopPropagation()}
                        className="-ml-1 -mt-1 inline-flex h-7 w-5 shrink-0 cursor-grab items-center justify-center rounded text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-500 active:cursor-grabbing"
                        aria-label={`Drag ${task.title}`}
                    >
                        <Icon name="handle" size={15}/>
                    </button>
                )}
                <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-secondary transition-colors group-hover:text-primary-700">{task.title}</h3>
                    {task.description &&
                        <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-muted">{task.description}</p>}
                </div>
                <button type="button" onClick={(event) => event.stopPropagation()}
                        className="icon-button-sm -mr-1 -mt-1 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                        aria-label={`More options for ${task.title}`}><Icon name="more" size={17}/></button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <Badge variant={priority.variant} size="sm"><Icon name="flag" size={12}
                                                                  className={priority.iconClass}/>{priority.label}
                </Badge>
                {task.isOverdue && <Badge variant="danger" size="sm" dot>Overdue</Badge>}
                {currentBoard && <span className="h-2 w-2 rounded-full" style={{backgroundColor: currentBoard.color}}
                                       aria-label={currentBoard.name}/>}
            </div>

            <div className="mt-3 flex min-h-6 items-center justify-between gap-3 text-xs text-muted">
                <div className={`flex min-w-0 items-center gap-1.5 ${task.isOverdue ? 'font-medium text-danger' : ''}`}>
                    {task.deadline ? <><Icon name="calendar" size={14}/>
                            <span>{task.isOverdue ? `Overdue ${formatDistanceToNow(new Date(task.deadline))}` : format(new Date(task.deadline), 'MMM d')}</span></> :
                        <span/>}
                </div>
                <div className="flex items-center gap-2">
                    {commentsCount > 0 && <span className="flex items-center gap-1"><Icon name="message"
                                                                                          size={14}/>{commentsCount}</span>}
                    {task.assignedTo && <Avatar user={task.assignedTo} size="xs"/>}
                </div>
            </div>
        </article>
    );
};

export default TaskCard;
