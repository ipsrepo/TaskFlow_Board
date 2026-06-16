const mongoose = require('mongoose');
const Project = require('./projectModel');
const User = require('./userModel');

const taskSchema = mongoose.Schema({
        title: {
            type: String,
            required: [true, 'task title is required'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Please provide a description'],
        },
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            default: 'todo',
            required: true,
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium',
        },
        deadline: {
            type: Date,
            required: false,
        },
        isOverdue: {
            type: Boolean,
            default: false,
        },

        comments: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                text: String,
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    {
        timestamps: true,
        toJSON: {virtuals: true},
        toObject: {virtuals: true},
    }
);

taskSchema.pre(/^find/, function (next) {
    if (this.deadline && this.status !== 'completed') {
        this.isOverdue = new Date() > this.deadline;
    } else {
        this.isOverdue = false;
    }
    next();
});

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;