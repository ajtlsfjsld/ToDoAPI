import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        maxLength: 30,
    },
    description: {
        type: String
    },
    isComplete: {
        type: Boolean,
        required: true,
        default: false
    },

    }, 
    {
        timestamps: true
    }
);

const Task = mongoose.model('Task', taskSchema);

export default Task;