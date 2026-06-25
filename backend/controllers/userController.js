const User = require('../models/userModel');
const factory = require('./handlerFactory');
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getAllUsers = factory.getAll(User);
exports.updateUser = factory.updateOne(User);
exports.getUser = factory.getOne(User);
exports.deleteUser = factory.deleteOne(User);

exports.getProfile = catchAsync(async (req, res, next) => {
    console.log('this called')
    console.log(req.user.toJSON())
    res.json({ success: true, user: req.user.toJSON() });
});

exports.changeRole = catchAsync(async (req, res, next) => {
        const { role } = req.body;
        if (!role || !['member', 'lead', 'admin'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        );

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        res.json({ success: true, user })
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
        success: true,
        data: updatedUser,
    });
});