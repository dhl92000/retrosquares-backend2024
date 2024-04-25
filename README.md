# Retrosquares App

Retrosquares allows users to create and manage polaroid-like posts with their photos. 

Link to project: https://retrosquares.netlify.app/

(ps. this is a version with the create/edit/delete functions disabled, as the app does not have user authentication)

## How It's Made

**Tech used:** AWS, React, Express.js, MySQL, Sequelize, Netlify

**Models:**
Squares and Hashtag model, and junction table displaying Many-to-Many relationship
![image](https://github.com/dhl92000/retrosquares-backend2024/assets/135692247/0a1a0195-6cc6-4b27-bd18-0d94a5e15b3c)


I created this project because I wanted to learn about deploying applications on Amazon Web Services(AWS), and querying Many-to-Many relationships from a database like MySQL. 

The Express server is configured to a remote instance of AWS EC2. It is in this remote server where images are stored and a MySQL database is connected. When 'Squares' (aka. polaroid images with description) are created, the image is stored in AWS S3 with a key name as its identifier. The same key name is used when creating an input object to store as a 'Square' in the MySQL database. If the Square has a description containing any hashtags, these are parsed and stored in the 'Hashtag' table. 

The React frontend makes API calls to the server, and fetches data to display on the browser. If users click on hashtag links or search for particular hashtags, this presents a page that displays just the Squares containing those hashtags.

**App Preview**
![image](https://github.com/dhl92000/retrosquaresfrontend2024/assets/135692247/1bcb4d04-73dc-487f-bc8c-9c6e11802cd4)
