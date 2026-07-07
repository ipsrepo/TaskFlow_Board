import {useEffect, useMemo, useState} from 'react';
import api from '../../utils/api';
import useAuth from '../../hooks/useAuth';
import useProject from '../../hooks/useProject';
import Alert from '../UI/Alert';
import Avatar from '../UI/Avatar';
import Button from '../UI/Button';
import Icon from '../UI/Icon';
import Input from '../UI/Input';
import Modal from '../UI/Modal';
import Select from '../UI/Select';
import {STATUS_OPTIONS} from "../Common/constants.js";


const getProject = (response) => {
    return response?.project || response?.data?.project || response?.data;
};

const getUserId = (userValue) => {
    return userValue?._id || userValue || '';
};

const ProjectForm = ({onClose, onSuccess, project}) => {
    const {createProject, updateProject} = useProject();
    const {user} = useAuth();

    const isEditing = Boolean(project);
    const canSelectProjectAdmin = user?.role === 'admin';

    const initialLeadId = getUserId(project?.leadId) || user?._id || '';
    const initialMembers = [
        ...new Set([
            ...(project?.members || []).map(getUserId).filter(Boolean),
            initialLeadId,
        ]),
    ];

    const [formValues, setFormValues] = useState({
        name: project?.name || '',
        description: project?.description || '',
        status: project?.status || 'active',
        startDate: project?.startDate
            ? project.startDate.substring(0, 10)
            : '',
        endDate: project?.endDate
            ? project.endDate.substring(0, 10)
            : '',
        leadId: initialLeadId,
        members: initialMembers,
    });

    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);

    useEffect(() => {
        let isMounted = true;

        api
            .get('/users')
            .then(({data}) => {
                if (isMounted) {
                    setUsers(data.users || data.data || []);
                }
            })
            .catch(() => {
                if (isMounted) {
                    setUsers([]);
                }
            })
            .finally(() => {
                if (isMounted) {
                    setIsLoadingUsers(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const availableUsers = useMemo(() => {
        const projectMemberIds = new Set(
            (formValues.members || []).map((member) =>
                typeof member === 'string' ? member : member._id
            )
        );

        const selectedAdminId = formValues.leadId;

        return users.filter((candidate) => {
            return (
                projectMemberIds.has(candidate._id) ||
                candidate._id === selectedAdminId
            );
        });
    }, [users, formValues.members, formValues.leadId]);

    const selectedProjectAdmin = availableUsers.find(
        (candidate) => candidate._id === formValues.leadId
    );

    const updateValue = (event) => {
        const {name, value} = event.target;

        setFormValues((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const selectProjectAdmin = (leadId) => {
        setFormValues((current) => ({
            ...current,
            leadId,
            members: [...new Set([...current.members, leadId])],
        }));
    };

    const submit = async (event) => {
        event.preventDefault();

        const projectName = formValues.name.trim();

        if (!projectName) {
            setError('Project name is required.');
            return;
        }

        if (!formValues.leadId) {
            setError('Select a Project Admin.');
            return;
        }

        if (
            formValues.startDate &&
            formValues.endDate &&
            formValues.endDate < formValues.startDate
        ) {
            setError('The target date cannot be before the start date.');
            return;
        }

        const payload = {
            ...formValues,
            name: projectName,
            members: [...new Set([...formValues.members, formValues.leadId])],
        };

        if (!payload.startDate) {
            delete payload.startDate;
        }

        if (!payload.endDate) {
            delete payload.endDate;
        }

        setError('');
        setIsSubmitting(true);

        try {
            const response = isEditing
                ? await updateProject(project._id, payload)
                : await createProject(payload);

            if (!response?.success) {
                setError(
                    response?.message ||
                    `Unable to ${isEditing ? 'save' : 'create'} the project.`
                );
                return;
            }

            onSuccess?.(getProject(response));
        } catch (requestError) {
            setError(
                requestError?.response?.data?.message ||
                `Unable to ${isEditing ? 'save' : 'create'} the project.`
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen
            onClose={onClose}
            title={isEditing ? 'Edit project' : 'Create new project'}
            subtitle={
                isEditing
                    ? 'Update the project details, owner, and team.'
                    : 'Define ownership first, then add the people working on it.'
            }
            size="xl"
        >
            <form onSubmit={submit} className="space-y-5 p-5 sm:p-6">
                {error && (
                    <Alert
                        type="error"
                        message={error}
                        onClose={() => setError('')}
                    />
                )}

                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.95fr)]">
                    <section className="space-y-4 rounded-2xl border border-line bg-surface p-4 sm:p-5">
                        <div>
                            <h3 className="text-sm font-semibold text-secondary">
                                Project details
                            </h3>
                            <p className="mt-1 text-xs text-muted">
                                Add the essential information for this workspace.
                            </p>
                        </div>

                        <Input
                            label="Project name"
                            name="name"
                            value={formValues.name}
                            onChange={updateValue}
                            placeholder="For example, Marketing website refresh"
                            required
                            autoComplete="off"
                        />

                        <Input
                            label="Description"
                            name="description"
                            type="textarea"
                            value={formValues.description}
                            onChange={updateValue}
                            placeholder="Describe the outcome, scope, and important context."
                            rows={5}
                        />

                        <div className="grid gap-4 sm:grid-cols-2">
                            <Input
                                label="Start date"
                                name="startDate"
                                type="date"
                                value={formValues.startDate}
                                onChange={updateValue}
                            />

                            <Input
                                label="Target date"
                                name="endDate"
                                type="date"
                                value={formValues.endDate}
                                onChange={updateValue}
                            />
                        </div>

                        {isEditing && (
                            <Select
                                label="Project status"
                                name="status"
                                value={formValues.status}
                                onChange={updateValue}
                                options={STATUS_OPTIONS}
                            />
                        )}
                    </section>

                    <section className="space-y-4">
                        <div className="rounded-2xl border border-primary-100 bg-primary-50 p-4">
                            <div className="flex items-start gap-3">
                                <div
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">
                                    1
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-secondary">
                                        Assign ownership
                                    </h3>

                                    <p className="mt-1 text-xs leading-5 text-muted">
                                        The Project Admin is accountable for delivery and is always
                                        included as a team member.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {isLoadingUsers ? (
                            <div className="space-y-3 rounded-2xl border border-line p-4">
                                <div className="h-5 w-32 animate-pulse rounded bg-surfaceSubtle"/>
                                <div className="h-12 animate-pulse rounded-xl bg-surfaceSubtle"/>
                                <div className="h-12 animate-pulse rounded-xl bg-surfaceSubtle"/>
                            </div>
                        ) : (
                            <>
                                <div className="rounded-2xl border border-line bg-surface p-4">
                                    <div className="mb-3">
                                        <h3 className="text-sm font-semibold text-secondary">
                                            Project Lead
                                        </h3>

                                        <p className="mt-1 text-xs text-muted">
                                            Choose who owns this project.
                                        </p>
                                    </div>

                                    {canSelectProjectAdmin ? (
                                        <select
                                            value={formValues.leadId}
                                            onChange={(event) =>
                                                selectProjectAdmin(event.target.value)
                                            }
                                            className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm font-medium text-secondary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                                        >
                                            <option value="">Select Project Admin</option>

                                            {availableUsers.map((candidate) => (
                                                <option
                                                    key={candidate._id}
                                                    value={candidate._id}
                                                >
                                                    {candidate.name} - <i>{candidate.role}</i>
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="flex items-center gap-3 rounded-xl bg-surfaceSubtle p-3">
                                            <Avatar user={user} size="sm"/>

                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-secondary">
                                                    {user?.name}
                                                </p>
                                                <p className="truncate text-xs text-muted">
                                                    You are the Project Admin
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                </div>

                                <div className="rounded-2xl border border-line bg-surface p-4">
                                    <div className="mb-3 flex items-center justify-between gap-3">
                                        <div>
                                            <h3 className="text-sm font-semibold text-secondary">
                                                Team members
                                            </h3>

                                            <p className="mt-1 text-xs text-muted">
                                                Manage project members from the project details page.
                                            </p>
                                        </div>

                                        <span
                                            className="rounded-full bg-primary-50 px-2 py-1 text-xs font-semibold text-primary">
      {formValues.members.length} members
    </span>
                                    </div>

                                    {formValues.members.length > 0 ? (
                                        <div
                                            className="max-h-60 overflow-y-auto rounded-xl border border-line custom-scrollbar">
                                            {formValues.members.map((memberId) => {
                                                const candidate = availableUsers.find(
                                                    (userItem) => userItem._id === memberId
                                                );

                                                if (!candidate) {
                                                    return null;
                                                }

                                                const isProjectAdmin =
                                                    candidate._id === formValues.leadId;

                                                return (
                                                    <div
                                                        key={candidate._id}
                                                        className="flex items-center gap-3 border-b border-line px-3 py-3 last:border-b-0"
                                                    >
                                                        <Avatar user={candidate} size="sm"/>

                                                        <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-secondary">
                {candidate.name}
              </span>

              <span className="block truncate text-xs text-muted">
                {candidate.email}
              </span>
            </span>

                                                        {isProjectAdmin ? (
                                                            <span
                                                                className="rounded-full bg-primary px-2 py-1 text-[10px] font-semibold text-white">
                Admin
              </span>
                                                        ) : (
                                                            <span className="text-xs capitalize text-muted">
                {candidate.role}
              </span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div
                                            className="rounded-xl border border-dashed border-line bg-surfaceSubtle px-4 py-7 text-center">
                                            <Icon name="users" size={18} className="mx-auto text-muted"/>

                                            <p className="mt-2 text-sm font-medium text-secondary">
                                                No members added
                                            </p>

                                            <p className="mt-1 text-xs text-muted">
                                                Add members after creating the project.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </section>
                </div>

                <div
                    className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-muted">
                        Project Admin is automatically added to team members.
                    </p>

                    <div className="flex flex-col-reverse gap-3 sm:flex-row">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            loading={isSubmitting}
                            icon={<Icon name="check" size={17}/>}
                        >
                            {isEditing ? 'Save changes' : 'Create project'}
                        </Button>
                    </div>
                </div>
            </form>
        </Modal>
    );
};

export default ProjectForm;