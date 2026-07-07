import {useCallback, useEffect, useMemo, useState} from 'react';
import {
    Link,
    Navigate,
    useNavigate,
    useParams,
} from 'react-router-dom';
import {
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    closestCorners,
    useDroppable,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';

import useAuth from '../../hooks/useAuth';
import useProject from '../../hooks/useProject';
import useTask from '../../hooks/useTask';

import Button from '../UI/Button';
import EmptyState from '../UI/EmptyState';
import Icon from '../UI/Icon';
import Loading from '../UI/Loading';

import TaskCard from '../Tasks/TaskCard';
import TaskForm from '../Tasks/TaskForm';
import StatusBoardManager from './StatusBoardManager';
import {ADMIN, ALL_ROLES, LEAD} from "../Common/constants.js";

const taskDndId = (taskId) => `task:${taskId}`;

const columnDndId = (boardName) => `column:${boardName}`;

const getUserId = (value) => value?._id || value || '';

const getProjectFromResponse = (response) => {
    return (
        response?.project ||
        response?.data?.project ||
        response?.data?.data?.project ||
        response?.data?.data ||
        response?.data ||
        response ||
        null
    );
};

const sortBoards = (boards) => {
    return [...(boards || [])].sort(
        (first, second) => (first.order ?? 0) - (second.order ?? 0)
    );
};

const normalizeKanban = (boards, kanban) => {
    return boards.reduce(
        (result, board) => ({
            ...result,
            [board.name]: kanban?.[board.name] || {
                board,
                tasks: [],
            },
        }),
        {}
    );
};

const createKanbanFromTasks = (boards, tasks) => {
    return boards.reduce(
        (result, board) => ({
            ...result,
            [board.name]: {
                board,
                tasks: (tasks || []).filter(
                    (task) => task.status === board.name
                ),
            },
        }),
        {}
    );
};

const canUserAccessProject = (project, user) => {
    if (!project || !user?._id) {
        return false;
    }

    if (user.role === 'admin') {
        return true;
    }

    const currentUserId = user._id;

    const isProjectAdmin =
        getUserId(project.leadId) === currentUserId;

    const isProjectMember = (project.members || []).some(
        (member) => getUserId(member) === currentUserId
    );

    return isProjectAdmin || isProjectMember;
};

const SortableTask = ({
                          task,
                          statusBoards,
                          onOpen,
                          canMoveTasks,
                      }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: taskDndId(task._id),
        disabled: !canMoveTasks,
        data: {
            type: 'task',
            taskId: task._id,
            boardName: task.status,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.35 : 1,
    };

    const dragHandleProps = canMoveTasks
        ? {
            ref: setActivatorNodeRef,
            ...attributes,
            ...listeners,
        }
        : undefined;

    return (
        <div ref={setNodeRef} style={style}>
            <TaskCard
                task={task}
                statusBoards={statusBoards}
                isDragging={isDragging}
                onOpen={() => onOpen(task)}
                dragHandleProps={dragHandleProps}
            />
        </div>
    );
};

const KanbanColumn = ({
                          board,
                          tasks,
                          statusBoards,
                          canManageBoard,
                          onAddTask,
                          onOpenTask,
                      }) => {
    const {setNodeRef, isOver} = useDroppable({
        id: columnDndId(board.name),
        disabled: !canManageBoard,
        data: {
            type: 'column',
            boardName: board.name,
        },
    });

    return (
        <section
            className={`kanban-column transition-colors ${
                isOver ? 'border-primary-300 bg-primary-50/70' : ''
            }`}
        >
            <header className="flex items-center justify-between gap-3 px-4 py-3.5">
                <div className="flex min-w-0 items-center gap-2">
          <span
              className="h-2.5 w-2.5 rounded-full"
              style={{backgroundColor: board.color}}
          />

                    <h2 className="truncate text-sm font-semibold text-secondary">
                        {board.name}
                    </h2>

                    <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-muted shadow-sm">
            {tasks.length}
          </span>
                </div>

                {canManageBoard && (
                    <button
                        type="button"
                        onClick={() => onAddTask(board.name)}
                        className="icon-button-sm"
                        aria-label={`Add task to ${board.name}`}
                    >
                        <Icon name="plus" size={17}/>
                    </button>
                )}
            </header>

            <div ref={setNodeRef} className="kanban-tasks">
                <SortableContext
                    items={tasks.map((task) => taskDndId(task._id))}
                    strategy={verticalListSortingStrategy}
                >
                    {tasks.map((task) => (
                        <SortableTask
                            key={task._id}
                            task={task}
                            statusBoards={statusBoards}
                            onOpen={onOpenTask}
                            canMoveTasks={canManageBoard}
                        />
                    ))}
                </SortableContext>

                {tasks.length === 0 && (
                    <div
                        className={`flex min-h-[132px] items-center justify-center rounded-xl border border-dashed px-4 text-center text-xs transition-colors ${
                            isOver
                                ? 'border-primary-300 bg-white text-primary-700'
                                : 'border-slate-200 text-slate-400'
                        }`}
                    >
                        {canManageBoard
                            ? 'Drop tasks here'
                            : 'No tasks in this stage'}
                    </div>
                )}
            </div>
        </section>
    );
};

const KanbanBoard = () => {
    const {id: projectId} = useParams();
    const navigate = useNavigate();

    const {user} = useAuth();
    const {fetchKanban, updateTaskStatus} = useTask();
    const {fetchProject} = useProject();

    const [project, setProject] = useState(null);
    const [kanban, setKanban] = useState({});
    const [statusBoards, setStatusBoards] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTask, setActiveTask] = useState(null);
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [showBoardManager, setShowBoardManager] = useState(false);
    const [defaultStatus, setDefaultStatus] = useState('');
    const [error, setError] = useState('');

    const canManageBoard = [LEAD, ADMIN].includes(
        user?.role
    );

    const loadBoard = useCallback(async () => {
        setIsLoading(true);
        setError('');

        try {
            const [kanbanResult, projectResult] = await Promise.allSettled([
                fetchKanban(projectId),
                fetchProject(projectId),
            ]);

            const kanbanResponse =
                kanbanResult.status === 'fulfilled'
                    ? kanbanResult.value
                    : null;

            const projectResponse =
                projectResult.status === 'fulfilled'
                    ? projectResult.value
                    : null;

            const loadedProject = getProjectFromResponse(projectResponse);

            if (!loadedProject) {
                throw new Error('Unable to load this project board.');
            }

            const boards = sortBoards(
                kanbanResponse?.statusBoards ||
                loadedProject.statusBoards ||
                []
            );

            const fallbackKanban = createKanbanFromTasks(
                boards,
                loadedProject.tasks || []
            );

            setProject({
                ...loadedProject,
                statusBoards: boards,
            });

            setStatusBoards(boards);

            setKanban(
                normalizeKanban(
                    boards,
                    kanbanResponse?.kanban || fallbackKanban
                )
            );

            if (kanbanResult.status === 'rejected') {
                setError(
                    'The project loaded, but the Kanban task data could not be fully loaded.'
                );
            }
        } catch (requestError) {
            setProject(null);
            setKanban({});
            setStatusBoards([]);

            setError(
                requestError?.response?.data?.message ||
                requestError?.message ||
                'Unable to load this project board.'
            );
        } finally {
            setIsLoading(false);
        }
    }, [fetchKanban, fetchProject, projectId]);

    useEffect(() => {
        if (!user) {
            setIsLoading(false);
            return;
        }

        loadBoard();
    }, [loadBoard, user]);

    const allTasks = useMemo(() => {
        return Object.values(kanban).flatMap(
            (column) => column.tasks || []
        );
    }, [kanban]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 6,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const moveTaskLocally = useCallback((taskId, targetStatus) => {
        setKanban((currentKanban) => {
            const task = Object.values(currentKanban)
                .flatMap((column) => column.tasks || [])
                .find((item) => item._id === taskId);

            if (
                !task ||
                task.status === targetStatus ||
                !currentKanban[targetStatus]
            ) {
                return currentKanban;
            }

            const withoutTask = Object.fromEntries(
                Object.entries(currentKanban).map(([boardName, column]) => [
                    boardName,
                    {
                        ...column,
                        tasks: (column.tasks || []).filter(
                            (item) => item._id !== taskId
                        ),
                    },
                ])
            );

            return {
                ...withoutTask,
                [targetStatus]: {
                    ...withoutTask[targetStatus],
                    tasks: [
                        {
                            ...task,
                            status: targetStatus,
                        },
                        ...(withoutTask[targetStatus].tasks || []),
                    ],
                },
            };
        });
    }, []);

    const handleDragStart = ({active}) => {
        if (!canManageBoard) {
            return;
        }

        const taskId = active.data.current?.taskId;

        setActiveTask(
            allTasks.find((task) => task._id === taskId) || null
        );
    };

    const handleDragEnd = async ({active, over}) => {
        setActiveTask(null);

        if (!canManageBoard || !over) {
            return;
        }

        const taskId = active.data.current?.taskId;
        const targetStatus = over.data.current?.boardName;

        const selectedTask = allTasks.find(
            (task) => task._id === taskId
        );

        if (
            !taskId ||
            !targetStatus ||
            !selectedTask ||
            selectedTask.status === targetStatus
        ) {
            return;
        }

        const previousKanban = kanban;

        moveTaskLocally(taskId, targetStatus);

        try {
            const response = await updateTaskStatus(
                taskId,
                targetStatus
            );

            if (!response?.success) {
                throw new Error(
                    response?.message || 'Unable to move the task.'
                );
            }
        } catch (requestError) {
            setKanban(previousKanban);

            setError(
                requestError?.response?.data?.message ||
                requestError?.message ||
                'Unable to move the task.'
            );
        }
    };

    const handleBoardsUpdate = (nextBoards) => {
        const orderedBoards = sortBoards(nextBoards);

        setStatusBoards(orderedBoards);

        setProject((currentProject) => ({
            ...currentProject,
            statusBoards: orderedBoards,
        }));

        setKanban((currentKanban) =>
            normalizeKanban(orderedBoards, currentKanban)
        );
    };

    if (isLoading) {
        return <Loading fullScreen text="Loading project board..."/>;
    }

    if (error && !project) {
        return (
            <div className="page-container">
                <EmptyState
                    title="Board unavailable"
                    description={error}
                    icon="columns"
                    action={
                        <Link to="/board">
                            <Button variant="outline">
                                Back to boards
                            </Button>
                        </Link>
                    }
                />
            </div>
        );
    }

    if (project && !canUserAccessProject(project, user)) {
        return (
            <div className="page-container">
                <EmptyState
                    title="Project board unavailable"
                    description="You are not assigned to this project."
                    icon="columns"
                    action={
                        <Link to="/board">
                            <Button variant="outline">
                                Back to boards
                            </Button>
                        </Link>
                    }
                />
            </div>
        );
    }

    return (
        <div className="page-container flex min-h-[calc(100vh-9rem)] flex-col">
            <div
                className="mb-5 flex flex-col gap-4 border-b border-line pb-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0">
                    <div className="mb-2 flex items-center gap-2 text-sm text-muted">
                        <Link
                            to="/projects"
                            className="transition-colors hover:text-primary-700"
                        >
                            Projects
                        </Link>

                        <Icon name="chevronRight" size={15}/>

                        <Link
                            to={`/projects/${projectId}`}
                            className="truncate transition-colors hover:text-primary-700"
                        >
                            {project?.name || 'Project'}
                        </Link>

                        <Icon name="chevronRight" size={15}/>

                        <span className="truncate">Board</span>
                    </div>

                    <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
              <Icon name="columns" size={19}/>
            </span>

                        <div>
                            <h1 className="page-title">
                                {project?.name || 'Project board'}
                            </h1>

                            <p className="page-subtitle">
                                {canManageBoard
                                    ? 'Drag a task by its handle to update its workflow stage.'
                                    : 'View tasks across the project workflow.'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        size="md"
                        onClick={() => navigate('/board')}
                        icon={<Icon name="columns" size={17}/>}
                    >
                        Change project
                    </Button>

                    {canManageBoard && (
                        <>
                            <Button
                                variant="outline"
                                size="md"
                                onClick={() => setShowBoardManager(true)}
                                icon={<Icon name="settings" size={17}/>}
                            >
                                Manage boards
                            </Button>

                            <Button
                                size="md"
                                onClick={() => {
                                    setDefaultStatus(
                                        statusBoards[0]?.name || 'todo'
                                    );
                                    setShowTaskForm(true);
                                }}
                                icon={<Icon name="plus" size={17}/>}
                            >
                                Add task
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {error && (
                <div className="mb-4">
                    <p className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-800">
                        {error}
                    </p>
                </div>
            )}

            {statusBoards.length === 0 ? (
                <EmptyState
                    title="No workflow stages yet"
                    description="This project does not have any workflow columns yet."
                    icon="columns"
                    action={
                        canManageBoard && (
                            <Button
                                onClick={() => setShowBoardManager(true)}
                                icon={<Icon name="plus" size={17}/>}
                            >
                                Create boards
                            </Button>
                        )
                    }
                />
            ) : (
                <div className="min-h-0 flex-1 overflow-x-auto pb-3 custom-scrollbar">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCorners}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onDragCancel={() => setActiveTask(null)}
                    >
                        <div
                            className="grid min-h-full min-w-max grid-flow-col auto-cols-[minmax(292px,1fr)] gap-4 xl:min-w-full xl:grid-flow-row xl:grid-cols-3 2xl:grid-cols-4">
                            {statusBoards.map((board) => (
                                <KanbanColumn
                                    key={board._id || board.name}
                                    board={board}
                                    tasks={kanban[board.name]?.tasks || []}
                                    statusBoards={statusBoards}
                                    canManageBoard={canManageBoard}
                                    onAddTask={(status) => {
                                        setDefaultStatus(status);
                                        setShowTaskForm(true);
                                    }}
                                    onOpenTask={(task) =>
                                        navigate(`/tasks/${task._id}`)
                                    }
                                />
                            ))}
                        </div>

                        <DragOverlay>
                            {activeTask ? (
                                <div className="w-[292px] rotate-2">
                                    <TaskCard
                                        task={activeTask}
                                        statusBoards={statusBoards}
                                        isDragging
                                    />
                                </div>
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                </div>
            )}

            {showTaskForm && (
                <TaskForm
                    projectId={projectId}
                    defaultStatus={defaultStatus}
                    statusBoards={statusBoards}
                    onClose={() => setShowTaskForm(false)}
                    onSuccess={() => {
                        setShowTaskForm(false);
                        loadBoard();
                    }}
                />
            )}

            {showBoardManager && project && (
                <StatusBoardManager
                    project={{
                        ...project,
                        statusBoards,
                    }}
                    onClose={() => setShowBoardManager(false)}
                    onUpdate={handleBoardsUpdate}
                />
            )}
        </div>
    );
};

export default KanbanBoard;