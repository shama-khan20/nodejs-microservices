import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';

const app = express();

app.use(bodyParser.json());
const port = 3000;

mongoose.connect('mongodb://mongo:27017/users').then(() => { 
    console.log("Connected to Mongodb")
}).catch((err) => {
    console.error("Error connecting to mongodb", err)
})


const UserSchema = new mongoose.Schema({
    name: String,
    email: String
})

const User = mongoose.model("User", UserSchema);

app.get('/users', async (req: Request, res: Response) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        console.error("Error fetching users", error);
    }
})

app.post('/users', async (req: Request, res: Response) => {
    const { name, email } = req.body;
    try {
        const user = new User({name, email});
        await user.save();
        res.status(201).json(user);
    } catch (error) {
        console.error("Error creating user", error);
        res.status(500).json({error: "Internal server Error"}) 
    }
})

app.get('/', (req: Request, res: Response) => {
    res.send('hello world');
})

app.listen(3000, () =>{
    console.log("Example" + port )
})