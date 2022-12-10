import serverlessExpress from '@vendia/serverless-express';
import express from 'express';

const app = express();


app.use('/hello', (req, res) => res.send(`hello`));
app.use('/', (req, res) => res.send(`root`));

// ローカル確認用
if (process.env.NODE_ENV === `develop`) app.listen(3000)

exports.handler = serverlessExpress({ app })
