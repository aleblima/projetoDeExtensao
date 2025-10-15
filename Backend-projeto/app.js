    import express from 'express';
import { user } from './models/User.js';
    const app = express();

    const PORT = 3000;

    app.listen(PORT, () => {
        console.log(`server is running on ${PORT}`);
    });

    app.get ('/getrequest', (req, res)=>{
        res.json();;
    });

    app.post('/post', (req, res)=> {
        res.json(user);
    });