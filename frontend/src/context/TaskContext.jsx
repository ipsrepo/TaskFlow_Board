import {createContext, useCallback, useState} from 'react';
import * as taskService from '../services/task.service';

export const TaskContext = createContext(null);

const getTask = (response) => response?.task || response?.data?.task || response?.data;
const getTasks = (response) => response?.tasks || response?.data?.tasks || [];

export const TaskProvider = ({children}) => {
    const [tasks, setTasks] = useState([]);
    const [currentTask, setCurrentTask] = useState({});
    const [loading, setLoading] = useState(false);

    const fetchTasks = useCallback(async (projectId, filters) => {
        setLoading(true);
        const response = await taskService.getTasks(projectId, filters);
        if (response?.success) setTasks(getTasks(response));
        setLoading(false);
        return response;
    }, []);

    const fetchTask = useCallback(async (taskId) => {
        const response = await taskService.getTask(taskId);
        return response?.success ? setCurrentTask(response.data) : undefined;
    }, []);

    const createTask = useCallback(async (taskData) => {
        const response = await taskService.createTask(taskData);
        const task = getTask(response);
        if (response?.success && task) setTasks((current) => [task, ...current]);
        return response;
    }, []);

    const getMyTasks = useCallback(async (filters) => {
        setLoading(true);
        const response = await taskService.getMyTasks(filters);
        if (response?.success) setTasks(getTasks(response));
        setLoading(false);
        return response;
    }, []);

    const updateTask = useCallback(async (taskId, taskData) => {
        const response = await taskService.updateTask(taskId, taskData);
        const task = getTask(response);
        if (response?.success && task) setTasks((current) => current.map((item) => item._id === taskId ? task : item));
        return response;
    }, []);

    const deleteTask = useCallback(async (taskId) => {
        const response = await taskService.deleteTask(taskId);
        if (response?.success) setTasks((current) => current.filter((item) => item._id !== taskId));
        return response;
    }, []);

    const updateTaskStatus = useCallback(async (taskId, status) => {
        const response = await taskService.updateTaskStatus(taskId, status);
        const task = getTask(response);
        if (response?.success && task) setTasks((current) => current.map((item) => item._id === taskId ? task : item));
        return response;
    }, []);

    const addComment = useCallback(async (taskId, text) => {
        const response = await taskService.addComment(taskId, text);
        const task = getTask(response);
        if (response?.success && task) setTasks((current) => current.map((item) => item._id === taskId ? task : item));
        return response;
    }, []);

    const fetchKanban = useCallback(async (projectId) => taskService.getKanban(projectId), []);

    return (
        <TaskContext.Provider value={{
            tasks,
            currentTask,
            loading,
            fetchTasks,
            fetchTask,
            getMyTasks,
            createTask,
            updateTask,
            deleteTask,
            updateTaskStatus,
            addComment,
            fetchKanban
        }}>
            {children}
        </TaskContext.Provider>
    );
};
