import {useEffect, useMemo, useState} from 'react';
import {Link} from 'react-router-dom';
import api from '../../utils/api';
import useProject from '../../hooks/useProject';
import Avatar from '../UI/Avatar';
import Badge from '../UI/Badge';
import Card from '../UI/Card';
import EmptyState from '../UI/EmptyState';
import Icon from '../UI/Icon';
import {CardSkeleton} from '../UI/Loading';
import StatCard from '../UI/StatCard';
import useAuth from "../../hooks/useAuth.js";

const roleVariants = {admin: 'danger', lead: 'warning', member: 'primary'};

const AdminDashboard = () => {
    const {fetchProjects, projects} = useProject();
    const {
        allUsers: users = [],
        getAllUsers,
        loading: isLoading,
    } = useAuth();

    useEffect(() => {
        const loadDashboard = async () => {
            const [, userResponse] = await Promise.all([fetchProjects(), getAllUsers()]);
        };
        loadDashboard();
    }, [fetchProjects]);

    const activeProjects = useMemo(() => projects.filter((project) => project.status === 'active').length, [projects]);
    const admins = useMemo(() => users.filter((candidate) => candidate.role === 'admin').length, [users]);

    return (
        <div className="page-container space-y-7">
            <header className="border-b border-line pb-5"><p className="section-label">Administration</p><h1
                className="page-title mt-1">Workspace overview</h1><p className="page-subtitle">A concise view of
                people, projects, and active delivery across the workspace.</p></header>
            {isLoading ?
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({length: 4}, (_, index) =>
                    <CardSkeleton key={index}/>)}</div> :
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Workspace users"
                                                                                    value={users.length} icon="users"
                                                                                    tone="primary"/><StatCard
                    label="Total projects" value={projects.length} icon="folder" tone="info"/><StatCard
                    label="Active projects" value={activeProjects} icon="target" tone="success"/><StatCard
                    label="Administrators" value={admins} icon="settings" tone="warning"/></div>}
            <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
                <div>
                    <div className="mb-4 flex items-center justify-between">
                        <div><p className="section-label">Delivery</p><h2 className="section-title mt-1">Recent
                            projects</h2></div>
                        <Link to="/projects"
                              className="inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:underline">All
                            projects<Icon name="arrowRight" size={16}/></Link></div>
                    {isLoading ?
                        <div className="grid gap-4 md:grid-cols-2">{Array.from({length: 4}, (_, index) => <CardSkeleton
                            key={index}/>)}</div> : projects.length ?
                            <div className="grid gap-4 md:grid-cols-2">{projects.slice(0, 6).map((project) => <Link
                                key={project._id} to={`/projects/${project._id}`}><Card hover className="h-full p-5">
                                <div className="flex items-start justify-between gap-3"><h3
                                    className="min-w-0 truncate text-sm font-semibold text-secondary">{project.name}</h3>
                                    <Badge variant={project.status === 'active' ? 'success' : 'secondary'}
                                           size="sm">{project.status}</Badge></div>
                                <p className="mt-2 line-clamp-2 text-sm leading-5 text-muted">{project.description || 'No description yet.'}</p>
                                <div className="mt-4 flex items-center gap-2 text-xs text-muted"><Avatar
                                    user={project.leadId} size="xs"/><span
                                    className="truncate">{project.leadId?.name || 'Project lead'}</span></div>
                            </Card></Link>)}</div> : <div className="panel"><EmptyState title="No projects yet"
                                                                                        description="Projects will appear here once teams create them."
                                                                                        icon="folder"/></div>}</div>
                <aside>
                    <div className="mb-4 flex items-center justify-between">
                        <div><p className="section-label">Access</p><h2 className="section-title mt-1">Recently added
                            users</h2></div>
                        <Link to="/users"
                              className="inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:underline">Manage<Icon
                            name="arrowRight" size={16}/></Link></div>
                    {isLoading ? <div className="space-y-3">{Array.from({length: 4}, (_, index) => <CardSkeleton
                        key={index}/>)}</div> : users.length ?
                        <Card className="overflow-hidden">{users.slice(0, 7).map((candidate) => <div key={candidate._id}
                                                                                                     className="data-row flex items-center gap-3 px-4 py-3.5">
                            <Avatar user={candidate} size="sm"/>
                            <div className="min-w-0 flex-1"><p
                                className="truncate text-sm font-semibold text-secondary">{candidate.name}</p><p
                                className="truncate text-xs text-muted">{candidate.email}</p></div>
                            <Badge variant={roleVariants[candidate.role] || 'secondary'}
                                   size="sm">{candidate.role}</Badge></div>)}</Card> :
                        <div className="panel"><EmptyState title="No users yet" icon="users"/></div>}</aside>
            </section>
        </div>);
};

export default AdminDashboard;
