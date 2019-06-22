# snoop's express server

seeing as this is our first server side javascript, let's jump right in with the [official getting started guide from express](https://expressjs.com/en/starter/hello-world.html)


`$ cd code`

`$ mkdir snoop-server`

`$ cd snoop-server`

`$ npm init -y`

`$ npm install -S express`

`$ touch index.js`


now from the guide


<sub>./index.js</sub>
```js
const express = require('express');
const app = express();
const port = 4000;

app.get('/', (req, res) => res.send('Hello World!'));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
```

let's break it down one line at a time

 - `const express = require('express');`
   - this is how we import npm modules that we added
   - now we can use `express` to make us an http application
 - `const app = express();`
   - `express` it turns out is a function which returns to us an app instance
   - we'll see in the [express docs](https://expressjs.com/en/4x/api.html) what the app can do
 - `const port = 4000;`
   - I've changed it from 3000 because that's where create-react-app is running already!
   - we'll need to add [cors](https://expressjs.com/en/4x/api.html) support later to work in dev mode
 - `app.get('/', /* route handler */ );`
   - here we're defining a route handler for GET requests to / (ie the root path)
   - `(req, res) => res.send('Hello World!')`
     - here we ignore the `req` request object
     - `res`, the response object we use to send back the response text
 - `app.listen(port, /* on boot complete callback */);`
   - this is where we tell express to run a server listening on the `port` we set earlier
   - the callback is used in some cases to make sure the server is running
   - here it's useful just to get a console message so we know everything is working


ok, now that we understand what's going on, it's time to run the server

(from the project directory still)

`$ node index.js`

or for the lazy

`$ node .`

so now we can navigate to [localhost:4000](http://localhost:4000) to see the hello world working.



## defining our own routes

### submit form POST

### read all submissions GET

### authentication middleware for read all



## deploying to production

### serving the build assets for our web app

### pushing to heroku with Procfile
