const mongoose = require('mongoose');

const statusBoardSchema = new mongoose.Schema({
    _id: false,
    name: {
        type: String,
        required: true,
    },
    color: {
        type: String,
        default: '#3498db',
        match: /^#[0-9A-F]{6}$/i,
    },
    order: {
        type: Number,
        default: 0,
    },
});

const StatusBoard = mongoose.model('StatusBoard', statusBoardSchema);
module.exports = StatusBoard;