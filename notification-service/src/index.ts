import amqp from 'amqplib';


let channel: any;
let connection: any;

async function start(retries=25, delay=5000){
    while(retries > 0){
        try {
            console.log("Connecting to RabbitMQ...");
            connection = await amqp.connect('amqp://guest:guest@rabbitmq:5672')
            channel = await connection.createChannel();
            await channel.assertQueue("task_created");
            channel.consume("task_created", (msg: any) =>{
                const taskData = JSON.parse(msg.content.toString())
                console.log("Task created:", taskData.title );
                channel.ack(msg)
            }) 
            
        } catch (error) {
            console.error("Error connecting to RabbitMQ", error);
            retries--;
            console.error("Retrying left:", retries, "attempts left");
            await new Promise(res => setTimeout(res, delay));
        }

    }

}

start()
