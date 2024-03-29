const mongoose = require('mongoose')
const validator = require('validator')

const taskSchema = new mongoose.Schema({
    decription: {
        type: String,
        required: true,
        trim: true,
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: 'User'
    }
},{
    timestamps:true
})

const Task = mongoose.model('Task', taskSchema)

module.exports = Task