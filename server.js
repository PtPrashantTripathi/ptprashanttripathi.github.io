const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({extended: true})); 
app.use(express.static(__dirname));
app.use((req,res,next)=>{
   res.status(404).send('<h1> Page not found </h1>');
});
const PORT = process.env.PORT || 80;
const server = app.listen(PORT, () => {
	console.log('\x1b[42m',`listening on port ${server.address().port}...`,'\x1b[5m');
});