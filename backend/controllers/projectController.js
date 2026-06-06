const Project = require('../models/projectModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// exports.createProject = factory.createOne(Project);
exports.getAllProjects = factory.getAll(Project);
exports.updateProject = factory.updateOne(Project);
exports.getProject = factory.getOne(Project);
exports.deleteProject = factory.deleteOne(Project);


exports.createProject = catchAsync(async (req, res, next) => {
    const { name, description, members, startDate, endDate } = req.body;

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
        status: 'success',
        message: 'Project created successfully',
        data: {
            project,
        },
    });
});
