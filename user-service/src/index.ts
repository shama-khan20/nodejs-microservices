import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';

const app = express();

app.use(bodyParser.json());
const port = 3000;

app.get('/',  (req:express.Request, res: express.Response) =>{
    res.send('hello world');
})

app.listen(port, () =>{
    console.log("Example" + port )
})