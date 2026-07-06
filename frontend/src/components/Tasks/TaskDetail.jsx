import {useCallback, useEffect, useMemo, useState} from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import {format, formatDistanceToNow} from 'date-fns';
import useAuth from '../../hooks/useAuth';
import useProject from '../../hooks/useProject';
import useTask from '../../hooks/useTask';
import Alert from '../UI/Alert';
import Avatar from '../UI/Avatar';
import Badge from '../UI/Badge';
import Button from '../UI/Button';
import Card from '../UI/Card';
import EmptyState from '../UI/EmptyState';
import Icon from '../UI/Icon';
import Input from '../UI/Input';
import Loading from '../UI/Loading';
import TaskForm from './TaskForm';

const priorityVariants = {
    high: 'danger',
    medium: 'warning',
    low: 'success',
};

const getId = (value) => {
    if (!value) return '';
    return typeof value === 'string' ? value : value._id || value.id || '';
};

const formatDate = (value, fallback = 'Not set') => {
    if (!value) return fallback;

    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? fallback
        : format(date, 'MMM d, yyyy');
};

const InfoRow = ({label, children, last = false}) => (
    <div
        className={`flex items-center justify-between gap-4 py-3 ${
            last ? 'pb-0' : ''
        }`}
    >
        <dt className="text-sm text-muted">{label}</dt>
        <dd className="min-w-0 text-right">{children}</dd>
    </div>
);

