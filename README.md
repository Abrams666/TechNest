<h1>English Manual</h1>
<h3>TechNest</h3>
<p>A website that you can sell and buy eletronic devices on it.</p>

<h3>Way to run these codes<h3>
<h4>1.Download and install Node.js</h4>
<p>Visit "https://nodejs.org/" to download Node.js, then follow the step to install it.</p>

<h4>2.Download and install NPM</h4>
<p>NPM should be download and install while you install Node.js. Please type the following code in commander to make npm can be run on VScode.</p>
<code></code>

<h4>3.Sign up in MongoDB</h4>
<p>Visit "https://www.mongodb.com/" to sign up and set up your Database.<p>

<h4>4.Download or clone these codes</h4>
<p>Your can clone these codes if you have git or download them manually. Then Open them with VScode(recommanded).<p>
<code></code>

<h4>5.Config</h4>
<p>Add a document called "config.env" in the file. And the contain should be:</p>
<code>
PORT = "80"
DATABASE_PASSWORD = "[PASSWORD OF YOUR DATABASE]"
DATABASE_CONNECTION_STRING = "mongodb+srv://[NAME OF YOUR ACCOUNT]:{db_password}@cluster0.siulj.mongodb.net/[NAME OF YOUR DATABASE]?retryWrites=true&w=majority&appName=Cluster0"
</code>

<h4>6.Run these codes</h4>
<p>Type the following code in commander to start the server.</p>
<code>nodemon node.js</code>
<p>or</p>
<code>node node.js</code>

<h4>6.Test</h4>
<p>Type "localhost" or "127.0.0.1" in your browser.</p>

<h1>Copyright Notice </h1>
<p>This work is licensed under Creative Commons Attribution-NonCommercial 4.0 International.</p>
<p>To view a copy of this license, visit https://creativecommons.org/licenses/by-nc/4.0/</p>
<p>Copyright © 2025 TechNest(陳元謙Abrams666) All Rights Reserved</p>
