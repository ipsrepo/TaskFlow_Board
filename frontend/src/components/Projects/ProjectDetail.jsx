import {useCallback, useEffect, useMemo, useState} from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import {format} from 'date-fns';
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
import Modal from '../UI/Modal';
import ProjectForm from './ProjectForm';
import StatusBoardManager from '../Kanban/StatusBoardManager.jsx';
import {ADMIN, LEAD} from "../Common/constants.js";

const statusVariants = {
    active: 'success',
    'on-hold': 'warning',
    completed: 'secondary',
    cancelled: 'danger',
};

const getProject = (response) => {
    return (
        response?.project ||
        response?.data?.project ||
        response?.data?.data?.project ||
        response?.data ||
        response
    );
};

const getUserId = (value) => value?._id || value || '';

const getTaskDeadline = (task) => {
    return task?.dueDate || task?.deadline || task?.endDate || null;
};

const displayDate = (dateValue, fallback = 'Not set') => {
    if (!dateValue) {
        return fallback;
    }

    const parsedDate = new Date(dateValue);

    if (Number.isNaN(parsedDate.getTime())) {
        return fallback;
    }

    return format(parsedDate, 'MMM d, yyyy');
};

const getStatusLabel = (status) => {
    return status ? status.replace(/-/g, ' ') : 'Active';
};

const getDateTimestamp = (dateValue) => {
    if (!dateValue) {
        return Number.MAX_SAFE_INTEGER;
    }

    const timestamp = new Date(dateValue).getTime();

    return Number.isNaN(timestamp)
        ? Number.MAX_SAFE_INTEGER
        : timestamp;
};

const getTasksFromKanban = (kanban) => {
    return Object.values(kanban || []).flatMap(
        (column) => column?.tasks || []
    );
};

const mergeTasks = (projectTasks, boardTasks) => {
    const taskMap = new Map();

    [...(projectTasks || []), ...(boardTasks || [])].forEach((task) => {
        if (task?._id) {
            taskMap.set(task._id, task);
        }
    });

    return [...taskMap.values()];
};

