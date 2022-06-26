# Advanced Node.js part 1

## Node Internals

![Node Structure](assets/images/node-structure.png)

In the following diagram we can see the structure of the Node.js runtime and what node.js is built on behind the scenes.

On the first level we have the Javascript code itself, which on its own is just a Javascript code.

The second level is Node itself, which is running the JS code whenever we run `node` on the JS file above.

Node js itself has some dependencies which he requires in order to run the JS code inside a machine, which are the V8 engine and libuv.

V8 is an open source JS engine created by google. The main goal for this engine is to execute JS code outside the browser. This is the same engine that runs Javascript in the Chrome browser.

libuv is also an open source project that gives node access to the operating system's underline file system, it gives access to networking and also handles some aspects of concurrency.

So why don't we just use V8 or libuv directly and instead using node? The main reason is that both the V8 and libuv are using mainly C++ to run, but node.js encapsulate those abilities in a language that is easier to learn and which most of us understand: Javascript.
Node also provides wrappers and a unified and consistent APIs for various abilities for us to use, such as the `http`, `fs`, `crypto` and `path` modules. Most of those modules are powered by the libuv project which gives node access to the operating system.


## module implementation
In the "node internals" section above we understood what node.js is using under the hood to make it work as a runtime outside the browser.
Now we will take a look on how it uses those C++ functions inside the Javascript code of any internal module.

For this example we will take a look at the `Crypto` module. This module is using V8 engine under the hood, but the code itself that we import to our node.js code is written in Javascript.
So how does node uses the V8's C++ code inside a Javascript file?

First we will look at a specific hash algorithm that is part of the `Crypto` module: the `pbkdf2` algorithm.

In order to use the `pbkdf2` function, we first need to import the `Crypto` module:

```javascript
const crypto = require('crypto');
```

Then we call the specific hash function:

```javascript
crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
  console.log('Done');
});
```

If we take a look inside the source code of `pbkdf2` function which can be found [here](https://github.com/nodejs/node/blob/main/lib/internal/crypto/pbkdf2.js), we can see the declaration of the function `pbkdf2`:

```javascript
function pbkdf2(password, salt, iterations, keylen, digest, callback)....
```

And inside this function there is an instantiation of a class called `PBKDF2Job`. If we try to search for this class in the JS code we will not find it.
The reason is that this class is actually imported from the V8's C++ code. If we take a look at how it is being imported we will see this syntax:

```javascript
const {
  PBKDF2Job,
  kCryptoJobAsync,
  kCryptoJobSync,
} = internalBinding('crypto');
```

The `internalBinding` function is the one in charge of converting the C++ code found in V8/libuv to a JS code, and as we can see, the returned data from this `internalBinding` function for the `crypto` module was an object and JS is able to deconstruct it into specific keys.

This graph represents what we have learned so far regarding the connection between the C++ code to the JS code:

![internalBinding](assets/images/internalBinding.png)

Note that on earlier versions of node, the `process.binding()` was the function used to convert between C++ to JS, but it was replaced by `internalBinding` in later versions.


## Basics of Threads
Whenever we run some programs on the computer, we start up something called a process. A process is an instance of a computer program that is being
executed.

Within a single process we can have multiple things called threads. A thread is basically like a to-do list with one or several instructions that need to be executed by the CPU of the computer.

The thread is given to the CPU, and the CPU will try to run those "to-do items" in the thread one by one. The order in which it will run those items is based on the order they are written in the code.

Each process can have multiple threads inside it. You can see the number of process and number of threads that are being used at the moment by opening the task manager of your operating system, and you will likely see that there are more threads than process running.

You can see the structure of processes and threads in the following diagram:

![threads](assets/images/threads.png)

Beside the "to-do" list inside the thread which represents what action to perform first, the operating system also have something called scheduling.
The scheduling system's responsibility is to decide which thread the CPU should process at any given time.

For example, let's say we have all those processes and threads that need to be processed:

![threads](assets/images/scheduling.png)

The operating system's scheduler should now decide which threads are the most important to run first.

The scheduler knows which operations are more critical to process first, like in the example above, there is a thread that is responsible to
move the cursor after a user has moved the mouse, or a thread that will write letter to an input after a users has clicked a button on the keyboard.
Those processes are more urgent and should not wait for other processes to finish, so the user will not need to wait a couple of seconds just to see the cursor moves around the screen.

There are several strategies to maximize the amount of threads that can run simultaneously, so more processes can get executed at the same time.
For example, since the CPU is the one that is running the processes, we can add more CPU cores, and each core can handle a thread:

![threads](assets/images/more-cpu.png)

It's also possible that one core will process multiple threads at the same time using something that's called "multi-threading", but we will touch on that further along the course.

Another approach by the scheduler to maximize thread processing is to check any threads with I/O operations that might take time and pause those processes in order
to allow non-I/O processes to finish running, and then continue the paused I/O process:

![threads](assets/images/io-thread.png)

An I/O (input/output) process takes time because the process requires other resources beside the CPU to run and return some output or alternatively, write some inputs into those external resources.
Since the CPU has no control over how long can it takes, it can potentially block other processes (which some of them can be run faster using only the CPU) and that's why this approach is important in order to relieve any blocked processes.

An example for an I/O operation is reading a file's contents (like using the `fs` module), or writing to a database, which both of those things sit in an external resource (the hard-drive or from the internet).











