import express from 'express';
import { router } from './routes/router-test.js';

    const app = express();

    app.use(express.json());

    app.use('/', router);    

    export {
    app
};

