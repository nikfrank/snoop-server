# snoop's express server

seeing as this is our first server side javascript, let's jump right in with the [official getting started guide from express](https://expressjs.com/en/starter/hello-world.html)

it will also be advantageous to use the POSTMAN program (just google it already)


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


## serving out the built static (incl. javascript) assets

express has us covered with a pretty easy way to serve out our index.html and all the js and css that comes with it

(I'm assuming you've built the front end into a directory called /build)

after our imports and before any of our routes, we can use a static middleware

```js
app.use( express.static('build') );
```

this will intercept any GET requests that look like the want some static file, and respond with the correct one.

now when we restart the server, we can see our app again! (in production mode this time)


## defining our own routes

our snoop jobs front end produces a JSON including all the output from our form elements

the front end will call our `/submit` POST route with that JSON

so SHOW ME THE JSON eh?


```js

{
  "rapName":"Nate Dogg z\"l",
  "albumSales":4200000,
  "email":"nate@nate.nate",
  "job":"rapper",
  "country":"Canada",
  "topAlbum":{
    "name":"Doggystyle",
    "year":1993
  },
  "topRapper":{ "name":"Eminem" },
  "startDate":"2020-04-19T21:00:00.000Z",
}

```

if we were building a serious database for this mini-project, we would definitely need that JSON

here, our goal is just to store it in memory for snoop to be able to read it out on the admin page

in the meantime, we can use it from POSTMAN to make sample requests!


### submit form POST

to start, we want to define a new route, and assign it an empty routehandler (we'll fill that part in next of course)

<sub>./src/index.js</sub>
```js
//... above the app.get for /

app.post('/submit', (req, res)=>{
  // we'll fill in the business logic next
  // if we try to use req.body now, it won't work yet!
  console.log(req.body);
  // see! it's undefined
});

//...
```

all we need to do here is read out the JSON from the request, which means we get to use another middleware from express!

after our other middleware

```js

app.use(express.json());

```

now in our route handler we'll be able to read the `req.body` as the JSON that it is. 



#### in memory store

for the sake of brevity, we'll make an in memory store (aka an array) to put the results in

this means that every time we restart the server, we'll forget all the submissions we had saved - so obviously this isn't meant for production!

you may scoff, but many times while building large systems, interim solutions like this can help the front end and back end teams remain loosely coupled while maintaining their respective paces of development.

stay tuned for the next episode, where we build a big beautiful expressJS + sequelize + postgreSQL server with complete testing and CI-CD automation. (or at least most of that)


so what does that in memory store look like?

```js
let inMemStore = [];

app.post('/submit', (req, res)=>{
  inMemStore.push(req.body);
  res.status(201).json({ saved: req.body });
});

```

pretty simple. just an aray that we save the submitted application to.

it is customary to return a 201 status code when we have succeeded in creating something. (here a submitted application)



### read all submissions GET

now that we have all these submissions getting saved to the server, we need to be able to server them out

ok, all we need to do is define another get route, and now this time we'll read out from `inMemStore`

```js
app.get('/submissions', (req, res)=>{
  res.json(inMemStore);
});
```

that's pretty easy, but we'll want to put password protection so only admin can access it!



### authentication middleware for read all


we've used two middlewares already, though both are packaged by default with express, and we applied them to every request

now we want to write an authentication middleware for one specific route!

[express's docs](https://expressjs.com/en/guide/using-middleware.html) have some pretty solid examples

what we can see there is that the signature for a middleware `(req, res, next)=>` is the same as for a routehandler `(req, res)=>` expect it has an additional param `next`

`next` is a function that we can call to move on to the next middleware or (eventually) the routehandler

this pattern allows us to compose the request handling logic on our server out of many middlewares.


so let's see how that looks


```js

const authMiddleware = (req, res, next)=>{
 // business logic here
};

//...

app.get('/submissions', authMiddleware, /* routeHandler from before */);

```

so without changing our routehandler's logic, we're able to add the authentication functionality to a route (or remove it later if we please)


now of course we should write the authentication logic!

to make things simple, let's require the request have a header `{ Authentication: 'dis is really snoop' }`

again, this solution is not meant for production, but rather to learn the fundamentals of middleware logic

in a production environment we would encrypt a token to return in response to a successful login request, and we would decrypt it in the middleware to check its validity

here we'll just check if they say dat dey is really snoop!


we can use [req.get('HEADER-NAME') seen here in the express docs](http://expressjs.com/en/api.html#req) to read the Authentication header, and make a simple conditional flow based on it


```js
const authMiddleware = (req, res, next)=>{
  if( req.get('Authentication') === 'dis is really snoop' )
    next();

  else if( req.get('Authentication') ) res.status(403).json({ message: 'get outa here' });
  else res.status(401).json({ message: 'I don\'t even know who you are' });
};
```

it is customary to return a 403 response code when the Authorization fails, even though we might know who you are (ie VERBOTEN), and a 401 if the request is not authenticated at all.


#### testing from the browser

we can test the authentication with the following requests

401:

```js
fetch('http://localhost:4000/submissions')
  .then(response => response.json())
  .then(res => console.log(res) );
```


403:

```js
fetch('http://localhost:4000/submissions', {
  headers: {
    Authentication: 'not snoop'
  }
}).then(response => response.json())
  .then(res => console.log(res) );
```

200:

```js
fetch('http://localhost:4000/submissions', {
  headers: {
    Authentication: 'dis is really snoop'
  }
}).then(response => response.json())
  .then(res => console.log(res) );
```


## deploying to production

### pushing to heroku with Procfile
