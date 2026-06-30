import {Link} from 'react-router-dom';
import {format} from 'date-fns';
import Avatar from '../UI/Avatar';
import Badge from '../UI/Badge';
import Card from '../UI/Card';
import Icon from '../UI/Icon';

const statusVariants = {
    active: 'success',
    'on-hold': 'warning',
    completed: 'secondary',
    cancelled: 'danger',
};

const statusStyles = {
    active: {
        accent: 'from-primary-800 via-primary to-primary-400',
        icon: 'bg-primary-50 text-primary',
    },
    'on-hold': {
        accent: 'from-warning-hover to-warning',
        icon: 'bg-warning-soft text-warning-text',
    },
    completed: {
        accent: 'from-success-hover to-success',
        icon: 'bg-success-soft text-success-text',
    },
    cancelled: {
        accent: 'from-danger-hover to-danger',
        icon: 'bg-danger-soft text-danger-text',
    },
};

const getStatusLabel = (status) => {
    return status ? status.replace(/-/g, ' ') : 'Active';
};

const ProjectCard = ({project}) => {
    const boards = [...(project.statusBoards || [])].sort(
        (first, second) => (first.order ?? 0) - (second.order ?? 0)
    );

    const style = statusStyles[project.status] || statusStyles.active;
    const visibleBoards = boards.slice(0, 3);
    const remainingBoardCount = Math.max(boards.length - 3, 0);
    const memberCount = project.members?.length || 0;

    return (
        <article className="group">
            <Card
                hover
                className="relative flex h-full min-h-[272px] overflow-hidden border border-line bg-surface p-0"
            >
                <div
                    className={`absolute left-0 top-0 h-1.5 w-2/5 bg-gradient-to-r ${style.accent}`}
                />

                <Link
                    to={`/projects/${project._id}`}
                    className="flex flex-1 flex-col p-5 pt-4 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
                    aria-label={`Open ${project.name} project`}
                >
                    <div className="flex items-center justify-end">
                        <Badge
                            variant={statusVariants[project.status] || 'success'}
                            size="sm"
                            dot
                        >
                            {getStatusLabel(project.status)}
                        </Badge>
                    </div>

                    <div className="mt-3 flex items-start gap-3">
                        <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${style.icon}`}
                            style={{
                                boxShadow: `inset 0 0 0 1px ${
                                    boards[0]?.color || 'rgba(0, 82, 204, 0.10)'
                                }`,
                            }}
                        >
                            <Icon name="folder" size={20}/>
                        </div>

                        <div className="min-w-0 pt-0.5">
                            <h2 className="truncate text-xl font-semibold tracking-[-0.03em] text-secondary transition-colors group-hover:text-primary">
                                {project.name}
                            </h2>

                            <p className="mt-1 line-clamp-2 min-h-[40px] text-sm leading-5 text-muted">
                                {project.description || 'No project description added yet.'}
                            </p>
                        </div>
                    </div>

                    <div className="mt-5">
                        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
                            Workflow
                        </p>

                        <div className="flex min-h-8 flex-wrap gap-1.5">
                            {visibleBoards.length > 0 ? (
                                visibleBoards.map((board) => (
                                    <span
                                        key={board.name}
                                        className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surfaceSubtle px-2.5 py-1 text-[11px] font-semibold text-secondary"
                                    >
                    <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{backgroundColor: board.color}}
                    />
                                        {board.name}
                  </span>
                                ))
                            ) : (
                                <span className="text-xs text-muted">
                  No workflow configured
                </span>
                            )}

                            {remainingBoardCount > 0 && (
                                <span
                                    className="inline-flex items-center rounded-full border border-line bg-surfaceSubtle px-2.5 py-1 text-[11px] font-semibold text-muted">
                  +{remainingBoardCount} more
                </span>
                            )}
                        </div>
                    </div>

                    <div className="mt-auto pt-5">
                        <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
                            <div className="flex min-w-0 items-center gap-2">
                                <Avatar user={project.leadId} size="xs"/>

                                <div className="min-w-0">
                                    <p className="text-[11px] text-muted">Project admin</p>
                                    <p className="max-w-[125px] truncate text-xs font-semibold text-secondary">
                                        {project.leadId?.name || 'Unassigned'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-muted">
                                <Icon
                                    name={project.endDate ? 'calendar' : 'users'}
                                    size={14}
                                />

                                <span>
                  {project.endDate
                      ? format(new Date(project.endDate), 'MMM d')
                      : `${memberCount} ${
                          memberCount === 1 ? 'member' : 'members'
                      }`}
                </span>
                            </div>
                        </div>

                        <div
                            className="mt-3 flex items-center justify-end gap-1 text-xs font-semibold text-primary opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100 group-focus-within:translate-x-0.5 group-focus-within:opacity-100">
                            Open project
                            <Icon name="arrowRight" size={14}/>
                        </div>
                    </div>
                </Link>
            </Card>
        </article>
    );
};

export default ProjectCard;