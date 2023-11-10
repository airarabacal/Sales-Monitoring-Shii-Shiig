const path = require('path');
const express = require('express');
const cors = require('cors');
const db = require('./db/dbconfig');
const tabRouter = require('./routes/tab-routes');

const app = express();
// const apiPort = 3001;

let apiPort = process.env.PORT;
if (apiPort == null || apiPort == "") {
   apiPort = 3001;
}

const corsOptions = {
   origin: 'http://localhost:3000',
   credentials: true
}

app.use(express.urlencoded({extended:false})); 
app.use(cors());
app.use(express.json());

db.on('error', console.error.bind(console, 'MongoDB connection error:'))

  
app.get('/', (req, res) => {
   // res.send('Hello World!')
   res.json({ message: "Hello from server!" });
})


// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, '../client/build')));

app.use('/api', tabRouter);

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
   res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
 });

app.listen(apiPort, () => console.log(`Server running on port ${apiPort}`))