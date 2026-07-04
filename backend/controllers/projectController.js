const Project = require('../models/projectModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const {getProjectbasedId, saveAndPopulate, getStatusBoard} = require("../utils/utils");

// exports.createProject = factory.createOne(Project);
exports.getAllProjects = factory.getAll(Project);
exports.updateProject = factory.updateOne(Project);
exports.deleteProject = factory.deleteOne(Project);



exports.getProject = catchAsync(async (req, res, next) => {
    const project = await Project.findById(req.params.id)
        .populate({
            path: 'members',
            select: 'name email'
        })
        .populate({
            path: 'leadId',
            select: 'name email'
        })
        .populate({
            path: 'statusBoards'
        });

    if (!project) {
        return next(new AppError('No project found with that ID', 404));
    }

    res.status(200).json({
        success: true,
        project,
    });
});

exports.createProject = catchAsync(async (req, res, next) => {
    const {name, description, members, startDate, endDate} = req.body;

    // Validation
    if (!name || !description || !startDate || !endDate) {
        return next(
            new AppError('Please provide name, description, startDate, and endDate', 400)
        );
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return next(new AppError('Invalid startDate / endDate format', 400));
    }
    if (end <= start) {
        return next(new AppError('End date must be after start date', 400));
    }

    const project = await Project.create({
        name,
        description,
        leadId: req.user.id,
        members: members && members.length > 0 ? members : [req.user.id],
        startDate: start,
        endDate: end,
    });

    await project.populate('leadId members', 'name email role avatar');

    res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: {
            project,
        },
    });
});

exports.addMember = catchAsync(async (req, res, next) => {
    const project = await getProjectbasedId(req.params.id);

    const {userId} = req.body;
    if (!userId) return res.status(400).json({success: false, message: 'User ID is required'});

    if (project.members.includes(userId)) {
        return res.status(400).json({success: false, message: 'User is already a member'});
    }

    project.members.push(userId);
    await saveAndPopulate(project);

    res.json({success: true, project});
});

exports.removeMember = catchAsync(async (req, res, next) => {

    const project = await getProjectbasedId(req.params.id);

    project.members = project.members.filter(m => m.toString() !== req.params.userId);

    await saveAndPopulate(project);

    res.json({success: true, project});
})

exports.getStatusBoards = catchAsync(async (req, res, next) => {
    const project = await getProjectbasedId(req.params.id);

    const boards = project.statusBoards.sort((a, b) => a.order - b.order);
    res.json({success: true, statusBoards: boards});
})

exports.createStatusBoard = catchAsync(async (req, res, next) => {
    const project = await getProjectbasedId(req.params.id);

    const {name, color} = req.body;
    if (!name || !color) return res.status(400).json({success: false, message: 'Name and color are required'});

    const exists = project.statusBoards.find(b => b.name.toLowerCase() === name.toLowerCase());
    if (exists) return res.status(400).json({success: false, message: 'Status board with this name already exists'});

    const maxOrder = Math.max(...project.statusBoards.map(b => b.order), -1);
    project.statusBoards.push({name, color, order: maxOrder + 1, isDefault: false});

    await project.save();
    res.status(201).json({success: true, statusBoards: project.statusBoards});
})

exports.updateStatusBoard = catchAsync(async (req, res, next) => {
    const project = await getProjectbasedId(req.params.id);

    const board = getStatusBoard(project, req.params.boardName);

    const {name, color, order} = req.body;
    if (name) board.name = name;
    if (color) board.color = color;
    if (order !== undefined) board.order = order;

    await project.save();
    res.json({success: true, statusBoards: project.statusBoards});
});

exports.deleteStatusBoard = catchAsync(async (req, res, next) => {
    const project = await getProjectbasedId(req.params.id);

    const board = getStatusBoard(project, req.params.boardName);

    if (board.isDefault) return res.status(400).json({success: false, message: 'Cannot delete default status boards'});

    project.statusBoards = project.statusBoards.filter(b => b.name !== req.params.boardName);
    await project.save();

    res.json({success: true, message: 'Status board deleted', statusBoards: project.statusBoards});
})