import {useEffect, useMemo, useState} from 'react';
import {Link} from 'react-router-dom';
import {formatDistanceToNow} from 'date-fns';
import useAuth from '../../hooks/useAuth';
import useProject from '../../hooks/useProject';
import useTask from '../../hooks/useTask';
import Badge from '../UI/Badge';
import Card from '../UI/Card';
import EmptyState from '../UI/EmptyState';
import Icon from '../UI/Icon';
import {CardSkeleton} from '../UI/Loading';
import StatCard from '../UI/StatCard';

const priorityVariants = {
    high: 'danger',
    medium: 'warning',
    low: 'success',
};

const getUserId = (value) => value?._id || value || '';

const LeadDashboard = () => {
    const {user} = useAuth();
    const {getMyTasks} = useTask();
    const {fetchProjects, projects} = useProject();

    const [myTasks, setMyTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadDashboard = async () => {
            setIsLoading(true);

            try {
                const [taskResponse] = await Promise.all([
                    getMyTasks(),
                    fetchProjects(),
                ]);

                if (taskResponse?.success) {
                    setMyTasks(
                        taskResponse.tasks ||
                        taskResponse.data?.tasks ||
                        []
                    );
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboard();
    }, [fetchProjects, getMyTasks]);

    const leadProjects = useMemo(() => {
        return (projects || []).filter((project) => {
            return getUserId(project?.leadId) === user?._id;
        });
    }, [projects, user?._id]);

    const memberProjects = useMemo(() => {
        return (projects || []).filter((project) => {
            const isProjectLead =
                getUserId(project?.leadId) === user?._id;

            const isProjectMember = (project?.members || []).some(
                (member) => getUserId(member) === user?._id
            );

            return !isProjectLead && isProjectMember;
        });
    }, [projects, user?._id]);

    const activeTasks = useMemo(() => {
        return myTasks.filter((task) => task.status !== 'completed');
    }, [myTasks]);

    const inProgressTasks = useMemo(() => {
        return myTasks.filter(
            (task) =>
                task.status?.toLowerCase() === 'in-progress' ||
                task.status?.toLowerCase() === 'in progress'
        );
    }, [myTasks]);

    const completedTasks = useMemo(() => {
        return myTasks.filter((task) => task.status === 'completed');
    }, [myTasks]);

    const overdueTasks = useMemo(() => {
        return activeTasks.filter((task) => task.isOverdue);
    }, [activeTasks]);

    return (
        <div className="page-container space-y-7">
            <header className="border-b border-line pb-5">
                <p className="section-label">Lead workspace</p>

                <h1 className="page-title mt-1">
                    Welcome back, {user?.name?.split(' ')[0] || 'there'}
                </h1>

                <p className="page-subtitle">
                    Track your work, project ownership, and team delivery.
                </p>
            </header>

            {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    {Array.from({length: 5}, (_, index) => (
                        <CardSkeleton key={index}/>
                    ))}
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    <StatCard
                        label="Lead projects"
                        value={leadProjects.length}
                        icon="folder"
                        tone="primary"
                    />

                    <StatCard
                        label="Active tasks"
                        value={activeTasks.length}
                        icon="tasks"
                        tone="primary"
                    />

                    <StatCard
                        label="In progress"
                        value={inProgressTasks.length}
                        icon="target"
                        tone="warning"
                    />

                    <StatCard
                        label="Overdue"
                        value={overdueTasks.length}
                        icon="flag"
                        tone="danger"
                    />

                    <StatCard
                        label="Completed"
                        value={completedTasks.length}
                        icon="check"
                        tone="success"
                    />
                </div>
            )}

            <section>
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <p className="section-label">Task focus</p>
                        <h2 className="section-title mt-1">Your active tasks</h2>
                    </div>

                    <Link
                        to="/my-tasks"
                        className="inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:underline"
                    >
                        View all
                        <Icon name="arrowRight" size={16}/>
                    </Link>
                </div>

                {isLoading ? (
                    <div className="space-y-3">
                        {Array.from({length: 3}, (_, index) => (
                            <CardSkeleton key={index}/>
                        ))}
                    </div>
                ) : activeTasks.length ? (
                    <Card className="overflow-hidden p-0">
                        <div className="divide-y divide-line">
                            {activeTasks.slice(0, 5).map((task) => (
                                <Link
                                    key={task._id}
                                    to={`/tasks/${task._id}`}
                                    className="data-row flex items-center gap-3 px-5 py-4"
                                >
                  <span
                      className={`h-2 w-2 shrink-0 rounded-full ${
                          task.priority === 'high'
                              ? 'bg-danger'
                              : task.priority === 'medium'
                                  ? 'bg-warning'
                                  : 'bg-success'
                      }`}
                  />

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-secondary hover:text-primary-700">
                                            {task.title}
                                        </p>

                                        <p className="mt-1 truncate text-xs text-muted">
                                            {task.projectId?.name || 'Project task'}
                                        </p>
                                    </div>

                                    <Badge
                                        variant={
                                            priorityVariants[task.priority] || 'secondary'
                                        }
                                        size="sm"
                                    >
                                        {task.priority}
                                    </Badge>

                                    <span
                                        className={`hidden text-xs sm:block ${
                                            task.isOverdue
                                                ? 'font-semibold text-danger'
                                                : 'text-muted'
                                        }`}
                                    >
                    {task.deadline
                        ? task.isOverdue
                            ? 'Overdue'
                            : `Due ${formatDistanceToNow(
                                new Date(task.deadline),
                                {addSuffix: true}
                            )}`
                        : 'No due date'}
                  </span>
                                </Link>
                            ))}
                        </div>
                    </Card>
                ) : (
                    <div className="panel">
                        <EmptyState
                            title="No active tasks"
                            description="You have no active tasks assigned right now."
                            icon="check"
                        />
                    </div>
                )}
            </section>

            <section>
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <p className="section-label">Project ownership</p>
                        <h2 className="section-title mt-1">Projects you lead</h2>
                    </div>

                    <Link
                        to="/projects"
                        className="inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:underline"
                    >
                        All projects
                        <Icon name="arrowRight" size={16}/>
                    </Link>
                </div>

                {isLoading ? (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {Array.from({length: 3}, (_, index) => (
                            <CardSkeleton key={index}/>
                        ))}
                    </div>
                ) : leadProjects.length ? (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {leadProjects.slice(0, 6).map((project) => (
                            <Link
                                key={project._id}
                                to={`/projects/${project._id}`}
                            >
                                <Card hover className="h-full p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <h3 className="min-w-0 truncate text-sm font-semibold text-secondary">
                                            {project.name}
                                        </h3>

                                        <Badge
                                            variant={
                                                project.status === 'active'
                                                    ? 'success'
                                                    : 'secondary'
                                            }
                                            size="sm"
                                        >
                                            {project.status}
                                        </Badge>
                                    </div>

                                    <p className="mt-2 line-clamp-2 text-sm leading-5 text-muted">
                                        {project.description || 'No description yet.'}
                                    </p>

                                    <div className="mt-4 flex items-center justify-between text-xs text-muted">
                    <span className="inline-flex items-center gap-1.5">
                      <Icon name="users" size={14}/>
                        {project.members?.length || 0} members
                    </span>

                                        <span className="inline-flex items-center gap-1">
                      <Icon name="target" size={14}/>
                      Lead
                    </span>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="panel">
                        <EmptyState
                            title="No lead projects"
                            description="Projects where you are assigned as project lead will appear here."
                            icon="folder"
                        />
                    </div>
                )}
            </section>

            <section>
                <div className="mb-4">
                    <p className="section-label">Collaboration</p>
                    <h2 className="section-title mt-1">
                        Projects you are a member of
                    </h2>
                </div>

                {isLoading ? (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {Array.from({length: 3}, (_, index) => (
                            <CardSkeleton key={index}/>
                        ))}
                    </div>
                ) : memberProjects.length ? (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {memberProjects.slice(0, 6).map((project) => (
                            <Link
                                key={project._id}
                                to={`/projects/${project._id}`}
                            >
                                <Card hover className="h-full p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <h3 className="min-w-0 truncate text-sm font-semibold text-secondary">
                                            {project.name}
                                        </h3>

                                        <Badge
                                            variant={
                                                project.status === 'active'
                                                    ? 'success'
                                                    : 'secondary'
                                            }
                                            size="sm"
                                        >
                                            {project.status}
                                        </Badge>
                                    </div>

                                    <p className="mt-2 line-clamp-2 text-sm leading-5 text-muted">
                                        {project.description || 'No description yet.'}
                                    </p>

                                    <div className="mt-4 flex items-center gap-1.5 text-xs text-muted">
                                        <Icon name="users" size={14}/>
                                        {project.members?.length || 0} members
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="panel">
                        <EmptyState
                            title="No member projects"
                            description="Projects where you collaborate as a member will appear here."
                            icon="folder"
                        />
                    </div>
                )}
            </section>
        </div>
    );
};

export default LeadDashboard;