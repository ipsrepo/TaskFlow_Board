const User = require('../models/userModel');
const factory = require('./handlerFactory');
const catchAsync = require("../utils/catchAsync");

exports.getAllUsers = factory.getAll(User);
exports.updateUser = factory.updateOne(User);
exports.getUser = factory.getOne(User);
exports.deleteUser = factory.deleteOne(User);

exports.getProfile = catchAsync(async (req, res, next) => {
    res.json({ success: true, user: req.user.toJSON() });
});

exports.updateProfile = catchAsync(async (req, res, next) => {

    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError('Please use password update, This is for profile only', 401),
        );
    }

    const profileData = filterObj(req.body, 'name', 'email');

    const updatedUser = await User.findByIdAndUpdate(req.user.id, profileData, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        status: 'success',
        data: updatedUser,
    });
});