const TaskDetail = () => {
    const {id: taskId} = useParams();
    const navigate = useNavigate();

    const {
        user,
        allUser: users = [],
        getAllUsers,
    } = useAuth();

    const {
        projects = [],
        fetchProjects,
    } = useProject();

    const {
        tasks = [],
        currentTask: task = {},
        fetchTask,
        deleteTask,
        addComment,
        updateTask,
        updateTaskStatus,
    } = useTask();

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [comment, setComment] = useState('');
    const [isCommenting, setIsCommenting] = useState(false);
    const [isStatusSaving, setIsStatusSaving] = useState(false);
    const [isAssigneeSaving, setIsAssigneeSaving] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError('');

        try {
            await Promise.all([
                fetchTask(taskId),
                fetchProjects(),
                getAllUsers(),
            ]);
        } catch (requestError) {
            setError(
                requestError?.response?.data?.message ||
                requestError?.message ||
                'Unable to load this task.'
            );
        } finally {
            setIsLoading(false);
        }
    }, [fetchTask, fetchProjects, getAllUsers, taskId]);

    useEffect(() => {
        loadData();
    }, [loadData]);


    const project = useMemo(() => {
        const currentProjectId = getId(task?.projectId);

        return (
            projects.find(
                (item) => getId(item) === currentProjectId
            ) || null
        );
    }, [projects, task?.projectId]);

    const usersById = useMemo(() => {
        const userMap = new Map();

        [...users, user].filter(Boolean).forEach((candidate) => {
            userMap.set(getId(candidate), candidate);
        });

        return userMap;
    }, [users, user]);

    const projectId = getId(task?.projectId);

    const statusBoards = useMemo(() => {
        return [...(project?.statusBoards || [])].sort(
            (first, second) =>
                (first.order ?? 0) - (second.order ?? 0)
        );
    }, [project?.statusBoards]);

    const projectUsers = useMemo(() => {
        const memberMap = new Map();

        [project?.leadId, ...(project?.members || [])]
            .filter(Boolean)
            .forEach((member) => {
                const memberId = getId(member);

                const memberData =
                    usersById.get(memberId) ||
                    (typeof member === 'object' ? member : null);

                if (memberData) {
                    memberMap.set(memberId, memberData);
                }
            });

        return [...memberMap.values()];
    }, [project?.leadId, project?.members, usersById]);

    const assigneeId = getId(
        task?.assignedTo || task?.assignee || task?.assigneeId
    );

    const assignee = useMemo(() => {
        if (!assigneeId) return null;

        return (
            usersById.get(assigneeId) ||
            (typeof task?.assignedTo === 'object'
                ? task.assignedTo
                : null)
        );
    }, [assigneeId, task?.assignedTo, usersById]);

    const assigneeOptions = useMemo(() => {
        const memberMap = new Map();

        projectUsers.forEach((candidate) => {
            memberMap.set(getId(candidate), candidate);
        });

        if (assignee) {
            memberMap.set(getId(assignee), assignee);
        }

        return [
            {value: '', label: 'Unassigned'},
            ...[...memberMap.values()].map((candidate) => ({
                value: getId(candidate),
                label: candidate.name || candidate.email || 'Team member',
            })),
        ];
    }, [assignee, projectUsers]);

    const comments = useMemo(() => {
        return (task?.comments || [])
            .map((item) => {
                const author = item.userId;

                return author ? {...item, author} : null;
            })
            .filter(Boolean);
    }, [task?.comments, usersById]);

    const projectName =
        project?.name ||
        task?.projectId?.name ||
        'Not available';

    const createdBy =
        usersById.get(getId(task?.createdBy)) ||
        task?.createdBy;

    const deadline = task?.deadline;
    const isOverdue =
        task?.isOverdue ||
        (deadline &&
            task?.status !== 'completed' &&
            new Date(deadline) < new Date());

    const canManageTask =
        user?.role === 'admin' ||
        user?.role === 'lead' ||
        getId(task?.createdBy) === getId(user);

    const changeStatus = async (event) => {
        const status = event.target.value;

        if (!status || status === task?.status) return;

        setIsStatusSaving(true);
        setError('');

        try {
            const response = await updateTaskStatus(taskId, status);

            if (response?.success === false) {
                throw new Error(
                    response.message || 'Unable to update task status.'
                );
            }

            await fetchTask(taskId);
        } catch (requestError) {
            setError(
                requestError?.response?.data?.message ||
                requestError?.message ||
                'Unable to update task status.'
            );
        } finally {
            setIsStatusSaving(false);
        }
    };

    const changeAssignee = async (event) => {
        const assignedTo = event.target.value;

        setIsAssigneeSaving(true);
        setError('');

        try {
            const response = await updateTask(projectId, taskId, {
                assignedTo: assignedTo || null,
            });

            if (response?.success === false) {
                throw new Error(
                    response.message || 'Unable to update assignee.'
                );
            }

            await fetchTask(taskId);
        } catch (requestError) {
            setError(
                requestError?.response?.data?.message ||
                requestError?.message ||
                'Unable to update assignee.'
            );
        } finally {
            setIsAssigneeSaving(false);
        }
    };

    const postComment = async (event) => {
        event.preventDefault();

        const text = comment.trim();

        if (!text) return;

        setIsCommenting(true);
        setError('');

        try {
            const response = await addComment(taskId, text);

            if (response?.success === false) {
                throw new Error(
                    response.message || 'Unable to post comment.'
                );
            }

            setComment('');
            await fetchTask(taskId);
        } catch (requestError) {
            setError(
                requestError?.response?.data?.message ||
                requestError?.message ||
                'Unable to post comment.'
            );
        } finally {
            setIsCommenting(false);
        }
    };

    const removeTask = async () => {
        if (!window.confirm('Delete this task? This action cannot be undone.')) {
            return;
        }

        setError('');

        try {
            const response = await deleteTask(taskId);

            if (response?.success === false) {
                throw new Error(
                    response.message || 'Unable to delete this task.'
                );
            }

            navigate(
                projectId
                    ? `/projects/${projectId}/tasks`
                    : '/my-tasks'
            );
        } catch (requestError) {
            setError(
                requestError?.response?.data?.message ||
                requestError?.message ||
                'Unable to delete this task.'
            );
        }
    };

    if (isLoading) {
        return <Loading fullScreen text="Loading task..."/>;
    }

    if (!task) {
        return (
            <div className="page-container">
                <div className="panel">
                    <EmptyState
                        icon="tasks"
                        title="Task unavailable"
                        description={
                            error || 'This task could not be loaded.'
                        }
                        action={
                            <Link to="/my-tasks">
                                <Button variant="outline">
                                    Back to tasks
                                </Button>
                            </Link>
                        }
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="page-container max-w-7xl space-y-6">
            <header className="border-b border-line pb-5">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0">
                        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted">
                            <Link
                                to={
                                    projectId
                                        ? `/projects/${projectId}/tasks`
                                        : '/my-tasks'
                                }
                                className="inline-flex items-center gap-1.5 font-medium hover:text-primary"
                            >
                                <Icon name="arrowLeft" size={16}/>
                                Tasks
                            </Link>

                            {projectId && (
                                <>
                                    <Icon name="chevronRight" size={15}/>

                                    <Link
                                        to={`/projects/${projectId}`}
                                        className="max-w-[260px] truncate hover:text-primary"
                                    >
                                        {projectName}
                                    </Link>
                                </>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5">
                            <h1 className="max-w-3xl text-2xl font-bold tracking-[-0.035em] text-secondary sm:text-3xl">
                                {task.title}
                            </h1>

                            {task.priority && (
                                <Badge
                                    variant={
                                        priorityVariants[task.priority] || 'secondary'
                                    }
                                    size="sm"
                                    dot
                                >
                                    {task.priority} priority
                                </Badge>
                            )}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted">
              <span className="inline-flex items-center gap-1.5">
                <Icon name="folder" size={15}/>
                  {projectName}
              </span>

                            <span
                                className={`inline-flex items-center gap-1.5 ${
                                    isOverdue ? 'font-semibold text-danger' : ''
                                }`}
                            >
                <Icon name="calendar" size={15}/>
                                {deadline
                                    ? `Due ${formatDate(deadline)}`
                                    : 'No deadline'}
              </span>

                            <span className="inline-flex items-center gap-1.5">
                <Icon name="message" size={15}/>
                                {comments.length}{' '}
                                {comments.length === 1 ? 'comment' : 'comments'}
              </span>
                        </div>
                    </div>

                    {canManageTask && (
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setIsEditOpen(true)}
                                icon={<Icon name="edit" size={16}/>}
                            >
                                Edit
                            </Button>

                            <button
                                type="button"
                                onClick={removeTask}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-danger hover:bg-danger-soft"
                                aria-label="Delete task"
                            >
                                <Icon name="trash" size={17}/>
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {error && (
                <Alert
                    type="error"
                    message={error}
                    onClose={() => setError('')}
                />
            )}

            <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_350px]">
                <main className="space-y-5">
                    <Card className="p-5 sm:p-6">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <p className="section-label">Task overview</p>
                                <h2 className="section-title mt-1">Description</h2>
                            </div>

                            <Icon name="tasks" size={18} className="text-muted"/>
                        </div>

                        <p
                            className={`whitespace-pre-wrap text-sm leading-7 ${
                                task.description
                                    ? 'text-secondary'
                                    : 'italic text-muted'
                            }`}
                        >
                            {task.description || 'No description has been added.'}
                        </p>
                    </Card>

                    <Card className="p-5 sm:p-6">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <p className="section-label">Discussion</p>
                                <h2 className="section-title mt-1">
                                    Comments
                                    {comments.length ? ` (${comments.length})` : ''}
                                </h2>
                            </div>

                            <Icon name="message" size={18} className="text-muted"/>
                        </div>

                        <div className="space-y-4">
                            {comments.length ? (
                                comments.map((item) => (
                                    <article
                                        key={item._id}
                                        className="flex gap-3"
                                    >
                                        <Avatar user={item.author} size="sm"/>

                                        <div className="min-w-0 flex-1 rounded-xl bg-surfaceSubtle px-3.5 py-3">
                                            <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-secondary">
                          {item.author.name || item.author.email}
                        </span>

                                                <span className="text-xs text-muted">
                          {item.createdAt
                              ? formatDistanceToNow(
                                  new Date(item.createdAt),
                                  {addSuffix: true}
                              )
                              : ''}
                        </span>
                                            </div>

                                            <p className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-secondary">
                                                {item.text}
                                            </p>
                                        </div>
                                    </article>
                                ))
                            ) : (
                                <EmptyState
                                    icon="message"
                                    title="No comments yet"
                                    description="Start the conversation with your project team."
                                />
                            )}
                        </div>

                        <form
                            onSubmit={postComment}
                            className="mt-6 border-t border-line pt-5"
                        >
                            <Input
                                type="textarea"
                                value={comment}
                                onChange={(event) => setComment(event.target.value)}
                                placeholder="Write a comment..."
                                rows={3}
                            />

                            <div className="mt-3 flex justify-end">
                                <Button
                                    type="submit"
                                    loading={isCommenting}
                                    disabled={!comment.trim()}
                                    icon={<Icon name="message" size={16}/>}
                                >
                                    Post comment
                                </Button>
                            </div>
                        </form>
                    </Card>
                </main>

                <aside>
                    <Card className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="section-label">Task details</p>
                                <h2 className="section-title mt-1">Information</h2>
                            </div>

                            <Icon name="target" size={18} className="text-muted"/>
                        </div>

                        <dl className="mt-5 divide-y divide-line">
                            <InfoRow label="Project">
                                {projectId ? (
                                    <Link
                                        to={`/projects/${projectId}`}
                                        className="inline-flex max-w-[175px] items-center gap-1.5 truncate text-sm font-semibold text-primary hover:underline"
                                    >
                                        <Icon name="folder" size={14}/>
                                        <span className="truncate">{projectName}</span>
                                    </Link>
                                ) : (
                                    <span className="text-sm text-muted">
                    Not available
                  </span>
                                )}
                            </InfoRow>

                            <InfoRow label="Status">
                                {statusBoards.length ? (
                                    <select
                                        value={task.status || ''}
                                        onChange={changeStatus}
                                        disabled={isStatusSaving}
                                        className="h-9 w-[175px] rounded-lg border border-line bg-surface px-3 text-xs font-semibold text-secondary outline-none focus:border-primary disabled:opacity-60"
                                    >
                                        {statusBoards.map((board) => (
                                            <option key={board.name} value={board.name}>
                                                {board.name}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <span className="text-sm font-semibold text-secondary">
                    {task.status || 'Not set'}
                  </span>
                                )}
                            </InfoRow>

                            <InfoRow label="Assignee">
                                <select
                                    value={assigneeId}
                                    onChange={changeAssignee}
                                    disabled={isAssigneeSaving}
                                    className="h-9 w-[175px] rounded-lg border border-line bg-surface px-3 text-xs font-semibold text-secondary outline-none focus:border-primary disabled:opacity-60"
                                >
                                    {assigneeOptions.map((option) => (
                                        <option
                                            key={option.value || 'unassigned'}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </InfoRow>

                            <InfoRow label="Priority">
                                <Badge
                                    variant={
                                        priorityVariants[task.priority] || 'secondary'
                                    }
                                    size="sm"
                                    dot
                                >
                                    {task.priority || 'Not set'}
                                </Badge>
                            </InfoRow>

                            <InfoRow label="Due date">
                <span
                    className={`text-sm font-semibold ${
                        isOverdue ? 'text-danger' : 'text-secondary'
                    }`}
                >
                  {formatDate(deadline)}
                </span>
                            </InfoRow>

                            <InfoRow label="Created by">
                <span className="max-w-[180px] truncate text-sm font-semibold text-secondary">
                  {createdBy?.name ||
                      createdBy?.email ||
                      'Unknown'}
                </span>
                            </InfoRow>

                            <InfoRow label="Created" last>
                <span className="text-sm font-semibold text-secondary">
                  {formatDate(task.createdAt)}
                </span>
                            </InfoRow>
                        </dl>
                    </Card>
                </aside>
            </section>

            {isEditOpen && (
                <TaskForm
                    task={task}
                    statusBoards={statusBoards}
                    onClose={() => setIsEditOpen(false)}
                    onSuccess={() => {
                        setIsEditOpen(false);
                        loadData();
                    }}
                />
            )}
        </div>
    );
};

export default TaskDetail;