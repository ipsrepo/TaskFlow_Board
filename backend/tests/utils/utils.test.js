jest.mock('../../models/projectModel', () => ({
    findById: jest.fn(),
}));

const Project = require('../../models/projectModel');
const AppError = require('../../utils/appError');
const {
    filterObj,
    getProjectbasedId,
    getStatusBoard,
    saveAndPopulate,
    sendSuccess,
} = require('../../utils/utils');
const {createResponse} = require('../helpers/http');

describe('utility helpers', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('filters out keys that are not explicitly allowed', () => {
        const result = filterObj(
            {name: 'Sancia', email: 'sancia@example.com', role: 'admin', password: 'secret'},
            'name',
            'email',
        );

        expect(result).toEqual({name: 'Sancia', email: 'sancia@example.com'});
    });

    it('gets a project by id', async () => {
        const project = {_id: 'project-1'};
        Project.findById.mockResolvedValue(project);

        await expect(getProjectbasedId('project-1')).resolves.toBe(project);
        expect(Project.findById).toHaveBeenCalledWith('project-1');
    });

    it('rejects with AppError when a project does not exist', async () => {
        Project.findById.mockResolvedValue(null);

        await expect(getProjectbasedId('missing-project')).rejects.toMatchObject({
            message: 'Project not found',
            statusCode: 404,
        });
    });

    it('finds a status board case-insensitively', () => {
        const todoBoard = {name: 'ToDo', order: 0};
        const project = {statusBoards: [todoBoard]};

        expect(getStatusBoard(project, 'todo')).toBe(todoBoard);
    });

    it('throws a 404 AppError when a requested board is absent', () => {
        const project = {statusBoards: [{name: 'todo'}]};

        expect(() => getStatusBoard(project, 'done')).toThrow(AppError);
        expect(() => getStatusBoard(project, 'done')).toThrow(
            'Status board not found'
        );
    });

    it('saves and populates a project before returning it', async () => {
        const project = {
            save: jest.fn().mockResolvedValue(),
            populate: jest.fn().mockResolvedValue(),
        };

        await expect(saveAndPopulate(project, 'leadId members')).resolves.toBe(project);
        expect(project.save).toHaveBeenCalledTimes(1);
        expect(project.populate).toHaveBeenCalledWith('leadId members');
    });

    it('sends a standard success response', () => {
        const res = createResponse();

        const result = sendSuccess(res, {project: {_id: 'project-1'}}, 'Created', 201);

        expect(result).toBe(res);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Created',
            project: {_id: 'project-1'},
        });
    });
});
