const Task = require('../models/taskModel');
const factory = require('./handlerFactory');
const Project = require('../models/projectModel');

exports.createTask =  async (req, res, next) => {
    try {
        const { title, description, projectId, assignedTo, priority, deadline, status } = req.body;
        if (!title || !projectId) {
            return res.status(400).json({ success: false, message: 'Title and project are required' });
        }

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ success: false, message: 'Project not found' });


        const task = await Task.create({
            title,
            description,
            projectId,
            assignedTo: assignedTo || null,
            createdBy: req.user._id,
            priority: priority || 'medium',
            deadline: deadline || null,
            status: status || 'todo',
        });

        await task.populate([
            { path: 'assignedTo', select: 'name email avatar' },
            { path: 'createdBy', select: 'name email avatar' },
            { path: 'projectId', select: 'name' },
        ]);

        res.status(201).json({ success: true, task });
    } catch (error) {
        next(error);
    }
};


// Get the Task based on requested user ID

exports.getMyTasks = async (req, res, next) => {
    try {
        const { status, priority } = req.query;
        const query = { assignedTo: req.user._id };
        if (status) query.status = status;
        if (priority) query.priority = priority;

        const tasks = await Task.find(query)
            .populate('projectId', 'name')
            .populate('assignedTo', 'name email avatar')
            .populate('createdBy', 'name email avatar')
            .sort({ createdAt: -1 });

        res.json({ success: true, tasks });
    } catch (error) {
        next(error);
    }
};


exports.getAllTasks = factory.getAll(Task);
exports.updateTask = factory.updateOne(Task);
exports.getTask = factory.getOne(Task);
exports.deleteTask = factory.deleteOne(Task);
