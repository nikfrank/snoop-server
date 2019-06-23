const express = require('express');
const app = express();
const port = 4000;


app.use(express.static('build'));
app.use(express.json());


let inMemStore = [];

app.post('/submit', (req, res)=>{
  inMemStore.push(req.body);
  res.status(201).json({ saved: req.body });
});


const authMiddleware = (req, res, next)=>{
  if( req.get('Authentication') === 'dis is really snoop' )
    next();

  else if( req.get('Authentication') ) res.status(403).json({ message: 'get outa here' });
  else res.status(401).json({ message: 'I don\'t even know who you are' });
};


app.get('/submissions', authMiddleware, (req, res)=>{
  res.json(inMemStore);
});


app.listen(port, () => console.log(`Example app listening on port ${port}!`));
