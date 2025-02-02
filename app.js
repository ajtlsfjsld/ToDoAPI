import express from "express";
import Task from "./models/Task.js";
import mongoose from "mongoose";
import * as dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();

app.use(cors());  // Enable CORS for all routes
app.use(express.json());  // Add this line to parse JSON bodies

// MongoDB 연결
mongoose.connect(process.env.DATABASE_URL)
  .then(() => console.log('MongoDB에 연결되었습니다.'))
  .catch(err => console.error('MongoDB 연결 실패:', err));

function asyncHandler(handler) {
    return async (req, res) => {
        try {
            await handler(req, res);
        } catch (e) {
            if(e.name === 'ValidationError'){
                res.status(400).send({message: e.message});
            }else if(e.name === 'CastError'){
                res.status(404).send({message: 'Cannot find Task with ID'});
            }else{
                res.status(500).send({message: e.message});
            }
            
        }
    };
}

app.get('/tasks', asyncHandler(async (req, res) => {
    const sort = req.query.sort;
    const count = Number(req.query.count) || 0;

    const sortOptions = {
        createdAt: sort === 'oldest' ? 'asc' : 'desc',
    };
    
    const tasks = await Task.find().sort(sortOptions).limit(count);
    

    res.send(tasks);
}));

app.get('/tasks/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const task = await Task.findById(id);

    if (!task) {
        return res.status(404).send('Task not found');
    }
    else{
        res.send(task);
    }
}));

app.post('/tasks', asyncHandler(async (req, res) => {
    const newTask = await Task.create(req.body);
    res.status(201).send(newTask);
}));

app.patch('/tasks/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const task = await Task.findByIdAndUpdate(id);
    if(task){
        Object.keys(req.body).forEach((key) => {
            task[key] = req.body[key];
        });
        await task.save();
        res.send(task); 
    }else{
        res.status(404).send('Task not found');
    }
}));

app.delete('/tasks/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const task = await Task.findByIdAndDelete(id);
  if(task){
      res.sendStatus(204);
  }else{
      res.status(404).send('Task not found');
  }
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});