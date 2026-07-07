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

const priorityVariants = {high: 'danger', medium: 'warning', low: 'success'};

const MemberDashboard = () => {
    const {user} = useAuth();
    const {getMyTasks} = useTask();
    const {fetchProjects, projects} = useProject();
    const [myTasks, setMyTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadDashboard = async () => {
            const [taskResponse] = await Promise.all([getMyTasks(), fetchProjects()]);
            if (taskResponse?.success) setMyTasks(taskResponse.tasks || taskResponse.data?.tasks || []);
            setIsLoading(false);
        };
        loadDashboard();
    }, [fetchProjects, getMyTasks]);

    const myProjects = useMemo(() =>
        projects?.filter((project) => project?.members?.includes(user?._id)), [projects, user?._id]);

    const activeTasks = useMemo(() => myTasks.filter((task) => task.status !== 'completed'), [myTasks]);
    const completedTasks = useMemo(() => myTasks.filter((task) => task.status === 'completed'), [myTasks]);
    const overdueTasks = useMemo(() => activeTasks.filter((task) => task.isOverdue), [activeTasks]);

    return (
        <div className="page-container space-y-7">
            <header className="border-b border-line pb-5"><p className="section-label">Personal workspace</p><h1
                className="page-title mt-1">Good to see you, {user?.name?.split(' ')[0] || 'there'}</h1><p
                className="page-subtitle">Here is a focused view of your work and upcoming priorities.</p></header>

            {isLoading ?
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({length: 4}, (_, index) =>
                    <CardSkeleton key={index}/>)}</div> :
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Assigned tasks"
                                                                                    value={myTasks.length} icon="tasks"
                                                                                    tone="primary"/><StatCard
                    label="In progress" value={activeTasks.length} icon="target" tone="warning"/><StatCard
                    label="Completed" value={completedTasks.length} icon="check" tone="success"/><StatCard
                    label="Overdue" value={overdueTasks.length} icon="flag" tone="danger"/></div>}

            <section>
                <div className="mb-4 flex items-center justify-between">
                    <div><p className="section-label">Task focus</p><h2 className="section-title mt-1">Your active
                        tasks</h2></div>
                    <Link to="/my-tasks"
                          className="inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:underline">View
                        all<Icon name="arrowRight" size={16}/></Link></div>
                {isLoading ? <div className="space-y-3">{Array.from({length: 3}, (_, index) => <CardSkeleton
                    key={index}/>)}</div> : activeTasks.length ?
                    <Card className="overflow-hidden">{activeTasks.slice(0, 5).map((task) => <Link key={task._id}
                                                                                                   to={`/tasks/${task._id}`}
                                                                                                   className="data-row flex items-center gap-3 px-5 py-4"><span
                        className={`h-2 w-2 shrink-0 rounded-full ${task.priority === 'high' ? 'bg-danger' : task.priority === 'medium' ? 'bg-warning' : 'bg-success'}`}/>
                        <div className="min-w-0 flex-1"><p
                            className="truncate text-sm font-semibold text-secondary hover:text-primary-700">{task.title}</p>
                            <p className="mt-1 truncate text-xs text-muted">{task.projectId?.name || 'Project task'}</p>
                        </div>
                        <Badge variant={priorityVariants[task.priority] || 'secondary'}
                               size="sm">{task.priority}</Badge><span
                            className={`hidden text-xs sm:block ${task.isOverdue ? 'font-semibold text-danger' : 'text-muted'}`}>{task.deadline ? (task.isOverdue ? 'Overdue' : `Due ${formatDistanceToNow(new Date(task.deadline), {addSuffix: true})}`) : 'No due date'}</span></Link>)}</Card> :
                    <div className="panel"><EmptyState title="No active tasks"
                                                       description="You are clear for now. Check your projects for new work."
                                                       icon="check"/></div>}</section>

            <section>
                <div className="mb-4 flex items-center justify-between">
                    <div><p className="section-label">Collaborative work</p><h2 className="section-title mt-1">Projects
                        you can access</h2></div>
                    <Link to="/projects"
                          className="inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:underline">All
                        projects<Icon name="arrowRight" size={16}/></Link></div>
                {isLoading ?
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({length: 3}, (_, index) =>
                        <CardSkeleton key={index}/>)}</div> : myProjects.length ?
                        <div
                            className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{myProjects.slice(0, 6).map((project) =>
                            <Link key={project._id} to={`/projects/${project._id}`}><Card hover className="h-full p-5">
                                <div className="flex items-start justify-between gap-3"><h3
                                    className="min-w-0 truncate text-sm font-semibold text-secondary">{project.name}</h3>
                                    <Badge variant={project.status === 'active' ? 'success' : 'secondary'}
                                           size="sm">{project.status}</Badge></div>
                                <p className="mt-2 line-clamp-2 text-sm leading-5 text-muted">{project.description || 'No description yet.'}</p>
                                <div className="mt-4 flex items-center gap-1.5 text-xs text-muted"><Icon name="users"
                                                                                                         size={14}/>{project.members?.length || 0} members
                                </div>
                            </Card></Link>)}</div> : <div className="panel"><EmptyState title="No projects yet"
                                                                                        description="Projects shared with you will appear here."
                                                                                        icon="folder"/></div>}</section>
        </div>
    );
};

export default MemberDashboard;
