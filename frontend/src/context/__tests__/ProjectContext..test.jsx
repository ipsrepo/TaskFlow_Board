import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectProvider } from '../ProjectContext';
import useProject from '../../hooks/useProject';
import * as projectService from '../../services/project.service';

vi.mock('../../services/project.service', () => ({
  getProjects: vi.fn(),
  getProject: vi.fn(),
  createProject: vi.fn(),
  updateProject: vi.fn(),
  deleteProject: vi.fn(),
  addMember: vi.fn(),
  removeMember: vi.fn(),
}));

const ProjectProbe = () => {
  const { projects, createProject, updateProject, deleteProject } = useProject();

  return (
    <div>
      <p data-testid="project-names">{projects.map((project) => project.name).join(', ') || 'none'}</p>
      <button onClick={() => createProject({ name: 'Website refresh' })}>Create</button>
      <button onClick={() => updateProject('project-1', { name: 'Website v2' })}>Update</button>
      <button onClick={() => deleteProject('project-1')}>Delete</button>
    </div>
  );
};

describe('ProjectProvider integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('keeps project state in sync after create, update, and delete service responses', async () => {
    const user = userEvent.setup();
    projectService.createProject.mockResolvedValue({
      success: true,
      project: { _id: 'project-1', name: 'Website refresh' },
    });
    projectService.updateProject.mockResolvedValue({
      success: true,
      data: { project: { _id: 'project-1', name: 'Website v2' } },
    });
    projectService.deleteProject.mockResolvedValue({ success: true });

    render(<ProjectProvider><ProjectProbe /></ProjectProvider>);

    await user.click(screen.getByRole('button', { name: 'Create' }));
    await waitFor(() => expect(screen.getByTestId('project-names')).toHaveTextContent('Website refresh'));

    await user.click(screen.getByRole('button', { name: 'Update' }));
    await waitFor(() => expect(screen.getByTestId('project-names')).toHaveTextContent('Website v2'));

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(screen.getByTestId('project-names')).toHaveTextContent('none'));

    expect(projectService.createProject).toHaveBeenCalledWith({ name: 'Website refresh' });
    expect(projectService.updateProject).toHaveBeenCalledWith('project-1', { name: 'Website v2' });
    expect(projectService.deleteProject).toHaveBeenCalledWith('project-1');
  });
});
