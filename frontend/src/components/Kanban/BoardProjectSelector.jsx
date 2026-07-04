import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useProject from '../../hooks/useProject';
import Avatar from '../UI/Avatar';
import Badge from '../UI/Badge';
import Button from '../UI/Button';
import EmptyState from '../UI/EmptyState';
import Icon from '../UI/Icon';
import Loading from '../UI/Loading';

const statusVariants = {
    active: 'success',
    'on-hold': 'warning',
    completed: 'secondary',
    cancelled: 'danger',
};

const getUserId = (value) => value?._id || value || '';

const getStatusLabel = (status) => {
    return status ? status.replace(/-/g, ' ') : 'Active';
};

const BoardProjectSelector = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { projects, fetchProjects } = useProject();

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const canAccessBoard = ['member', 'lead', 'admin'].includes(
        user?.role
    );

    useEffect(() => {
        let isMounted = true;

        const loadProjects = async () => {
            setIsLoading(true);
            setError('');

            try {
                await fetchProjects();
            } catch (requestError) {
                if (isMounted) {
                    setError(
                        requestError?.response?.data?.message ||
                        'Unable to load projects for the Kanban board.'
                    );
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        if (canAccessBoard) {
            loadProjects();
        } else {
            setIsLoading(false);
        }

        return () => {
            isMounted = false;
        };
    }, [canAccessBoard, fetchProjects]);

    const accessibleProjects = useMemo(() => {
        const currentUserId = user?._id;

        if (user?.role === 'admin') {
            return projects || [];
        }

        return (projects || []).filter((project) => {
            const isProjectAdmin =
                getUserId(project.leadId) === currentUserId;

            const isProjectMember = (project.members || []).some(
                (member) => getUserId(member) === currentUserId
            );

            return isProjectAdmin || isProjectMember;
        });
    }, [projects, user]);

    useEffect(() => {
        if (isLoading || accessibleProjects.length !== 1) {
            return;
        }

        navigate(`/board/${accessibleProjects[0]._id}`, {
            replace: true,
        });
    }, [accessibleProjects, isLoading, navigate]);

    if (user && !canAccessBoard) {
        return <Navigate to="/dashboard" replace />;
    }

    if (isLoading) {
        return <Loading fullScreen text="Loading project boards..." />;
    }

    if (error) {
        return (
            <div className="page-container">
                <EmptyState
                    icon="columns"
                    title="Board unavailable"
                    description={error}
                    action={
                        <Button
                            variant="outline"
                            onClick={() => navigate('/projects')}
                            icon={<Icon name="folder" size={17} />}
                        >
                            View projects
                        </Button>
                    }
                />
            </div>
        );
    }

    if (accessibleProjects.length === 0) {
        return (
            <div className="page-container">
                <EmptyState
                    icon="columns"
                    title="No project boards available"
                    description="You are not assigned to any project yet."
                    action={
                        <Button
                            variant="outline"
                            onClick={() => navigate('/projects')}
                            icon={<Icon name="folder" size={17} />}
                        >
                            View projects
                        </Button>
                    }
                />
            </div>
        );
    }

    if (accessibleProjects.length === 1) {
        return <Loading fullScreen text="Opening project board..." />;
    }

    return (
        <div className="page-container space-y-6">
            <header className="border-b border-line pb-5">
                <p className="section-label">Workspace</p>

                <div className="mt-1 flex items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary">
            <Icon name="columns" size={20} />
          </span>

                    <div>
                        <h1 className="page-title">Kanban boards</h1>

                        <p className="page-subtitle">
                            Select a project to manage its workflow and tasks.
                        </p>
                    </div>
                </div>
            </header>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {accessibleProjects.map((project) => {
                    const boardCount = project.statusBoards?.length || 0;
                    const memberCount = project.members?.length || 0;

                    return (
                        <button
                            key={project._id}
                            type="button"
                            onClick={() =>
                                navigate(`/board/${project._id}/`)
                            }
                            className="group rounded-2xl border border-line bg-surface p-5 text-left shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                            <div className="flex items-start justify-between gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary">
                  <Icon name="columns" size={21} />
                </span>

                                <Badge
                                    variant={statusVariants[project.status] || 'success'}
                                    size="sm"
                                    dot
                                >
                                    {getStatusLabel(project.status)}
                                </Badge>
                            </div>

                            <h2 className="mt-5 truncate text-lg font-semibold tracking-[-0.02em] text-secondary transition-colors group-hover:text-primary">
                                {project.name}
                            </h2>

                            <p className="mt-1.5 line-clamp-2 min-h-[40px] text-sm leading-5 text-muted">
                                {project.description || 'No project description added yet.'}
                            </p>

                            <div className="mt-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-surfaceSubtle px-2.5 py-1 text-[11px] font-semibold text-muted">
                  <Icon name="columns" size={13} />
                    {boardCount} {boardCount === 1 ? 'stage' : 'stages'}
                </span>

                                <span className="inline-flex items-center gap-1.5 rounded-full bg-surfaceSubtle px-2.5 py-1 text-[11px] font-semibold text-muted">
                  <Icon name="users" size={13} />
                                    {memberCount} {memberCount === 1 ? 'member' : 'members'}
                </span>
                            </div>

                            <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
                                <div className="flex min-w-0 items-center gap-2">
                                    <Avatar user={project.leadId} size="xs" />

                                    <div className="min-w-0">
                                        <p className="text-[11px] text-muted">
                                            Project admin
                                        </p>

                                        <p className="max-w-[145px] truncate text-xs font-semibold text-secondary">
                                            {project.leadId?.name || 'Unassigned'}
                                        </p>
                                    </div>
                                </div>

                                <span className="flex items-center gap-1 text-xs font-semibold text-primary transition-transform group-hover:translate-x-0.5">
                  Open board
                  <Icon name="arrowRight" size={14} />
                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BoardProjectSelector;