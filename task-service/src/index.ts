import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import amqp from 'amqplib';

const app = express();

app.use(bodyParser.json());
const port = 3001;

mongoose.connect('mongodb://mongo:27017/tasks').then(() => { 
    console.log("Connected to Mongodb")
}).catch((err) => {
    console.error("Error connecting to mongodb", err)
})


const TaskSchema = new mongoose.Schema({
    title: String,
    description: String,
    userId: String,
    createdAt: { type: Date, default: Date.now}
})

const Task = mongoose.model("Task", TaskSchema);

let channel: any;
let connection: any;
// Retry connection to RabbitMQ
async function connectRabbitMQRetry(retries=25, delay=5000){
    while(retries > 0){
        try {
            console.log("Connecting to RabbitMQ...");
            connection = await amqp.connect('amqp://guest:guest@rabbitmq:5672')
            channel = await connection.createChannel();
            await channel.assertQueue("task_created");
            return;
        } catch (error) {
            console.error("Error connecting to RabbitMQ", error);
            retries--;
            console.error("Retrying left:", retries, "attempts left");
            await new Promise(res => setTimeout(res, delay));
        }

    }

}

app.get('/tasks', async (req: Request, res: Response) => {
    try {
        const tasks = await Task.find();
        res.json(tasks);
    } catch (error) {
        console.error("Error fetching tasks", error);
    }
})

app.post('/tasks', async (req: Request, res: Response) => {
    const { title, description, userId } = req.body;
    try {
        const task = new Task({title, description, userId});
        await task.save();
        const message = { taskId: task._id, userId, title};

        if(!channel){
            return res.status(500).json({error: "No Channel Available"})
        }
        channel.sendToQueue("task_created", Buffer.from(JSON.stringify(message)));
        res.status(201).json(task);
    } catch (error) {
        console.error("Error creating task ", error);
        res.status(500).json({error: "Internal server Error"}) 
    }
})

app.get('/', (req: Request, res: Response) => {
    res.send('hello world');
})

async function start() {
  await connectRabbitMQRetry();


  app.listen(port, () => {
    console.log(`Task service running on ${port}`);
  });
}

start();