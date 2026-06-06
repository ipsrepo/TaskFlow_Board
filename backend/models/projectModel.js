const mongoose = require("mongoose");
const StatusBoard = require("./statusBoardModel");

const projectSchema = new mongoose.Schema({
        name: {
            type: String,
            required: [true, 'Name is required'],
            minlength: [2, 'Project name must have at least 3 characters'],
            maxlength: [200, 'Project name must have less than 100 characters'],
        },
        description: {
            type: String,
            required: [true, 'Project description is required'],
        },
        leadId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        status: {
            type: String,
            enum: ['active', 'completed', 'on-hold'],
            default: 'active',
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        statusBoards: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'StatusBoard',
        }],

        defaultStatuses: {
            type: [String],
            default: ['todo', 'in-progress', 'completed'],
        },
    },
    {
        timestamps: true,
        toJSON: {virtuals: true},
        toObject: {virtuals: true},
    }
);

projectSchema.pre('save', function (next) {
    if (this.isNew && (!this.statusBoards || this.statusBoards.length === 0)) {
        this.statusBoards = [
            { name: 'todo', color: '#95a5a6', order: 0 },
            { name: 'in-progress', color: '#f39c12', order: 1 },
            { name: 'completed', color: '#27ae60', order: 2 },
        ];
    }
    next();
});

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;