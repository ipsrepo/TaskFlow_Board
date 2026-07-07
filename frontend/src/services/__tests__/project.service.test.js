import {beforeEach, describe, expect, it, vi} from 'vitest';
import api from '../../utils/api';
import requestHandler from '../../utils/requestHandler';
import {
    addMember,
    createProject,
    deleteProject,
    getProject,
    getProjects,
    removeMember,
    updateProject,
} from '../project.service';

vi.mock('../../utils/api', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
}));

vi.mock('../../utils/requestHandler', () => ({
    default: vi.fn(),
}));

describe('project.service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        requestHandler.mockImplementation((apiCall) => apiCall());
    });

    it('gets the project collection and a project by id', async () => {
        api.get.mockResolvedValue({data: {success: true}});

        await getProjects();
        await getProject('project-1');

        expect(requestHandler).toHaveBeenCalledTimes(2);
        expect(api.get).toHaveBeenNthCalledWith(1, '/projects');
        expect(api.get).toHaveBeenNthCalledWith(2, '/projects/project-1');
    });

    it('creates and updates a project with the supplied data', async () => {
        const createPayload = {name: 'Website refresh'};
        const updatePayload = {name: 'Website v2'};
        api.post.mockResolvedValue({data: {success: true}});
        api.put.mockResolvedValue({data: {success: true}});

        await createProject(createPayload);
        await updateProject('project-1', updatePayload);

        expect(api.post).toHaveBeenCalledWith('/projects', createPayload);
        expect(api.put).toHaveBeenCalledWith('/projects/project-1', updatePayload);
    });

    it('adds and removes the requested member from a project', async () => {
        api.post.mockResolvedValue({data: {success: true}});
        api.delete.mockResolvedValue({data: {success: true}});

        await addMember('project-1', 'user-1');
        await removeMember('project-1', 'user-1');

        expect(api.post).toHaveBeenCalledWith('/projects/project-1/members', {userId: 'user-1'});
        expect(api.delete).toHaveBeenCalledWith('/projects/project-1/members/user-1');
    });

    it('deletes the requested project through requestHandler', async () => {
        api.delete.mockResolvedValue({data: {success: true}});

        await deleteProject('project-1');

        expect(requestHandler).toHaveBeenCalledTimes(1);
        expect(api.delete).toHaveBeenCalledWith('/projects/project-1');
    });
});
