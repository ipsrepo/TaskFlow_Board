import {useEffect, useMemo, useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useProject from '../../hooks/useProject';
import Button from '../UI/Button';
import EmptyState from '../UI/EmptyState';
import Icon from '../UI/Icon';
import Input from '../UI/Input';
import {CardSkeleton} from '../UI/Loading';
import ProjectCard from './ProjectCard';
import ProjectForm from './ProjectForm';
import {ADMIN} from "../Common/constants.js";

const statusFilters = ['all', 'active', 'on-hold', 'completed', 'cancelled'];

const ProjectList = () => {
    const {projects, fetchProjects} = useProject();
    const {user} = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(
        searchParams.get('new') === 'true'
    );
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState(
        searchParams.get('search') || ''
    );

    const canCreate = user?.role === ADMIN;

    useEffect(() => {
        fetchProjects().finally(() => setIsLoading(false));
    }, [fetchProjects]);

    useEffect(() => {
        const requestedSearch = searchParams.get('search') || '';
        const shouldOpenCreate = searchParams.get('new') === 'true';

        setSearchTerm(requestedSearch);

        if (shouldOpenCreate && canCreate) {
            setIsFormOpen(true);
        }
    }, [searchParams, canCreate]);

    const filteredProjects = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        return (projects || []).filter((project) => {
            const matchesStatus =
                statusFilter === 'all' || project.status === statusFilter;

            const searchableValues = [
                project.name,
                project.description,
                project.leadId?.name,
            ].filter(Boolean);

            const matchesSearch =
                !normalizedSearch ||
                searchableValues.some((value) =>
                    value.toLowerCase().includes(normalizedSearch)
                );

            return matchesStatus && matchesSearch;
        });
    }, [projects, searchTerm, statusFilter]);

    const openCreateForm = () => {
        const nextParams = new URLSearchParams(searchParams);

        nextParams.delete('new');
        setSearchParams(nextParams, {replace: true});
        setIsFormOpen(true);
    };

    const handleProjectCreated = async () => {
        setIsFormOpen(false);
        await fetchProjects();
    };

    return (
        <div className="page-container space-y-6">
            <header
                className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="section-label">Workspace</p>
                    <h1 className="page-title mt-1">Projects</h1>
                    <p className="page-subtitle">
                        Plan, track, and collaborate on every active initiative.
                    </p>
                </div>

                {canCreate && (
                    <Button
                        onClick={openCreateForm}
                        icon={<Icon name="plus" size={17}/>}
                    >
                        New project
                    </Button>
                )}
            </header>

            <section className="panel p-3 sm:p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <Input
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Search projects"
                        icon="search"
                        className="flex-1"
                    />

                    <div className="flex flex-wrap gap-1.5">
                        {statusFilters.map((status) => {
                            const isSelected = statusFilter === status;

                            return (
                                <button
                                    key={status}
                                    type="button"
                                    onClick={() => setStatusFilter(status)}
                                    className={`rounded-lg px-3 py-2 text-xs font-semibold capitalize transition-all ${
                                        isSelected
                                            ? 'bg-primary text-white shadow-button'
                                            : 'text-muted hover:bg-primary-50 hover:text-primary'
                                    }`}
                                >
                                    {status === 'all'
                                        ? 'All projects'
                                        : status.replace('-', ' ')}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {Array.from({length: 8}, (_, index) => (
                        <CardSkeleton key={index}/>
                    ))}
                </div>
            ) : filteredProjects.length === 0 ? (
                <div className="panel">
                    <EmptyState
                        title="No projects found"
                        description={
                            searchTerm
                                ? 'Try a different project name or keyword.'
                                : 'Create a project to start organizing work.'
                        }
                        icon="folder"
                        action={
                            canCreate && (
                                <Button
                                    onClick={openCreateForm}
                                    icon={<Icon name="plus" size={17}/>}
                                >
                                    Create project
                                </Button>
                            )
                        }
                    />
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {filteredProjects.map((project) => (
                        <ProjectCard
                            key={project._id}
                            project={project}
                        />
                    ))}
                </div>
            )}

            {isFormOpen && (
                <ProjectForm
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={handleProjectCreated}
                />
            )}
        </div>
    );
};

export default ProjectList;