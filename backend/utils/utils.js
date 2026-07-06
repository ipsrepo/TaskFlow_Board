const Project = require('../models/projectModel');
const AppError = require('../utils/appError');

exports.getProjectbasedId = async (id) => {
    const project = await Project.findById(id);
    if (!project) {
        const err = new AppError('Project not found', 404);
        throw err;
    }
    return project;
};

exports.sendSuccess = (res, data, message = 'success', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true, message, ...data,
    });
};

exports.saveAndPopulate = async (project, populate = 'leadId members') => {
    await project.save();
    await project.populate(populate);
    return project;
};


exports.getStatusBoard = (project, boardName) => {
    const board = project.statusBoards.find((board) => board.name.toLowerCase() === boardName.toLowerCase());

    if (!board) {
        throw new AppError('Status board not found', 404);
    }

    return board;
};

exports.filterObj = (obj, ...allowedFields) => {
    const filteredObj = {};

    Object.keys(obj).forEach((key) => {
        if (allowedFields.includes(key)) {
            filteredObj[key] = obj[key];
        }
    });

    return filteredObj;
};