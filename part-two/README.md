# Node Clustering

Node.js is a single threaded runtime, meaning that only one thread of the CPU is able to process the execution of the code.

We can't actually change Node.js to work as a multi-threaded software, but what we can do is run multiple instances of Node
on a single thread, which will act similar to multithreading in a sense that multiple executions of Node can happen at once on the same machine.

An example for why this is useful is if we try to block the event loop for several seconds like so:

```javascript
const express = require('express');
const app = express();

function doWork(duration) {
  const start = Date.now();
  while (Date.now() - start < duration) {}
}

app.get('/', (req, res) => {
    doWork(5000);
    res.send('Hello World!');
});

app.listen(3000, () => {
    console.log('app listening on port 3000!');
});
```

If we access the "/" path we will wait 5 seconds until it loads, but any other requests in between will have to wait those 5 seconds
of the first run until it can start to process its own 5 seconds wait.

That's because this is pure Node event-loop work, we aren't using any operating system workers here, and we utilize 100%
of the event loop in this one request, which causes any additional requests to wait until the event loop frees up.

If we had a cluster of multiple Node instances, each one would have its own event loop, which can be utilized in any additional requests.

### So how does clustering work?

In order to utilize the clustering in Node, we first need to set up multiple Node processes on the machine.

On top of all the Node processes, we will have a Cluster Manager. The cluster manager is responsible in monitoring the health
of all the running Node processes. The cluster manager will not run any Node code itself, but will monitor all the instances
of Node that will run the application.

Basically, the cluster manager can stop, start, restart do and other administrative operations on the Node instances.

When using Node cluster, we will still call the node script as usual, for example by running ```node index.js```, but instead
of simply executing the script, it will first run the cluster manager, which will then assign the command execution to one
of the Node processes.

Here is a diagram with an example on how it works in general:

![scheduling](assets/images/cluster-diagram.png)

First we run the command as usual. Then the cluster manager takes action and assigns the call to a "worker instance". 
To do that, the cluster manager uses a Node standard library called ```cluster```, and uses the function ```fork()``` as a way to 
create and assign the call to a node instance, which then executes the actual ```index.js``` inside that Node instance.

To start demonstrating how clustering works, we will start to add some cluster code to the top of our ```index.js``` file:

```javascript
const cluster = require('cluster');

console.log(cluster.isMaster);
```

We first import the ```cluster``` library from Node (remember, this is a standard library, no need to install it. It comes with Node).

Regarding the second line: ```console.log(cluster.isMaster);```, if you recall, it was just mentioned that when we first execute a Node script that is using cluster,
it will still run the script for the first time as usual. When it does that, it runs the cluster manager instance which will then
fork (create) a new node instance and will execute the script in this instance.

When we run it for the first time in the cluster manager instance, the ```cluster.isMaster``` will be set to true. That is not the
case when the code runs on any of the forked instances that the cluster manager created.

Knowing whether we are in a "master" instance or not is important, because we will need to have different logic in the code
depending on the case:

```javascript
if (cluster.isMaster) {
    cluster.fork();
    return;
}

const express = require('express');
const app = express();

function doWork(duration) {
  const start = Date.now();
  while (Date.now() - start < duration) {}
}
.
.
.
```

In this case, when we run the code and are in the "master" instance, we should tell Node to fork a new child instance.
After the child instance is forked (created), the file is being called once again, but this time the ```cluster.isMaster```
will return false; in this case, we want to run our actual code which is everything below the if statement of the ```cluster.isMaster```.

We can see that this is the case if output the "isMaster" value at the start of the file. We will see the following result in the terminal:

```bash
true
false
app listening on port 3000!
```