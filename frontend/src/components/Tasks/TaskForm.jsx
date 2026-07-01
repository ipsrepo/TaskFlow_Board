import { useEffect, useMemo, useState } from 'react';
import api from '../../utils/api';
import useTask from '../../hooks/useTask';
import Alert from '../UI/Alert';
import Button from '../UI/Button';
import Icon from '../UI/Icon';
import Input from '../UI/Input';
import Modal from '../UI/Modal';
import Select from '../UI/Select';

const priorityOptions = [
  { value: 'low', label: 'Low priority' },
  { value: 'medium', label: 'Medium priority' },
  { value: 'high', label: 'High priority' },
];

const getProject = (response) => response?.project || response?.data?.project || response?.data;
const getTask = (response) => response?.task || response?.data?.task || response?.data;

const TaskForm = ({ onClose, onSuccess, task, projectId, defaultStatus = 'todo', statusBoards = [] }) => {
  const { createTask, updateTask } = useTask();
  const isEditing = Boolean(task);
  const resolvedProjectId = projectId || task?.projectId?._id || task?.projectId;
  const [formValues, setFormValues] = useState({
    title: task?.title || '',
    description: task?.description || '',
    assignedTo: task?.assignedTo?._id || task?.assignedTo || '',
    priority: task?.priority || 'medium',
    deadline: task?.deadline ? task.deadline.substring(0, 10) : '',
    status: task?.status || defaultStatus,
  });
  const [members, setMembers] = useState([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!resolvedProjectId) return undefined;
    let isMounted = true;
    api.get(`/projects/${resolvedProjectId}`)
      .then(({ data }) => {
        const project = getProject(data);
        if (!isMounted || !project) return;
        const uniqueMembers = [project.leadId, ...(project.members || [])].filter(Boolean).filter((member, index, list) => list.findIndex((item) => (item._id || item) === (member._id || member)) === index);
        setMembers(uniqueMembers);
      })
      .catch(() => {
        if (isMounted) setMembers([]);
      });
    return () => { isMounted = false; };
  }, [resolvedProjectId]);

  const boardOptions = useMemo(() => statusBoards.map((board) => ({ value: board.name, label: board.name })), [statusBoards]);
  const memberOptions = useMemo(() => members.map((member) => ({ value: member._id || member, label: `${member.name || 'Unknown'}${member.role ? ` · ${member.role}` : ''}` })), [members]);

  const updateValue = (event) => {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!formValues.title.trim()) {
      setError('Task title is required.');
      return;
    }
    if (!resolvedProjectId) {
      setError('This task is not linked to a project.');
      return;
    }

    const payload = { ...formValues, title: formValues.title.trim(), projectId: resolvedProjectId };
    if (!payload.deadline) delete payload.deadline;
    if (!payload.assignedTo) delete payload.assignedTo;

    setError('');
    setIsSubmitting(true);
    const response = isEditing ? await updateTask(task._id, payload) : await createTask(payload);
    setIsSubmitting(false);

    if (!response?.success) {
      setError(response?.message || `Unable to ${isEditing ? 'update' : 'create'} the task.`);
      return;
    }

    onSuccess?.(getTask(response));
  };

  return (
    <Modal isOpen onClose={onClose} title={isEditing ? 'Edit task' : 'Create task'} subtitle={isEditing ? 'Update the task details and workflow stage.' : 'Add a task to the current project.'} size="md">
      <form onSubmit={submit} className="space-y-5 p-5 sm:p-6">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        <Input label="Task title" name="title" value={formValues.title} onChange={updateValue} placeholder="What needs to be done?" required autoComplete="off" />
        <Input label="Description" name="description" type="textarea" value={formValues.description} onChange={updateValue} placeholder="Add context, acceptance criteria, or useful links." rows={4} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Priority" name="priority" value={formValues.priority} onChange={updateValue} options={priorityOptions} />
          {boardOptions.length > 0 && <Select label="Status" name="status" value={formValues.status} onChange={updateValue} options={boardOptions} />}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Assignee" name="assignedTo" value={formValues.assignedTo} onChange={updateValue} options={memberOptions} placeholder="Unassigned" />
          <Input label="Due date" name="deadline" type="date" value={formValues.deadline} onChange={updateValue} helpText="Optional" />
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={isSubmitting} icon={<Icon name="check" size={17} />}>{isEditing ? 'Save changes' : 'Create task'}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskForm;
