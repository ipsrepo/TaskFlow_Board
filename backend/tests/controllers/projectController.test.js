jest.mock('../../models/projectModel', () => ({
  create: jest.fn(),
  findById: jest.fn(),
  find: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));

jest.mock('../../utils/utils', () => ({
  getProjectbasedId: jest.fn(),
  saveAndPopulate: jest.fn(),
  getStatusBoard: jest.fn(),
}));

const Project = require('../../models/projectModel');
const { getProjectbasedId, saveAndPopulate } = require('../../utils/utils');
const projectController = require('../../controllers/projectController');
const { createResponse } = require('../helpers/http');

describe('projectController unit tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('validates required project fields before creating a project', async () => {
    const next = jest.fn();

    await projectController.createProject(
      { body: { name: 'Launch' }, user: { id: 'user-1' } },
      createResponse(),
      next,
    );

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Please provide name, description, startDate, and endDate',
        statusCode: 400,
      }),
    );
    expect(Project.create).not.toHaveBeenCalled();
  });

  it('rejects malformed project dates', async () => {
    const next = jest.fn();

    await projectController.createProject(
      {
        body: {
          name: 'Launch',
          description: 'New product launch',
          startDate: 'not-a-date',
          endDate: '2026-12-10',
        },
        user: { id: 'user-1' },
      },
      createResponse(),
      next,
    );

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Invalid startDate / endDate format', statusCode: 400 }),
    );
  });

  it('rejects projects whose end date is not after the start date', async () => {
    const next = jest.fn();

    await projectController.createProject(
      {
        body: {
          name: 'Launch',
          description: 'New product launch',
          startDate: '2026-12-10',
          endDate: '2026-12-10',
        },
        user: { id: 'user-1' },
      },
      createResponse(),
      next,
    );

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'End date must be after start date', statusCode: 400 }),
    );
  });

  it('does not create a status board without name and color', async () => {
    getProjectbasedId.mockResolvedValue({ statusBoards: [] });
    const res = createResponse();

    await projectController.createStatusBoard(
      { params: { id: 'project-1' }, body: { name: 'Review' } },
      res,
      jest.fn(),
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Name and color are required',
    });
  });

  it('prevents duplicate status board names case-insensitively', async () => {
    getProjectbasedId.mockResolvedValue({ statusBoards: [{ name: 'Todo', order: 0 }] });
    const res = createResponse();

    await projectController.createStatusBoard(
      {
        params: { id: 'project-1' },
        body: { name: 'todo', color: '#ffffff' },
      },
      res,
      jest.fn(),
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Status board with this name already exists',
    });
  });

});
