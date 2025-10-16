import express from 'express';

    const app = express();

    app.use(express.json());

    app.post('/respostas', (req,res) =>{
        const resultado = req.body;
        res.json(resultado);

    });

    

    export {
    app
};

