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
        success: true,
        message,
        ...data,
    });
};

exports.saveAndPopulate = async (project, populate = 'leadId members') => {
    await project.save();
    await project.populate(populate);
    return project;
};

exports.getStatusBoard = (project, boardName) => {
    const board = project.statusBoards.find(
        b => b.name.toLowerCase() === boardName.toLowerCase()
    );
    if (!board) return res.status(404).json({success: false, message: 'Status board not found'});
    return board;
};

exports.filterObj = (body, ...filteredKeys) => {
    const newObj = {};
    Object.keys(body).forEach((key) => {
        if (filteredKeys.includes(key)) {
            newObj[key] = body[key];
        }
    });

    return body;
};