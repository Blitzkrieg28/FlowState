import { createClient } from 'redis';
import 'dotenv/config';

const mainClient= createClient({
    url: process.env.REDIS_URL
});
mainClient.on('error' ,(err)=> console.log('Main client Redis Error!', err));

const subscriberClient= mainClient.duplicate();
subscriberClient.on('error', (err)=> console.log('Subscriber client Redis Error!', err));

try{
   await mainClient.connect();
   console.log('Redis main client connection successfull!!');
   await subscriberClient.connect();
   console.log('Redis subscriber connection successfull!1');
} catch(err){
     console.error('could not connect to redis!', err);
}


export const redis= mainClient;
export const redisPublisher= mainClient;
export const redisSubscriber= subscriberClient;