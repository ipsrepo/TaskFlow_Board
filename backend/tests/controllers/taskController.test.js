jest.mock('../../models/taskModel', () => ({
    create: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
}));

jest.mock('../../models/projectModel', () => ({
    findById: jest.fn(),
}));

const Task = require('../../models/taskModel');
const Project = require('../../models/projectModel');
const taskController = require('../../controllers/taskController');
const {createResponse} = require('../helpers/http');

describe('taskController unit tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('rejects task creation without title and project id', async () => {
        const res = createResponse();

        await taskController.createTask(
            {body: {description: 'Missing fields'}, user: {_id: 'user-1'}},
            res,
            jest.fn(),
        );

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Title and project are required',
        });
        expect(Project.findById).not.toHaveBeenCalled();
    });

    it('returns 404 when creating a task for a missing project', async () => {
        Project.findById.mockResolvedValue(null);
        const res = createResponse();

        await taskController.createTask(
            {
                body: {title: 'Write tests', projectId: 'missing-project'},
                user: {_id: 'user-1'},
            },
            res,
            jest.fn(),
        );

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({success: false, message: 'Project not found'});
        expect(Task.create).not.toHaveBeenCalled();
    });

    it('does not allow unrelated users to update task status', async () => {
        Task.findById.mockResolvedValue({
            assignedTo: {toString: () => 'user-2'},
            createdBy: {toString: () => 'user-3'},
        });
        const res = createResponse();

        await taskController.updateTaskStatus(
            {
                params: {id: 'task-1'},
                body: {status: 'completed'},
                user: {_id: 'user-1', role: 'member'},
            },
            res,
            jest.fn(),
        );

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Not authorized to update this task',
        });
    });

    it('requires a status when an authorized user updates a task', async () => {
        Task.findById.mockResolvedValue({
            assignedTo: {toString: () => 'user-1'},
            createdBy: {toString: () => 'user-2'},
        });
        const res = createResponse();

        await taskController.updateTaskStatus(
            {
                params: {id: 'task-1'},
                body: {},
                user: {_id: 'user-1', role: 'member'},
            },
            res,
            jest.fn(),
        );

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({success: false, message: 'Status is required'});
    });

});
