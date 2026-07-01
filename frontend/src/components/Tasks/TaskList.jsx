import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../../utils/api';
import useAuth from '../../hooks/useAuth';
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

const priorityVariants = { high: 'danger', medium: 'warning', low: 'success' };
const getProject = (response) => response?.project || response?.data?.project || response?.data;

const TaskList = ({ myTasks = false }) => {
  const { projectId } = useParams();
  const { user } = useAuth();
  const { fetchTasks, getMyTasks, deleteTask, updateTaskStatus } = useTask();
  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [statusBoards, setStatusBoards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filters, setFilters] = useState({ search: '', status: '', priority: '' });
  const [error, setError] = useState('');

  const canCreate = !myTasks && (user?.role === 'lead' || user?.role === 'admin');

  const loadTasks = async () => {
    setIsLoading(true);
    setError('');
    if (myTasks) {
      const response = await getMyTasks();
      if (response?.success) setTasks(response.tasks || response.data?.tasks || []);
      else setError(response?.message || 'Unable to load your tasks.');
    } else {
      const [taskResponse, projectResponse] = await Promise.all([fetchTasks(projectId), api.get(`/projects/${projectId}`).then(({ data }) => data).catch(() => null)]);
      const loadedProject = getProject(projectResponse);
      setProject(loadedProject || null);
      setStatusBoards([...(loadedProject?.statusBoards || [])].sort((first, second) => (first.order ?? 0) - (second.order ?? 0)));
      if (taskResponse?.success) setTasks(taskResponse.tasks || taskResponse.data?.tasks || []);
      else setError(taskResponse?.message || 'Unable to load project tasks.');
    }
    setIsLoading(false);
  };

  useEffect(() => { loadTasks(); }, [projectId, myTasks]);

  const visibleTasks = useMemo(() => tasks.filter((task) => {
    const query = filters.search.trim().toLowerCase();
    const matchesSearch = !query || [task.title, task.description, task.assignedTo?.name, task.projectId?.name].filter(Boolean).some((value) => value.toLowerCase().includes(query));
    const matchesStatus = !filters.status || task.status === filters.status;
    const matchesPriority = !filters.priority || task.priority === filters.priority;
    return matchesSearch && matchesStatus && matchesPriority;
  }), [filters, tasks]);

  const updateFilter = (event) => setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));

  const changeStatus = async (taskId, status) => {
    const previousTasks = tasks;
    setTasks((current) => current.map((task) => task._id === taskId ? { ...task, status } : task));
    const response = await updateTaskStatus(taskId, status);
    if (!response?.success) {
      setTasks(previousTasks);
      setError(response?.message || 'Unable to change the task status.');
    }
  };

  const removeTask = async (taskId) => {
    if (!window.confirm('Delete this task? This cannot be undone.')) return;
    const response = await deleteTask(taskId);
    if (response?.success) setTasks((current) => current.filter((task) => task._id !== taskId));
    else setError(response?.message || 'Unable to delete this task.');
  };

  return (
    <div className="page-container space-y-6">
      <header className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {!myTasks && project && <div className="mb-2 flex items-center gap-2 text-sm text-muted"><Link to="/projects" className="hover:text-primary-700">Projects</Link><Icon name="chevronRight" size={15} /><Link to={`/projects/${projectId}`} className="hover:text-primary-700">{project.name}</Link></div>}
          <p className="section-label">{myTasks ? 'Personal work' : 'Project work'}</p><h1 className="page-title mt-1">{myTasks ? 'My tasks' : `${project?.name || 'Project'} tasks`}</h1><p className="page-subtitle">{visibleTasks.length} task{visibleTasks.length === 1 ? '' : 's'} shown</p>
        </div>
        <div className="flex flex-wrap gap-2">{!myTasks && project && <Link to={`/board/${projectId}`}><Button variant="outline" icon={<Icon name="columns" size={17} />}>Board view</Button></Link>}{canCreate && <Button onClick={() => setIsFormOpen(true)} icon={<Icon name="plus" size={17} />}>Add task</Button>}</div>
      </header>

      {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-800">{error}</p>}

      <section className="panel p-3 sm:p-4"><div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_170px_170px]"><Input name="search" value={filters.search} onChange={updateFilter} placeholder="Search tasks" icon="search" />{!myTasks && <Select name="status" value={filters.status} onChange={updateFilter} options={statusBoards.map((board) => ({ value: board.name, label: board.name }))} placeholder="All statuses" />}<Select name="priority" value={filters.priority} onChange={updateFilter} options={[{ value: 'high', label: 'High priority' }, { value: 'medium', label: 'Medium priority' }, { value: 'low', label: 'Low priority' }]} placeholder="All priorities" /></div></section>

      {isLoading ? <div className="space-y-3">{Array.from({ length: 5 }, (_, index) => <CardSkeleton key={index} />)}</div> : visibleTasks.length === 0 ? <div className="panel"><EmptyState title="No tasks found" description={myTasks ? 'You do not have any tasks that match these filters.' : 'Create the first task or adjust the filters.'} icon="tasks" action={canCreate && <Button onClick={() => setIsFormOpen(true)} icon={<Icon name="plus" size={17} />}>Create task</Button>} /></div> : <Card className="overflow-hidden"><div className="hidden grid-cols-[minmax(0,1fr)_150px_150px_120px] gap-5 border-b border-line bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-[0.06em] text-muted lg:grid"><span>Task</span><span>Assignee</span><span>Status</span><span>Due date</span></div><div>{visibleTasks.map((task) => <article key={task._id} className="data-row group grid gap-3 px-4 py-4 sm:px-5 lg:grid-cols-[minmax(0,1fr)_150px_150px_120px] lg:items-center lg:gap-5"><div className="min-w-0"><div className="flex items-start gap-2"><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${task.priority === 'high' ? 'bg-danger' : task.priority === 'medium' ? 'bg-warning' : 'bg-success'}`} /><div className="min-w-0"><Link to={`/tasks/${task._id}`} className="block truncate text-sm font-semibold text-secondary transition-colors hover:text-primary-700">{task.title}</Link><div className="mt-1 flex flex-wrap items-center gap-2"><Badge variant={priorityVariants[task.priority] || 'secondary'} size="sm">{task.priority}</Badge>{task.projectId?.name && <span className="text-xs text-muted">{task.projectId.name}</span>}{task.isOverdue && <span className="text-xs font-medium text-danger">Overdue</span>}</div></div></div></div><div className="flex items-center gap-2 text-sm text-muted">{task.assignedTo ? <><Avatar user={task.assignedTo} size="xs" /><span className="truncate">{task.assignedTo.name}</span></> : <span>Unassigned</span>}</div><div>{statusBoards.length > 0 && !myTasks ? <Select value={task.status} onChange={(event) => changeStatus(task._id, event.target.value)} options={statusBoards.map((board) => ({ value: board.name, label: board.name }))} selectClassName="h-8 text-xs" /> : <Badge variant="secondary" size="sm">{task.status}</Badge>}</div><div className="flex items-center justify-between gap-2 text-sm text-muted"><span className={task.isOverdue ? 'font-medium text-danger' : ''}>{task.deadline ? format(new Date(task.deadline), 'MMM d, yyyy') : 'No due date'}</span>{(user?.role === 'admin' || user?.role === 'lead') && <button type="button" onClick={() => removeTask(task._id)} className="icon-button-sm h-7 w-7 text-slate-300 opacity-0 transition-all hover:bg-red-50 hover:text-danger group-hover:opacity-100" aria-label={`Delete ${task.title}`}><Icon name="trash" size={15} /></button>}</div></article>)}</div></Card>}

      {isFormOpen && <TaskForm projectId={projectId} statusBoards={statusBoards} onClose={() => setIsFormOpen(false)} onSuccess={() => { setIsFormOpen(false); loadTasks(); }} />}
    </div>
  );
};

export default TaskList;
