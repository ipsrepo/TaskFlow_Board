const Task = require('../models/taskModel');
const factory = require('./handlerFactory');
const Project = require('../models/projectModel');
const catchAsync = require("../utils/catchAsync");

exports.createTask = catchAsync(async (req, res, next) => {
    const {title, description, projectId, assignedTo, priority, deadline, status} = req.body;
    if (!title || !projectId) {
        return res.status(400).json({success: false, message: 'Title and project are required'});
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({success: false, message: 'Project not found'});


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
        {path: 'assignedTo', select: 'name email avatar'},
        {path: 'createdBy', select: 'name email avatar'},
        {path: 'projectId', select: 'name'},
    ]);

    res.status(201).json({success: true, task});
});

exports.getMyTasks = catchAsync(async (req, res, next) => {
    const {status, priority} = req.query;
    const query = {assignedTo: req.user._id};
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const tasks = await Task.find(query)
        .populate('projectId', 'name')
        .populate('assignedTo', 'name email avatar')
        .populate('createdBy', 'name email avatar')
        .sort({createdAt: -1});

    res.json({success: true, tasks});
})

exports.getTask = catchAsync(async (req, res) => {
    const task = await Task.findById(req.params.id)
        .populate({
            path: 'assignedTo',
            select: 'name email role avatar',
        })
        .populate({
            path: 'createdBy',
            select: 'name email role avatar',
        })
        .populate({
            path: 'comments.userId',
            select: 'name email role avatar',
        });

    if (!task) {
        return res.status(404).json({
            success: false,
            message: 'Task not found',
        });
    }

    return res.status(200).json({
        success: true,
        data: task,
    });
});

exports.updateTaskStatus = catchAsync(async (req, res, next) => {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({success: false, message: 'Task not found'});

    const isAssigned = task.assignedTo?.toString() === req.user._id.toString();
    const isCreator = task.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isLead = req.user.role === 'lead';

    if (!isAssigned && !isCreator && !isAdmin && !isLead) {
        return res.status(403).json({success: false, message: 'Not authorized to update this task'});
    }

    const {status} = req.body;
    if (!status) return res.status(400).json({success: false, message: 'Status is required'});

    task.status = status;
    await task.save();

    await task.populate([
        {path: 'assignedTo', select: 'name email avatar'},
        {path: 'createdBy', select: 'name email avatar'},
    ]);

    res.json({success: true, task});
})

exports.addComment = catchAsync(async (req, res, next) => {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({success: false, message: 'Task not found'});

    const {text} = req.body;
    if (!text) return res.status(400).json({success: false, message: 'Comment text is required'});

    task.comments.push({userId: req.user._id, text});
    await task.save();

    await task.populate('comments.userId', 'name email avatar');

    res.status(201).json({success: true, comments: task.comments});
})

exports.getKanbanTasks = catchAsync(async (req, res, next) => {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({success: false, message: 'Project not found'});

    const tasks = await Task.find({projectId: req.params.projectId})
        .populate('assignedTo', 'name email avatar')
        .populate('createdBy', 'name email avatar')
        .sort({createdAt: -1});

    const kanban = {};
    project.statusBoards
        .sort((a, b) => a.order - b.order)
        .forEach(board => {
            kanban[board.name] = {
                board,
                tasks: tasks.filter(t => t.status === board.name),
            };
        });

    tasks.forEach(task => {
        if (!kanban[task.status]) {
            kanban[task.status] = {board: {name: task.status, color: '#95a5a6'}, tasks: [task]};
        }
    });

    res.json({success: true, kanban, statusBoards: project.statusBoards.sort((a, b) => a.order - b.order)});

});

exports.getProjectTasks = catchAsync(async (req, res, next) => {
    const {status, priority, assignedTo} = req.query;
    const query = {projectId: req.params.projectId};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;

    const tasks = await Task.find(query)
        .populate('assignedTo', 'name email avatar')
        .populate('createdBy', 'name email avatar')
        .sort({createdAt: -1});

    res.json({success: true, tasks});
})

exports.getAllTasks = factory.getAll(Task);
exports.updateTask = factory.updateOne(Task);
exports.deleteTask = factory.deleteOne(Task);
