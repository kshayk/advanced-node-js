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