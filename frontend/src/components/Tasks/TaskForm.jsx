import {useEffect, useMemo, useState} from 'react';
import useAuth from '../../hooks/useAuth';
import useProject from '../../hooks/useProject';
import useTask from '../../hooks/useTask';
import Alert from '../UI/Alert';
import Button from '../UI/Button';
import Icon from '../UI/Icon';
import Input from '../UI/Input';
import Modal from '../UI/Modal';
import Select from '../UI/Select';

const priorityOptions = [
    {value: 'low', label: 'Low priority'},
    {value: 'medium', label: 'Medium priority'},
    {value: 'high', label: 'High priority'},
];

const getId = (value) => {
    if (!value) return '';

    return typeof value === 'string'
        ? value
        : value._id || value.id || '';
};

const TaskForm = ({
                      onClose,
                      onSuccess,
                      task,
                      projectId,
                      defaultStatus = 'todo',
                      statusBoards = [],
                  }) => {
    const {allUsers: users = [], getAllUsers} = useAuth();
    const {projects = [], fetchProjects} = useProject();
    const {createTask, updateTask} = useTask();

    const isEditing = Boolean(task);
    const resolvedProjectId =
        projectId || getId(task?.projectId);

    const [formValues, setFormValues] = useState({
        title: task?.title || '',
        description: task?.description || '',
        assignedTo: getId(task?.assignedTo),
        priority: task?.priority || 'medium',
        deadline: task?.deadline?.substring(0, 10) || '',
        status: task?.status || defaultStatus,
    });

    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchProjects();
        getAllUsers();
    }, [fetchProjects, getAllUsers]);

    const project = useMemo(() => {
        return projects.find(
            (item) => getId(item) === resolvedProjectId
        );
    }, [projects, resolvedProjectId]);

    const boards = useMemo(() => {
        const items =
            statusBoards.length > 0
                ? statusBoards
                : project?.statusBoards || [];

        return [...items].sort(
            (first, second) =>
                (first.order ?? 0) - (second.order ?? 0)
        );
    }, [project?.statusBoards, statusBoards]);

    const memberOptions = useMemo(() => {
        const usersById = new Map(
            users.map((candidate) => [getId(candidate), candidate])
        );

        const members = new Map();

        [project?.leadId, ...(project?.members || [])]
            .filter(Boolean)
            .forEach((member) => {
                const memberId = getId(member);
                const user = usersById.get(memberId);

                if (user) {
                    members.set(memberId, user);
                }
            });

        return [...members.values()].map((member) => ({
            value: getId(member),
            label: member.name || member.email || 'Team member',
        }));
    }, [project?.leadId, project?.members, users]);

    const statusOptions = useMemo(() => {
        return boards.map((board) => ({
            value: board.name,
            label: board.name,
        }));
    }, [boards]);

    const updateValue = (event) => {
        const {name, value} = event.target;

        setFormValues((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const submit = async (event) => {
        event.preventDefault();

        const title = formValues.title.trim();

        if (!title) {
            setError('Task title is required.');
            return;
        }

        if (!resolvedProjectId) {
            setError('This task is not linked to a project.');
            return;
        }

        const payload = {
            ...formValues,
            title,
            projectId: resolvedProjectId,
            assignedTo: formValues.assignedTo || null,
            deadline: formValues.deadline || null,
        };

        setError('');
        setIsSubmitting(true);

        try {
            const response = isEditing
                ? await updateTask(task._id, payload)
                : await createTask(payload);

            if (!response?.success) {
                throw new Error(
                    response?.message ||
                    `Unable to ${isEditing ? 'update' : 'create'} the task.`
                );
            }

            onSuccess?.();
        } catch (requestError) {
            setError(
                requestError?.response?.data?.message ||
                requestError?.message ||
                `Unable to ${isEditing ? 'update' : 'create'} the task.`
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen
            onClose={onClose}
            title={isEditing ? 'Edit task' : 'Create task'}
            subtitle={
                isEditing
                    ? 'Update the task details and workflow stage.'
                    : 'Add a task to the current project.'
            }
            size="md"
        >
            <form onSubmit={submit} className="space-y-5 p-5 sm:p-6">
                {error && (
                    <Alert
                        type="error"
                        message={error}
                        onClose={() => setError('')}
                    />
                )}

                <Input
                    label="Task title"
                    name="title"
                    value={formValues.title}
                    onChange={updateValue}
                    placeholder="What needs to be done?"
                    required
                    autoComplete="off"
                />

                <Input
                    label="Description"
                    name="description"
                    type="textarea"
                    value={formValues.description}
                    onChange={updateValue}
                    placeholder="Add context, acceptance criteria, or useful links."
                    rows={4}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                    <Select
                        label="Priority"
                        name="priority"
                        value={formValues.priority}
                        onChange={updateValue}
                        options={priorityOptions}
                    />

                    {statusOptions.length > 0 && (
                        <Select
                            label="Status"
                            name="status"
                            value={formValues.status}
                            onChange={updateValue}
                            options={statusOptions}
                        />
                    )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Select
                        label="Assignee"
                        name="assignedTo"
                        value={formValues.assignedTo}
                        onChange={updateValue}
                        options={memberOptions}
                        placeholder="Unassigned"
                    />

                    <Input
                        label="Due date"
                        name="deadline"
                        type="date"
                        value={formValues.deadline}
                        onChange={updateValue}
                        helpText="Optional"
                    />
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        loading={isSubmitting}
                        icon={<Icon name="check" size={17}/>}
                    >
                        {isEditing ? 'Save changes' : 'Create task'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default TaskForm;