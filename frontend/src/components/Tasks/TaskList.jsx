import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import useAuth from '../../hooks/useAuth';
import useProject from '../../hooks/useProject';
import useTask from '../../hooks/useTask';
import Avatar from '../UI/Avatar';
import Badge from '../UI/Badge';
import Button from '../UI/Button';
import Card from '../UI/Card';
import EmptyState from '../UI/EmptyState';
import Icon from '../UI/Icon';
import Input from '../UI/Input';
import { CardSkeleton } from '../UI/Loading';
import Select from '../UI/Select';
import TaskForm from './TaskForm';
import {ADMIN, LEAD} from "../Common/constants.js";

const priorityVariants = {
  high: 'danger',
  medium: 'warning',
  low: 'success',
};

const getId = (value) =>
    typeof value === 'string' ? value : value?._id || value?.id || '';

const TaskList = ({ myTasks = false }) => {
  const { projectId } = useParams();

  const {
    user,
    allUser: users = [],
    getAllUsers,
  } = useAuth();

  const {
    tasks = [],
    fetchTasks,
    getMyTasks,
    deleteTask,
    updateTaskStatus,
  } = useTask();

  const {
    projects = [],
    fetchProjects,
  } = useProject();

  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
  });

  const project = useMemo(() => {
    if (myTasks) return null;

    return projects.find(
        (item) => item._id === projectId
    );
  }, [myTasks, projectId, projects]);

  const statusBoards = useMemo(() => {
    return [...(project?.statusBoards || [])].sort(
        (first, second) =>
            (first.order ?? 0) - (second.order ?? 0)
    );
  }, [project]);

  const usersById = useMemo(() => {
    return new Map(
        [...users, user]
            .filter(Boolean)
            .map((candidate) => [getId(candidate), candidate])
    );
  }, [users, user]);

  const canCreate =
      !myTasks &&
      [ADMIN, LEAD].includes(user?.role);

  const canDelete =
      [ADMIN, LEAD].includes(user?.role);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      await Promise.all([
        myTasks ? getMyTasks() : fetchTasks(projectId),
        myTasks ? Promise.resolve() : fetchProjects(),
        getAllUsers(),
      ]);
    } catch (requestError) {
      setError(
          requestError?.response?.data?.message ||
          requestError?.message ||
          'Unable to load tasks.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    fetchProjects,
    fetchTasks,
    getAllUsers,
    getMyTasks,
    myTasks,
    projectId,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const visibleTasks = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    return tasks.filter((task) => {
      const assignee =
          usersById.get(getId(task.assignedTo)) ||
          task.assignedTo;

      const matchesSearch =
          !search ||
          [
            task.title,
            task.description,
            task.projectId?.name,
            assignee?.name,
            assignee?.email,
          ]
              .filter(Boolean)
              .some((value) =>
                  String(value).toLowerCase().includes(search)
              );

      return (
          matchesSearch &&
          (!filters.status || task.status === filters.status) &&
          (!filters.priority || task.priority === filters.priority)
      );
    });
  }, [filters, tasks, usersById]);

  const updateFilter = (event) => {
    const { name, value } = event.target;

    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const changeStatus = async (taskId, status) => {
    try {
      setError('');

      await updateTaskStatus(taskId, status);
      await loadData();
    } catch (requestError) {
      setError(
          requestError?.response?.data?.message ||
          requestError?.message ||
          'Unable to update task status.'
      );
    }
  };

  const removeTask = async (taskId) => {
    if (!window.confirm('Delete this task? This cannot be undone.')) {
      return;
    }

    try {
      setError('');

      await deleteTask(taskId);
      await loadData();
    } catch (requestError) {
      setError(
          requestError?.response?.data?.message ||
          requestError?.message ||
          'Unable to delete this task.'
      );
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return 'No due date';

    const date = new Date(dateValue);

    return Number.isNaN(date.getTime())
        ? 'No due date'
        : format(date, 'MMM d, yyyy');
  };

  return (
      <div className="page-container space-y-6">
        <header className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {!myTasks && project && (
                <div className="mb-2 flex items-center gap-2 text-sm text-muted">
                  <Link to="/projects" className="hover:text-primary">
                    Projects
                  </Link>

                  <Icon name="chevronRight" size={15} />

                  <Link
                      to={`/projects/${projectId}`}
                      className="max-w-[260px] truncate hover:text-primary"
                  >
                    {project.name}
                  </Link>
                </div>
            )}

            <p className="section-label">
              {myTasks ? 'Personal work' : 'Project work'}
            </p>

            <h1 className="page-title mt-1">
              {myTasks
                  ? 'My tasks'
                  : `${project?.name || 'Project'} tasks`}
            </h1>

            <p className="page-subtitle">
              {visibleTasks.length} task
              {visibleTasks.length === 1 ? '' : 's'} shown
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {!myTasks && projectId && (
                <Link to={`/board/${projectId}`}>
                  <Button
                      variant="outline"
                      icon={<Icon name="columns" size={17} />}
                  >
                    Board view
                  </Button>
                </Link>
            )}

            {canCreate && (
                <Button
                    onClick={() => setIsFormOpen(true)}
                    icon={<Icon name="plus" size={17} />}
                >
                  Add task
                </Button>
            )}
          </div>
        </header>

        {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </p>
        )}

        <section className="panel p-3 sm:p-4">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_170px_170px]">
            <Input
                name="search"
                value={filters.search}
                onChange={updateFilter}
                placeholder="Search tasks"
                icon="search"
            />

            {!myTasks && (
                <Select
                    name="status"
                    value={filters.status}
                    onChange={updateFilter}
                    placeholder="All statuses"
                    options={statusBoards.map((board) => ({
                      value: board.name,
                      label: board.name,
                    }))}
                />
            )}

            <Select
                name="priority"
                value={filters.priority}
                onChange={updateFilter}
                placeholder="All priorities"
                options={[
                  { value: 'high', label: 'High priority' },
                  { value: 'medium', label: 'Medium priority' },
                  { value: 'low', label: 'Low priority' },
                ]}
            />
          </div>
        </section>

        {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }, (_, index) => (
                  <CardSkeleton key={index} />
              ))}
            </div>
        ) : visibleTasks.length === 0 ? (
            <div className="panel">
              <EmptyState
                  icon="tasks"
                  title="No tasks found"
                  description={
                    myTasks
                        ? 'You do not have any tasks that match these filters.'
                        : 'Create the first task or adjust the filters.'
                  }
                  action={
                      canCreate && (
                          <Button
                              onClick={() => setIsFormOpen(true)}
                              icon={<Icon name="plus" size={17} />}
                          >
                            Create task
                          </Button>
                      )
                  }
              />
            </div>
        ) : (
            <Card className="overflow-hidden p-0">
              <div className="hidden grid-cols-[minmax(0,1fr)_150px_150px_120px] gap-5 border-b border-line bg-surfaceSubtle px-5 py-3 text-xs font-semibold uppercase tracking-[0.06em] text-muted lg:grid">
                <span>Task</span>
                {!myTasks && <span>Assignee</span>}
                <span>Status</span>
                <span>Due date</span>
              </div>

              <div className="divide-y divide-line">
                {visibleTasks.map((task) => {
                  const assignee =
                      usersById.get(getId(task.assignedTo)) ||
                      task.assignedTo;

                  const overdue =
                      task.isOverdue ||
                      (task.deadline &&
                          task.status !== 'completed' &&
                          new Date(task.deadline) < new Date());

                  return (
                      <article
                          key={task._id}
                          className="group grid gap-3 px-4 py-4 transition-colors hover:bg-surfaceSubtle sm:px-5 lg:grid-cols-[minmax(0,1fr)_150px_150px_120px] lg:items-center lg:gap-5"
                      >
                        <div className="min-w-0">
                          <div className="flex items-start gap-2">
                      <span
                          className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                              task.priority === 'high'
                                  ? 'bg-danger'
                                  : task.priority === 'medium'
                                      ? 'bg-warning'
                                      : 'bg-success'
                          }`}
                      />

                            <div className="min-w-0">
                              <Link
                                  to={`/tasks/${task._id}`}
                                  className="block truncate text-sm font-semibold text-secondary hover:text-primary"
                              >
                                {task.title}
                              </Link>

                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                <Badge
                                    variant={
                                        priorityVariants[task.priority] ||
                                        'secondary'
                                    }
                                    size="sm"
                                >
                                  {task.priority || 'Not set'}
                                </Badge>

                                {task.projectId?.name && (
                                    <span className="text-xs text-muted">
                              {task.projectId.name}
                            </span>
                                )}

                                {overdue && (
                                    <span className="text-xs font-medium text-danger">
                              Overdue
                            </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {!myTasks &&
                            <div className="flex min-w-0 items-center gap-2 text-sm text-muted">
                          {assignee ? (
                              <>
                                <Avatar user={assignee} size="xs" />

                                <span className="truncate">
                          {assignee.name ||
                              assignee.email ||
                              'Assigned user'}
                        </span>
                              </>
                          ) : (
                              <span>Unassigned</span>
                          )}
                        </div>}

                        <div>
                          {!myTasks && statusBoards.length > 0 ? (
                              <Select
                                  value={task.status || ''}
                                  onChange={(event) =>
                                      changeStatus(
                                          task._id,
                                          event.target.value
                                      )
                                  }
                                  options={statusBoards.map((board) => ({
                                    value: board.name,
                                    label: board.name,
                                  }))}
                                  selectClassName="h-8 text-xs"
                              />
                          ) : (
                              <Badge variant="secondary" size="sm">
                                {task.status || 'Not set'}
                              </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2 text-sm text-muted">
                    <span
                        className={
                          overdue ? 'font-medium text-danger' : ''
                        }
                    >
                      {formatDate(task.deadline)}
                    </span>

                          {canDelete && (
                              <button
                                  type="button"
                                  onClick={() => removeTask(task._id)}
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted opacity-0 transition-all hover:bg-danger-soft hover:text-danger group-hover:opacity-100 focus:opacity-100"
                                  aria-label={`Delete ${task.title}`}
                              >
                                <Icon name="trash" size={15} />
                              </button>
                          )}
                        </div>
                      </article>
                  );
                })}
              </div>
            </Card>
        )}

        {isFormOpen && (
            <TaskForm
                projectId={projectId}
                statusBoards={statusBoards}
                onClose={() => setIsFormOpen(false)}
                onSuccess={() => {
                  setIsFormOpen(false);
                  loadData();
                }}
            />
        )}
      </div>
  );
};

export default TaskList;