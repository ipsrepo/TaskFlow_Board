const mongoose = require("mongoose");

const statusBoardSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        color: {
            type: String,
            default: "#3498db",
            match: /^#[0-9A-F]{6}$/i,
        },
        order: {
            type: Number,
            default: 0,
        },
    },
    {
        _id: true,
    }
);

const projectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Project name is required"],
            minlength: [2, "Project name must have at least 2 characters"],
            maxlength: [200, "Project name must have less than 200 characters"],
            trim: true,
        },

        description: {
            type: String,
            required: [true, "Project description is required"],
            trim: true,
        },

        leadId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        status: {
            type: String,
            enum: ["active", "completed", "on-hold", "cancelled"],
            default: "active",
        },

        startDate: {
            type: Date,
            required: true,
        },

        endDate: {
            type: Date,
            required: true,
        },

        statusBoards: {
            type: [statusBoardSchema],
            default: [
                {
                    name: "todo",
                    color: "#95a5a6",
                    order: 0,
                },
                {
                    name: "in-progress",
                    color: "#f39c12",
                    order: 1,
                },
                {
                    name: "completed",
                    color: "#27ae60",
                    order: 2,
                },
            ],
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;