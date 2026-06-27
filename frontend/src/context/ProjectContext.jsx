import { createContext, useCallback, useState } from 'react';
import * as projectService from '../services/project.service';

export const ProjectContext = createContext(null);

const getProject = (response) => response?.project || response?.data?.project || response?.data;
const getProjects = (response) => {
  if (Array.isArray(response?.projects)) return response.projects;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.projects)) return response.data.projects;
  return [];
};

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    const response = await projectService.getProjects();
    if (response?.success) setProjects(getProjects(response));
    setLoading(false);
    return response;
  }, []);

  const fetchProject = useCallback(async (projectId) => {
    const response = await projectService.getProject(projectId);
    return response?.success ? getProject(response) : undefined;
  }, []);

  const createProject = useCallback(async (projectData) => {
    const response = await projectService.createProject(projectData);
    const project = getProject(response);
    if (response?.success && project) setProjects((current) => [project, ...current]);
    return response;
  }, []);

  const updateProject = useCallback(async (projectId, projectData) => {
    const response = await projectService.updateProject(projectId, projectData);
    const project = getProject(response);
    if (response?.success && project) setProjects((current) => current.map((item) => item._id === projectId ? project : item));
    return response;
  }, []);

  const deleteProject = useCallback(async (projectId) => {
    const response = await projectService.deleteProject(projectId);
    if (response?.success) setProjects((current) => current.filter((item) => item._id !== projectId));
    return response;
  }, []);

  const addMember = useCallback(async (projectId, userId) => {
    const response = await projectService.addMember(projectId, userId);
    const project = getProject(response);
    if (response?.success && project) setProjects((current) => current.map((item) => item._id === projectId ? project : item));
    return response;
  }, []);

  const removeMember = useCallback(async (projectId, userId) => {
    const response = await projectService.removeMember(projectId, userId);
    const project = getProject(response);
    if (response?.success && project) setProjects((current) => current.map((item) => item._id === projectId ? project : item));
    return response;
  }, []);

  return (
    <ProjectContext.Provider value={{ projects, loading, fetchProjects, fetchProject, createProject, updateProject, deleteProject, addMember, removeMember }}>
      {children}
    </ProjectContext.Provider>
  );
};
