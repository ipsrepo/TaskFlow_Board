import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import api from '../../utils/api';
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
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  return value._id || value.id || '';
};

const getTask = (response) => {
  const payload = response?.data || response;

  if (payload?._id) {
    return payload;
  }

  return (
      payload?.task ||
      payload?.data?.task ||
      payload?.data ||
      null
  );
};

const getProject = (response) => {
  const payload = response?.data || response;

  if (payload?._id) {
    return payload;
  }

  return (
      payload?.project ||
      payload?.data?.project ||
      payload?.data ||
      null
  );
};

const getUsers = (response) => {
  const payload = response?.data || response;

  const users =
      payload?.users ||
      payload?.data?.users ||
      payload?.data ||
      [];

  return Array.isArray(users) ? users : [];
};

const isSuccessful = (response) => {
  return (
      response?.success === true ||
      response?.data?.success === true
  );
};

const getTaskDueDate = (task) => {
  return task?.deadline || task?.dueDate || task?.endDate || null;
};

const formatTaskDate = (dateValue, fallback = 'Not set') => {
  if (!dateValue) {
    return fallback;
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return format(date, 'MMM d, yyyy');
};

const isTaskOverdue = (task) => {
  const dueDate = getTaskDueDate(task);

  if (!dueDate || task?.status === 'completed') {
    return false;
  }

  const dueDateTime = new Date(dueDate).getTime();

  return !Number.isNaN(dueDateTime) && dueDateTime < Date.now();
};

const getProjectUsers = (project) => {
  const userMap = new Map();

  const addUser = (candidate) => {
    const userId = getId(candidate);

    if (!userId) {
      return;
    }

    userMap.set(userId, candidate);
  };

  addUser(project?.leadId);

  (project?.members || []).forEach(addUser);

  return [...userMap.values()];
};

const TaskDetail = () => {
  const { id: taskId } = useParams();
  const navigate = useNavigate();

  const { user } = useAuth();
  const { fetchProject } = useProject();

  const {
    fetchTask,
    deleteTask,
    addComment,
    updateTask,
    updateTaskStatus,
  } = useTask();

  const [task, setTask] = useState(null);
  const [project, setProject] = useState(null);
  const [workspaceUsers, setWorkspaceUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const [isStatusSaving, setIsStatusSaving] = useState(false);
  const [isAssigneeSaving, setIsAssigneeSaving] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const loadTask = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const taskResponse = await fetchTask(taskId);
      const loadedTask = getTask(taskResponse);

      if (!loadedTask?._id) {
        throw new Error('Task not found or access is restricted.');
      }

      setTask(loadedTask);

      const resolvedProjectId = getId(loadedTask.projectId);

      const [projectResult, usersResult] = await Promise.allSettled([
        resolvedProjectId
            ? fetchProject(resolvedProjectId)
            : Promise.resolve(null),
        api.get('/users'),
      ]);

      if (projectResult.status === 'fulfilled') {
        setProject(getProject(projectResult.value));
      } else {
        setProject(null);
      }

      if (usersResult.status === 'fulfilled') {
        setWorkspaceUsers(getUsers(usersResult.value));
      } else {
        setWorkspaceUsers([]);
      }
    } catch (requestError) {
      setTask(null);

      setError(
          requestError?.response?.data?.message ||
          requestError?.message ||
          'Unable to load this task.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [fetchProject, fetchTask, taskId]);

  useEffect(() => {
    loadTask();
  }, [loadTask]);

  const projectId = getId(task?.projectId) || getId(project);

  const isTaskCreator = getId(task?.createdBy) === getId(user);

  const canEditTask =
      user?.role === 'admin' ||
      user?.role === 'lead' ||
      isTaskCreator;

  const statusBoards = useMemo(() => {
    return [...(project?.statusBoards || [])].sort(
        (first, second) =>
            (first.order ?? 0) - (second.order ?? 0)
    );
  }, [project?.statusBoards]);

  const projectUsers = useMemo(() => {
    return getProjectUsers(project);
  }, [project]);

  const allUsers = useMemo(() => {
    const userMap = new Map();

    [...workspaceUsers, user].forEach((candidate) => {
      const userId = getId(candidate);

      if (userId) {
        userMap.set(userId, candidate);
      }
    });

    return [...userMap.values()];
  }, [workspaceUsers, user]);

  const workspaceUserMap = useMemo(() => {
    return new Map(
        allUsers.map((candidate) => [
          getId(candidate),
          candidate,
        ])
    );
  }, [allUsers]);

  const comments = useMemo(() => {
    return (task?.comments || [])
        .map((item) => {
          const authorId = getId(
              item?.userId || item?.user || item?.createdBy
          );

          const author = workspaceUserMap.get(authorId);

          if (!author?.name && !author?.email) {
            return null;
          }

          return {
            ...item,
            author,
          };
        })
        .filter(Boolean);
  }, [task?.comments, workspaceUserMap]);

  const statusOptions = useMemo(() => {
    return statusBoards.map((board) => ({
      value: board.name,
      label: board.name,
    }));
  }, [statusBoards]);

  const assigneeOptions = useMemo(() => {
    return [
      {
        value: '',
        label: 'Unassigned',
      },
      ...projectUsers.map((candidate) => ({
        value: getId(candidate),
        label: candidate.name || candidate.email || 'Team member',
      })),
    ];
  }, [projectUsers]);

  const selectedStatusBoard = useMemo(() => {
    return statusBoards.find(
        (board) => board.name === task?.status
    );
  }, [statusBoards, task?.status]);

  const assigneeId = getId(
      task?.assignedTo || task?.assignee || task?.assigneeId
  );

  const projectName =
      project?.name ||
      task?.projectId?.name ||
      'Not available';

  const createdBy =
      allUsers.find(
          (candidate) =>
              getId(candidate) === getId(task?.createdBy)
      )?.name ||
      task?.createdBy?.name ||
      'Unknown';

  const dueDate = getTaskDueDate(task);
  const overdue = isTaskOverdue(task);

  const changeStatus = async (event) => {
    const nextStatus = event.target.value;

    if (!nextStatus || nextStatus === task.status) {
      return;
    }

    const previousTask = task;

    setTask((currentTask) => ({
      ...currentTask,
      status: nextStatus,
    }));

    setIsStatusSaving(true);
    setError('');

    try {
      const response = await updateTaskStatus(taskId, nextStatus);

      if (!isSuccessful(response)) {
        throw new Error(
            response?.message ||
            response?.data?.message ||
            'Unable to update task status.'
        );
      }
    } catch (requestError) {
      setTask(previousTask);

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
    const nextAssigneeId = event.target.value;

    const previousTask = task;

    setTask((currentTask) => ({
      ...currentTask,
      assignedTo: nextAssigneeId || null,
    }));

    setIsAssigneeSaving(true);
    setError('');

    try {
      const response = await updateTask(projectId, taskId, {
        assignedTo: nextAssigneeId || null,
      });

      if (!isSuccessful(response)) {
        throw new Error(
            response?.message ||
            response?.data?.message ||
            'Unable to update task assignee.'
        );
      }
    } catch (requestError) {
      setTask(previousTask);

      setError(
          requestError?.response?.data?.message ||
          requestError?.message ||
          'Unable to update task assignee.'
      );
    } finally {
      setIsAssigneeSaving(false);
    }
  };

  const removeTask = async () => {
    const shouldDelete = window.confirm(
        'Delete this task? This action cannot be undone.'
    );

    if (!shouldDelete) {
      return;
    }

    try {
      const response = await deleteTask(taskId);

      if (isSuccessful(response)) {
        navigate(
            projectId
                ? `/projects/${projectId}/tasks`
                : '/my-tasks'
        );
        return;
      }

      setError(
          response?.message ||
          response?.data?.message ||
          'Unable to delete this task.'
      );
    } catch (requestError) {
      setError(
          requestError?.response?.data?.message ||
          'Unable to delete this task.'
      );
    }
  };

  const postComment = async (event) => {
    event.preventDefault();

    const text = comment.trim();

    if (!text) {
      return;
    }

    setIsCommenting(true);
    setError('');

    try {
      const response = await addComment(taskId, text);

      if (!isSuccessful(response)) {
        throw new Error(
            response?.message ||
            response?.data?.message ||
            'Unable to post comment.'
        );
      }

      const responseData = response?.data || response;

      setTask((currentTask) => ({
        ...currentTask,
        comments:
            responseData?.comments ||
            responseData?.data?.comments ||
            currentTask.comments ||
            [],
      }));

      setComment('');
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

  if (isLoading) {
    return <Loading fullScreen text="Loading task..." />;
  }

  if (!task) {
    return (
        <div className="page-container">
          <div className="panel">
            <EmptyState
                icon="tasks"
                title="Task unavailable"
                description={error || 'This task could not be loaded.'}
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
                    className="inline-flex items-center gap-1.5 font-medium transition-colors hover:text-primary"
                >
                  <Icon name="arrowLeft" size={16} />
                  Tasks
                </Link>

                {projectId && (
                    <>
                      <Icon name="chevronRight" size={15} />

                      <Link
                          to={`/projects/${projectId}`}
                          className="max-w-[260px] truncate transition-colors hover:text-primary"
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

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
              <span className="inline-flex items-center gap-1.5">
                <Icon name="folder" size={15} />
                {projectName}
              </span>

                <span
                    className={`inline-flex items-center gap-1.5 ${
                        overdue ? 'font-semibold text-danger' : ''
                    }`}
                >
                <Icon name="calendar" size={15} />
                  {dueDate
                      ? `Due ${formatTaskDate(dueDate)}`
                      : 'No deadline'}
              </span>

                <span className="inline-flex items-center gap-1.5">
                <Icon name="message" size={15} />
                  {comments.length}{' '}
                  {comments.length === 1 ? 'comment' : 'comments'}
              </span>
              </div>
            </div>

            {canEditTask && (
                <div className="flex items-center gap-2">
                  <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditOpen(true)}
                      icon={<Icon name="edit" size={16} />}
                  >
                    Edit
                  </Button>

                  <button
                      type="button"
                      onClick={removeTask}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-danger transition-colors hover:bg-danger-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-danger"
                      aria-label="Delete task"
                      title="Delete task"
                  >
                    <Icon name="trash" size={17} />
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
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="section-label">Task overview</p>
                  <h2 className="section-title mt-1">Description</h2>
                </div>

                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-surfaceSubtle text-muted">
                <Icon name="tasks" size={17} />
              </span>
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
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="section-label">Discussion</p>
                  <h2 className="section-title mt-1">
                    Comments
                    {comments.length ? ` (${comments.length})` : ''}
                  </h2>
                </div>

                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-surfaceSubtle text-muted">
                <Icon name="message" size={17} />
              </span>
              </div>

              <div className="space-y-4">
                {comments.length > 0 ? (
                    comments.map((item, index) => (
                        <article
                            key={item._id || `${item.createdAt}-${index}`}
                            className="flex gap-3"
                        >
                          <Avatar user={item.author} size="sm" />

                          <div className="min-w-0 flex-1 rounded-xl bg-surfaceSubtle px-3.5 py-3">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-sm font-semibold text-secondary">
                          {item.author.name ||
                              item.author.email ||
                              'Unknown user'}
                        </span>

                              <span className="text-xs text-muted">
                          {item.createdAt
                              ? formatDistanceToNow(
                                  new Date(item.createdAt),
                                  { addSuffix: true }
                              )
                              : ''}
                        </span>
                            </div>

                            <p className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-secondary">
                              {item.text || ''}
                            </p>
                          </div>
                        </article>
                    ))
                ) : (
                    <div className="rounded-xl border border-dashed border-line bg-surfaceSubtle px-5 py-9 text-center">
                  <span className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary">
                    <Icon name="message" size={18} />
                  </span>

                      <p className="mt-3 text-sm font-semibold text-secondary">
                        No comments yet
                      </p>

                      <p className="mt-1 text-sm text-muted">
                        Start the conversation with your project team.
                      </p>
                    </div>
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
                      icon={<Icon name="message" size={16} />}
                  >
                    Post comment
                  </Button>
                </div>
              </form>
            </Card>
          </main>

          <aside>
            <Card className="p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="section-label">Task details</p>
                  <h2 className="section-title mt-1">Information</h2>
                </div>

                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-surfaceSubtle text-muted">
                <Icon name="target" size={17} />
              </span>
              </div>

              <dl className="mt-5 divide-y divide-line">
                <div className="flex items-center justify-between gap-4 py-3 first:pt-0">
                  <dt className="text-sm text-muted">Project</dt>

                  <dd className="min-w-0 text-right">
                    {projectId ? (
                        <Link
                            to={`/projects/${projectId}`}
                            className="inline-flex max-w-[175px] items-center gap-1.5 truncate text-sm font-semibold text-primary hover:underline"
                        >
                          <Icon name="folder" size={14} />
                          <span className="truncate">{projectName}</span>
                        </Link>
                    ) : (
                        <span className="text-sm font-medium text-muted">
                      Not available
                    </span>
                    )}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-sm text-muted">Status</dt>

                  <dd className="w-[175px]">
                    {statusOptions.length > 0 ? (
                        <div className="relative">
                      <span
                          className="pointer-events-none absolute left-3 top-1/2 z-10 h-2 w-2 -translate-y-1/2 rounded-full"
                          style={{
                            backgroundColor:
                                selectedStatusBoard?.color || '#7A869A',
                          }}
                      />

                          <select
                              value={task.status || ''}
                              onChange={changeStatus}
                              disabled={isStatusSaving}
                              className="h-9 w-full appearance-none rounded-lg border border-line bg-surface py-1.5 pl-7 pr-8 text-xs font-semibold text-secondary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {statusOptions.map((option) => (
                                <option
                                    key={option.value}
                                    value={option.value}
                                >
                                  {option.label}
                                </option>
                            ))}
                          </select>

                          <Icon
                              name="chevronDown"
                              size={15}
                              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted"
                          />
                        </div>
                    ) : (
                        <span className="text-sm font-semibold text-secondary">
                      {task.status || 'Not set'}
                    </span>
                    )}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-sm text-muted">Assignee</dt>

                  <dd className="w-[175px]">
                    {assigneeOptions.length > 1 ? (
                        <div className="relative">
                          <select
                              value={assigneeId}
                              onChange={changeAssignee}
                              disabled={isAssigneeSaving}
                              className="h-9 w-full appearance-none rounded-lg border border-line bg-surface py-1.5 pl-3 pr-8 text-xs font-semibold text-secondary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
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

                          <Icon
                              name="chevronDown"
                              size={15}
                              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted"
                          />
                        </div>
                    ) : (
                        <span className="text-sm font-medium text-muted">
                      Unassigned
                    </span>
                    )}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-sm text-muted">Priority</dt>

                  <dd>
                    <Badge
                        variant={
                            priorityVariants[task.priority] || 'secondary'
                        }
                        size="sm"
                        dot
                    >
                      {task.priority || 'Not set'}
                    </Badge>
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-sm text-muted">Due date</dt>

                  <dd
                      className={`text-right text-sm font-semibold ${
                          overdue ? 'text-danger' : 'text-secondary'
                      }`}
                  >
                    {dueDate ? formatTaskDate(dueDate) : 'Not set'}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-sm text-muted">Created by</dt>

                  <dd className="max-w-[180px] truncate text-right text-sm font-semibold text-secondary">
                    {createdBy}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-4 pb-0 pt-3">
                  <dt className="text-sm text-muted">Created</dt>

                  <dd className="text-right text-sm font-semibold text-secondary">
                    {task.createdAt
                        ? formatTaskDate(task.createdAt)
                        : '—'}
                  </dd>
                </div>
              </dl>

              {(isStatusSaving || isAssigneeSaving) && (
                  <p className="mt-4 text-right text-xs font-medium text-primary">
                    Saving changes...
                  </p>
              )}
            </Card>
          </aside>
        </section>

        {isEditOpen && (
            <TaskForm
                task={task}
                statusBoards={statusBoards}
                onClose={() => setIsEditOpen(false)}
                onSuccess={(updatedTask) => {
                  setTask((currentTask) => ({
                    ...currentTask,
                    ...getTask(updatedTask),
                  }));

                  setIsEditOpen(false);
                }}
            />
        )}
      </div>
  );
};

export default TaskDetail;