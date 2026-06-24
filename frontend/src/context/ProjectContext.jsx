import {createContext, useCallback, useState} from "react";
import * as projectService from "../services/project.service";

export const ProjectContext = createContext(null);

export const ProjectProvider = ({children}) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        try {
            const res = await projectService.getProjects();
            if (res.success) setProjects(res.data.data || []);
            return res;
        } finally {
            setLoading(false);
        }
    }, []);

    const createProject = useCallback(async (data) => {
        const res = await projectService.createProject(data);
        if (res.success) {
            setProjects((p) => [res.data.data.project, ...p]);
        }
        return res;
    }, []);

    const updateProject = useCallback(async (id, data) => {
        const res = await projectService.updateProject(id, data);
        if (res.success) {
            setProjects((p) =>
                p.map((x) => (x._id === id ? res.data.data.project : x))
            );
        }
        return res;
    }, []);

    const deleteProject = useCallback(async (id) => {
        const res = await projectService.deleteProject(id);
        if (res.success) {
            setProjects((p) => p.filter((x) => x._id !== id));
        }
        return res;
    }, []);

    return (
        <ProjectContext.Provider
            value={{
                projects,
                loading,
                fetchProjects,
                createProject,
                updateProject,
                deleteProject,
            }}
        >
            {children}
        </ProjectContext.Provider>
    );
};