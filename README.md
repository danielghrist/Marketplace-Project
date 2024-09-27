<h1 align='center'>SWE Group04 Team Project: Marketplace/Collection Website</h1>
<hr align='center' />
<h2>Project Description:</h2>
<p>Our project will be an online web application marketplace with an included collection feature so users may curate a collection of items they have and then sell them, or just help them have their collection data for their own purposes. The addition of a user’s collection will set our project apart from other similar sites. Our project will help users curate their items for sale or purchase other items to add to their collection. This is important as currently if you wanted to combine these two ideas you would need to use two separate applications. 
Users will need to create an account and login using a username and password that will be stored in the database (hashed and salted) to access the features of the site. We will have multiple types of users, such as people who just want to sell, some who just want to buy, others who just want to use the collection feature to keep track of their items, or any combination of the previous. We will also include administrative users who have full access to the system. Users will be able to post items for sale either from their collection or just as a one off and choose between an auction style or a buy it now marketplace style of selling. This will allow other users to purchase items from each other.
We are attempting to create the feel of a mash up of several different influences. Those being Facebook Marketplace, eBay, and a collection website. We will also attempt to put our own spin on the website to make it feel like something new and fresh as well as something comfortable that they are used to. We believe this will allow our users to be more organized and allow them to sell or purchase items easier, quickly, and intuitively update their collections if they choose to use that feature.
</p>

<h2>Technologies:</h2>
<ul>
  <li>Database (DBMS):  MySQL hosted on Amazon AWS RDS Server</li>
  <li>Front End:        HTML/CSS/Javascript/Bootstrap 5</li>
  <li>Back End:         Node.JS/Express.JS/Javascript</li>
</ul>

<h2>How to Use Project Locally:</h2>
<ol>
  <li>Intall Node.JS</li>
  <li>Open folder containing data and install dependencies by running command: "npm install".</li>
  <li>To start a local server on port 3000 run the command: "npm start".</li>
  <li>Open Chrome or another internet browser and navigate to "localhost:3000".</li>
</ol>

<h2>How to Access Online:</h2>
<ol>
  <li><s>You can navigate to: "3.144.178.121:3000/" to access our site online.</s></li>
  <li>Currently there is no way to view this online as the EC2 instance it was hosted on was terminated.</li>
</ol>

<h2>Known Bugs</h2>
<ul>
  <li><s>Currently the entire site only works when using public IPv4 address at port 3000 (3.144.178.121:3000/register.html).</s>
  The EC2 instance was deleted for this project, therefore there is no way to view it online currently.</li>
  <li>Currently the Express.JS server is listening on port 3000 and it is not being redirected properly through nginx.</li>
  <li><s>The navbar isn't sizing properly currently</s>. (FIXED)</li>
  <li>The Modals (popups) on the collection view site are not able to be closed on smaller screen like iPhone.</li>
  <li>When editing the collection the <s>Date Purchased and the</s>(FIXED) Image File are not pre-populating.</li>
  <li>When adding items image uploads are not working.</li>
  <li><s>The BootStrap Accordian on the shop page is broken since I disabled the template CSS file as it was causing more trouble than it was worth.</s>(FIXED, DELETED)</li>
  <li>There is currently no search functionality.</li>
  <li><s>There is currently no shopping cart functionality.</s>(ADDED, BUT LIMITED)</li>
</ul>
