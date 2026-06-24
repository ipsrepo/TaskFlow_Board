import { createContext, useCallback, useState } from "react";
import * as taskService from "../services/task.service";

export const TaskContext = createContext(null);

export const TaskProvider = ({ children }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchTasks = useCallback(async (projectId, filters) => {
        setLoading(true);
        try {
            const res = await taskService.getTasks(projectId, filters);
            if (res.success) setTasks(res.data.tasks || []);
            return res;
        } finally {
            setLoading(false);
        }
    }, []);

    const createTask = useCallback(async (data) => {
        const res = await taskService.createTask(data);
        if (res.success) {
            setTasks((p) => [res.data.task, ...p]);
        }
        return res;
    }, []);

    const updateTask = useCallback(async (id, data) => {
        const res = await taskService.updateTask(id, data);
        if (res.success) {
            setTasks((p) =>
                p.map((t) => (t._id === id ? res.data.task : t))
            );
        }
        return res;
    }, []);

    const deleteTask = useCallback(async (id) => {
        const res = await taskService.deleteTask(id);
        if (res.success) {
            setTasks((p) => p.filter((t) => t._id !== id));
        }
        return res;
    }, []);

    const updateTaskStatus = useCallback(async (id, status) => {
        const res = await taskService.updateTaskStatus(id, status);
        if (res.success) {
            setTasks((p) =>
                p.map((t) => (t._id === id ? res.data.task : t))
            );
        }
        return res;
    }, []);

    return (
        <TaskContext.Provider
            value={{
                tasks,
                loading,
                fetchTasks,
                createTask,
                updateTask,
                deleteTask,
                updateTaskStatus,
            }}
        >
            {children}
        </TaskContext.Provider>
    );
};