const ProjectTaskList = ({
                             projectId,
                             tasks,
                             statusBoards,
                         }) => {
    const visibleTasks = tasks.slice(0, 8);

    return (
        <Card className="overflow-hidden p-0">
            <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
                <div>
                    <p className="section-label">Project work</p>

                    <div className="mt-1 flex items-center gap-2">
                        <h2 className="section-title">Tasks</h2>

                        <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-semibold text-primary">
              {tasks.length}
            </span>
                    </div>
                </div>

                <Link
                    to={`/projects/${projectId}/tasks`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary-700 hover:underline"
                >
                    View all
                    <Icon name="arrowRight" size={14}/>
                </Link>
            </div>

            {visibleTasks.length > 0 ? (
                <>
                    <div
                        className="hidden grid-cols-[minmax(0,1fr)_145px_125px_145px] gap-4 border-b border-line bg-surfaceSubtle px-5 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-muted lg:grid sm:px-6">
                        <span>Task</span>
                        <span>Assignee</span>
                        <span>Deadline</span>
                        <span>Current status</span>
                    </div>

                    <div className="divide-y divide-line">
                        {visibleTasks.map((task) => {
                            const deadline = getTaskDeadline(task);

                            const assignee =
                                task.assignee ||
                                task.assignedTo ||
                                task.assigneeId ||
                                null;

                            const statusBoard = statusBoards.find(
                                (board) => board.name === task.status
                            );

                            return (
                                <Link
                                    key={task._id}
                                    to={`/tasks/${task._id}`}
                                    className="grid gap-3 px-5 py-4 transition-colors hover:bg-surfaceSubtle lg:grid-cols-[minmax(0,1fr)_145px_125px_145px] lg:items-center lg:gap-4 sm:px-6"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-secondary">
                                            {task.title}
                                        </p>

                                        {task.description && (
                                            <p className="mt-1 line-clamp-1 text-xs text-muted">
                                                {task.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex min-w-0 items-center gap-2">
                                        <Avatar user={assignee} size="xs"/>

                                        <span className="truncate text-xs font-medium text-secondary">
                      {assignee?.name ||
                          task.assigneeName ||
                          'Unassigned'}
                    </span>
                                    </div>

                                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted">
                                        <Icon name="calendar" size={13}/>

                                        <span>
                      {deadline
                          ? displayDate(deadline)
                          : 'No deadline'}
                    </span>
                                    </div>

                                    <div className="flex min-w-0 items-center gap-2">
                    <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{
                            backgroundColor:
                                statusBoard?.color || '#7A869A',
                        }}
                    />

                                        <span className="truncate text-xs font-semibold text-secondary">
                      {task.status || 'No status'}
                    </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </>
            ) : (
                <div className="px-5 py-12 text-center sm:px-6">
          <span
              className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary">
            <Icon name="tasks" size={19}/>
          </span>

                    <p className="mt-3 text-sm font-semibold text-secondary">
                        No tasks yet
                    </p>

                    <p className="mt-1 text-sm text-muted">
                        Tasks created for this project will appear here.
                    </p>
                </div>
            )}
        </Card>
    );
};

const ProjectDetail = () => {
    const {id: projectId} = useParams();
    const navigate = useNavigate();

    const {
        allUsers: users = [],
        user,
        getAllUsers,
    } = useAuth();

    const {
        fetchProject,
        deleteProject,
        addMember,
        removeMember,
    } = useProject();

    const {fetchKanban} = useTask();

    const [project, setProject] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isBoardManagerOpen, setIsBoardManagerOpen] =
        useState(false);
    const [isMemberModalOpen, setIsMemberModalOpen] =
        useState(false);
    const [memberSearchTerm, setMemberSearchTerm] = useState('');
    const [addingMemberId, setAddingMemberId] = useState('');

    const updateProjectState = (response) => {
        const updatedProject = getProject(response);

        if (!updatedProject?._id) {
            return;
        }

        setProject((currentProject) => ({
            ...currentProject,
            ...updatedProject,
            tasks: updatedProject.tasks || currentProject?.tasks || [],
            statusBoards:
                updatedProject.statusBoards ||
                currentProject?.statusBoards ||
                [],
        }));
    };

    const loadProject = useCallback(async () => {
        setIsLoading(true);
        setError('');

        try {
            const [projectResult, kanbanResult] = await Promise.allSettled([
                fetchProject(projectId),
                fetchKanban(projectId),
            ]);

            const projectResponse =
                projectResult.status === 'fulfilled'
                    ? projectResult.value
                    : null;

            const kanbanResponse =
                kanbanResult.status === 'fulfilled'
                    ? kanbanResult.value
                    : null;

            const loadedProject = getProject(projectResponse);

            if (!loadedProject?._id) {
                setProject(null);
                setError('Project not found or access is restricted.');
                return;
            }

            const orderedStatusBoards = [
                ...(kanbanResponse?.statusBoards ||
                    loadedProject.statusBoards ||
                    []),
            ].sort(
                (first, second) =>
                    (first.order ?? 0) - (second.order ?? 0)
            );

            const boardTasks = getTasksFromKanban(
                kanbanResponse?.kanban
            );

            const mergedTasks = mergeTasks(
                loadedProject.tasks,
                boardTasks
            );

            setProject({
                ...loadedProject,
                statusBoards: orderedStatusBoards,
                tasks: mergedTasks,
            });
        } catch (requestError) {
            setProject(null);

            setError(
                requestError?.response?.data?.message ||
                'Unable to load this project.'
            );
        } finally {
            setIsLoading(false);
        }
    }, [fetchKanban, fetchProject, projectId]);

    useEffect(() => {
        loadProject();
    }, [loadProject]);

    useEffect(() => {
        let isMounted = true;
        getAllUsers();
        return () => {
            isMounted = false;
        };
    }, [getAllUsers]);

    const projectLeadId = getUserId(project?.leadId);

    const isProjectLead = projectLeadId === user?._id;

    const isAdmin = user?.role === ADMIN

    const canManage =
        user?.role === ADMIN ||
        (user?.role === LEAD && isProjectLead);

    const orderedBoards = useMemo(() => {
        return [...(project?.statusBoards || [])].sort(
            (first, second) =>
                (first.order ?? 0) - (second.order ?? 0)
        );
    }, [project?.statusBoards]);

    const projectTasks = useMemo(() => {
        return [...(project?.tasks || [])].sort((first, second) => {
            return (
                getDateTimestamp(getTaskDeadline(first)) -
                getDateTimestamp(getTaskDeadline(second))
            );
        });
    }, [project?.tasks]);

    const teamMembers = useMemo(() => {
        const seenMemberIds = new Set([projectLeadId]);

        return (project?.members || []).filter((member) => {
            const memberId = getUserId(member);

            if (!memberId || seenMemberIds.has(memberId)) {
                return false;
            }

            seenMemberIds.add(memberId);

            return true;
        });
    }, [project?.members, projectLeadId]);

    const teamMemberIds = useMemo(() => {
        return new Set([
            projectLeadId,
            ...teamMembers.map((member) => getUserId(member)),
        ]);
    }, [projectLeadId, teamMembers]);

    const availableUsers = useMemo(() => {
        const normalizedSearch = memberSearchTerm.trim().toLowerCase();

        return users.filter((candidate) => {
            const isAlreadyMember = teamMemberIds.has(candidate._id);

            const matchesSearch =
                !normalizedSearch ||
                candidate.name?.toLowerCase().includes(normalizedSearch) ||
                candidate.email?.toLowerCase().includes(normalizedSearch);

            return !isAlreadyMember && matchesSearch;
        });
    }, [memberSearchTerm, teamMemberIds, users]);

    const removeProject = async () => {
        const shouldDelete = window.confirm(
            'Delete this project and all of its tasks? This action cannot be undone.'
        );

        if (!shouldDelete) {
            return;
        }

        try {
            const response = await deleteProject(projectId);

            if (response?.success) {
                navigate('/projects');
                return;
            }

            setError(response?.message || 'Unable to delete the project.');
        } catch (requestError) {
            setError(
                requestError?.response?.data?.message ||
                'Unable to delete the project.'
            );
        }
    };

    const addProjectMember = async (userId) => {
        setAddingMemberId(userId);

        try {
            const response = await addMember(projectId, userId);

            if (response?.success) {
                updateProjectState(response);
                return;
            }

            setError(response?.message || 'Unable to add this member.');
        } catch (requestError) {
            setError(
                requestError?.response?.data?.message ||
                'Unable to add this member.'
            );
        } finally {
            setAddingMemberId('');
        }
    };

    const removeProjectMember = async (userId, memberName) => {
        const shouldRemove = window.confirm(
            `Remove ${memberName || 'this member'} from the project?`
        );

        if (!shouldRemove) {
            return;
        }

        try {
            const response = await removeMember(projectId, userId);

            if (response?.success) {
                updateProjectState(response);
                return;
            }

            setError(response?.message || 'Unable to remove this member.');
        } catch (requestError) {
            setError(
                requestError?.response?.data?.message ||
                'Unable to remove this member.'
            );
        }
    };

    const closeMemberModal = () => {
        setMemberSearchTerm('');
        setIsMemberModalOpen(false);
    };

    if (isLoading) {
        return <Loading fullScreen text="Loading project workspace..."/>;
    }

    if (!project) {
        return (
            <div className="page-container">
                <div className="panel">
                    <EmptyState
                        icon="folder"
                        title="Project unavailable"
                        description={error || 'This project could not be loaded.'}
                        action={
                            <Link to="/projects">
                                <Button variant="outline">
                                    Back to projects
                                </Button>
                            </Link>
                        }
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="page-container space-y-6">
            <Link
                to="/projects"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-primary"
            >
                <Icon name="arrowLeft" size={16}/>
                Back to projects
            </Link>

            {error && (
                <Alert
                    type="error"
                    message={error}
                    onClose={() => setError('')}
                />
            )}

            <section
                className="relative overflow-hidden rounded-3xl border border-primary-100 bg-gradient-to-br from-primary-50 via-surface to-surface px-5 py-6 shadow-card sm:px-7 sm:py-7">
                <div
                    className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl"/>

                <div className="relative flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
              <span
                  className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-button">
                <Icon name="folder" size={22}/>
              </span>

                            <Badge
                                variant={statusVariants[project.status] || 'secondary'}
                                size="sm"
                                dot
                            >
                                {getStatusLabel(project.status)}
                            </Badge>
                        </div>

                        <h1 className="mt-5 max-w-4xl text-3xl font-bold tracking-[-0.045em] text-secondary sm:text-4xl">
                            {project.name}
                        </h1>

                        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted sm:text-base">
                            {project.description ||
                                'No project description has been added yet.'}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                        <Link to={`/board/${projectId}`}>
                            <Button
                                className="shadow-button"
                                icon={<Icon name="columns" size={16}/>}
                            >
                                Open board
                            </Button>
                        </Link>

                        {canManage && (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsBoardManagerOpen(true)}
                                    icon={<Icon name="settings" size={16}/>}
                                >
                                    Workflow
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsEditOpen(true)}
                                    icon={<Icon name="edit" size={16}/>}
                                >
                                    Edit
                                </Button>


                                {isAdmin && (
                                    <>


                                        <button
                                            type="button"
                                            onClick={removeProject}
                                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-danger transition-colors hover:bg-danger-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-danger"
                                            aria-label="Delete project"
                                            title="Delete project"
                                        >
                                            <Icon name="trash" size={17}/>
                                        </button>
                                    </>)}
                            </>
                        )}
                    </div>
                </div>
            </section>

            <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="space-y-5">
                    <Card className="overflow-hidden p-0">
                        <div
                            className="flex flex-col gap-4 border-b border-line px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <div>
                                <p className="section-label">Workflow</p>

                                <h2 className="section-title mt-1">
                                    Project delivery stages
                                </h2>

                                <p className="mt-1 text-sm text-muted">
                                    Track how work moves from one stage to the next.
                                </p>
                            </div>

                            {canManage && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsBoardManagerOpen(true)}
                                    icon={<Icon name="settings" size={15}/>}
                                >
                                    Manage workflow
                                </Button>
                            )}
                        </div>

                        <div className="p-5 sm:p-6">
                            {orderedBoards.length > 0 ? (
                                <div className="overflow-x-auto pb-2 custom-scrollbar">
                                    <div className="flex min-w-max items-center gap-2">
                                        {orderedBoards.map((board, index) => (
                                            <div
                                                key={board._id || board.name}
                                                className="flex items-center gap-2"
                                            >
                                                <div
                                                    className="min-w-[155px] rounded-2xl border border-line bg-surfaceSubtle px-4 py-3">
                                                    <div className="flex items-center gap-2">
                            <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{
                                    backgroundColor: board.color,
                                }}
                            />

                                                        <p className="truncate text-sm font-semibold text-secondary">
                                                            {board.name}
                                                        </p>
                                                    </div>
                                                </div>

                                                {index < orderedBoards.length - 1 && (
                                                    <Icon
                                                        name="arrowRight"
                                                        size={17}
                                                        className="shrink-0 text-lineStrong"
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className="rounded-2xl border border-dashed border-line bg-surfaceSubtle px-5 py-10 text-center">
                  <span
                      className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary">
                    <Icon name="columns" size={20}/>
                  </span>

                                    <p className="mt-3 text-sm font-semibold text-secondary">
                                        No workflow stages configured
                                    </p>

                                    <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
                                        Add stages such as To do, In progress, Review, and Done.
                                    </p>

                                    {canManage && (
                                        <Button
                                            className="mt-4"
                                            size="sm"
                                            onClick={() => setIsBoardManagerOpen(true)}
                                            icon={<Icon name="plus" size={16}/>}
                                        >
                                            Create workflow
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </Card>

                    <ProjectTaskList
                        projectId={projectId}
                        tasks={projectTasks}
                        statusBoards={orderedBoards}
                    />
                </div>

                <aside className="space-y-5">
                    <Card className="p-5">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="section-label">Overview</p>
                                <h2 className="section-title mt-1">
                                    Project details
                                </h2>
                            </div>

                            <span
                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-surfaceSubtle text-muted">
                <Icon name="target" size={17}/>
              </span>
                        </div>

                        <div className="mt-5 divide-y divide-line">
                            <div className="flex items-center justify-between gap-4 py-3 first:pt-0">
                                <span className="text-sm text-muted">Project admin</span>

                                <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-secondary">
                  <Avatar user={project.leadId} size="xs"/>

                  <span className="max-w-[155px] truncate">
                    {project.leadId?.name || 'Unassigned'}
                  </span>
                </span>
                            </div>

                            <div className="flex items-center justify-between gap-4 py-3">
                                <span className="text-sm text-muted">Start date</span>

                                <span className="text-sm font-semibold text-secondary">
                  {displayDate(project.startDate)}
                </span>
                            </div>

                            <div className="flex items-center justify-between gap-4 pb-0 pt-3">
                                <span className="text-sm text-muted">Target date</span>

                                <span className="text-sm font-semibold text-secondary">
                  {displayDate(project.endDate)}
                </span>
                            </div>
                        </div>
                    </Card>

                    <Card className="overflow-hidden p-0">
                        <div className="flex items-center justify-between border-b border-line px-5 py-4">
                            <div>
                                <p className="section-label">Team</p>
                                <h2 className="section-title mt-1">
                                    Project members
                                </h2>
                            </div>

                            {canManage && (
                                <button
                                    type="button"
                                    onClick={() => setIsMemberModalOpen(true)}
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary transition-colors hover:bg-primary hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                    aria-label="Add team member"
                                    title="Add team member"
                                >
                                    <Icon name="plus" size={17}/>
                                </button>
                            )}
                        </div>

                        <div className="divide-y divide-line">
                            <div className="flex items-center gap-3 px-5 py-4">
                                <Avatar user={project.leadId} size="sm"/>

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-secondary">
                                        {project.leadId?.name || 'Project Lead'}
                                    </p>

                                    <p className="truncate text-xs text-muted">
                                        {project.leadId?.email || 'No email available'}
                                    </p>
                                </div>

                                <Badge variant="success" size="sm">
                                    Lead
                                </Badge>
                            </div>

                            {teamMembers.map((member) => {
                                const memberId = getUserId(member);

                                return (
                                    <div
                                        key={memberId}
                                        className="group flex items-center gap-3 px-5 py-3.5"
                                    >
                                        <Avatar user={member} size="sm"/>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-secondary">
                                                {member.name || 'Team member'}
                                            </p>

                                            <p className="truncate text-xs text-muted">
                                                {member.email || 'No email available'}
                                            </p>
                                        </div>

                                        <span className="text-xs capitalize text-muted">
                      {member.role || 'member'}
                    </span>

                                        {canManage && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeProjectMember(memberId, member.name)
                                                }
                                                className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-300 opacity-0 transition-all hover:bg-danger-soft hover:text-danger group-hover:opacity-100"
                                                aria-label={`Remove ${member.name}`}
                                                title={`Remove ${member.name}`}
                                            >
                                                <Icon name="x" size={15}/>
                                            </button>
                                        )}
                                    </div>
                                );
                            })}

                            {teamMembers.length === 0 && (
                                <div className="px-5 py-7 text-center">
                                    <p className="text-sm font-medium text-secondary">
                                        No additional members
                                    </p>

                                    <p className="mt-1 text-xs text-muted">
                                        Add people to collaborate on this project.
                                    </p>

                                    {canManage && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="mt-3"
                                            onClick={() => setIsMemberModalOpen(true)}
                                        >
                                            Add member
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </Card>
                </aside>
            </section>

            {isEditOpen && (
                <ProjectForm
                    project={project}
                    onClose={() => setIsEditOpen(false)}
                    onSuccess={(updatedProject) => {
                        setProject((currentProject) => ({
                            ...currentProject,
                            ...updatedProject,
                            tasks:
                                updatedProject?.tasks ||
                                currentProject?.tasks ||
                                [],
                            statusBoards:
                                updatedProject?.statusBoards ||
                                currentProject?.statusBoards ||
                                [],
                        }));

                        setIsEditOpen(false);
                    }}
                />
            )}

            {isBoardManagerOpen && (
                <StatusBoardManager
                    project={project}
                    onClose={() => setIsBoardManagerOpen(false)}
                    onUpdate={(statusBoards) => {
                        setProject((currentProject) => ({
                            ...currentProject,
                            statusBoards,
                        }));
                    }}
                />
            )}

            {isMemberModalOpen && (
                <Modal
                    isOpen
                    onClose={closeMemberModal}
                    title="Add team members"
                    subtitle="Search the workspace and add people to this project."
                    size="md"
                >
                    <div className="space-y-4 p-5 sm:p-6">
                        <Input
                            value={memberSearchTerm}
                            onChange={(event) =>
                                setMemberSearchTerm(event.target.value)
                            }
                            placeholder="Search by name or email"
                            icon="search"
                        />

                        {availableUsers.length > 0 ? (
                            <div
                                className="max-h-[360px] divide-y divide-line overflow-y-auto rounded-xl border border-line custom-scrollbar">
                                {availableUsers.map((candidate) => (
                                    <div
                                        key={candidate._id}
                                        className="flex items-center gap-3 px-3 py-3 transition-colors hover:bg-surfaceSubtle"
                                    >
                                        <Avatar user={candidate} size="sm"/>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-secondary">
                                                {candidate.name}
                                            </p>

                                            <p className="truncate text-xs text-muted">
                                                {candidate.email}
                                            </p>
                                        </div>

                                        <Badge variant={'success'}>
                                            {candidate.role}
                                        </Badge>

                                        <Button
                                            loading={addingMemberId === candidate._id}
                                            onClick={() =>
                                                addProjectMember(candidate._id)
                                            }
                                            icon={<Icon name="plus" size={15}/>}
                                        >
                                            Add
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div
                                className="rounded-2xl border border-dashed border-line bg-surfaceSubtle px-5 py-10 text-center">
                <span
                    className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary">
                  <Icon name="users" size={18}/>
                </span>

                                <p className="mt-3 text-sm font-semibold text-secondary">
                                    No users available
                                </p>

                                <p className="mt-1 text-sm text-muted">
                                    Everyone matching this search is already part of the project.
                                </p>
                            </div>
                        )}

                        <div className="flex justify-end border-t border-line pt-4">
                            <Button variant="outline" onClick={closeMemberModal}>
                                Done
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default ProjectDetail;