# Merchandizer

Internship Project / Exam Project 1 at Noroff

[Deployment](https://merchandizer.onrender.com)

# Application Installation and Usage Instructions

## Installation

### Prerequisites

[Node.js v23.5.0](https://nodejs.org/en/download/package-manager) should also work on v22.12.0 (with Long Term Support)  
[MySQL Workbench](https://dev.mysql.com/downloads/workbench/) or similar Database Management System

1. ### Clone the Repository

   ```bash
   git clone https://github.com/donnybrilliant/merchandizer.git
   cd merchandizer
   ```

2. ### Install Dependencies

   Ensure that Node.js is installed on your machine, then run the following command to install the required packages:

   ```bash
   npm install
   ```

3. ### Database Setup

   To create the database needed for this application, run the following SQL command in your DBMS (f.x MySQLWorkbench):

   ```sql
   CREATE DATABASE merchandizer;
   ```

#### Database Access

    - Create a new MySQL user 'admin' with the password 'P@ssw0rd'
    - Grant all privileges on the 'myTodo' database to 'admin'
    - Apply the privilege changes

    In your DBMS, run this SQL command:

```sql
CREATE USER 'admin'@'localhost' IDENTIFIED BY 'P@ssw0rd';
GRANT ALL PRIVILEGES ON merchandizer.* TO 'admin'@'localhost';
FLUSH PRIVILEGES;
```

4. ### Set up .env

   This project requires certain environment variables to be set in a `.env` file.
   Please copy or rename the [env-example](https://github.com/donnybrilliant/merchandizer/blob/main/env_example) file to `.env` before running the application.

   ```bash
   mv .env-example .env
   ```

   The appropriate values should already be set, except the token, which you need to create:

   1. Open you terminal and start node: `node`
   2. Type `require('crypto').randomBytes(64).toString('hex')`
   3. Copy the token to .env where it says `TOKEN_SECRET=`

   - `ADMIN_USERNAME`: The username for the admin
   - `ADMIN_PASSWORD`: The password for the admin
   - `DATABASE_NAME`: The name of the database
   - `DATABASE_PORT`: The port of the database
   - `DIALECT`: The database dialect to use
   - `PORT`: The port on which the application will run
   - `HOST`: The host for the database connection
   - `TOKEN_SECRET`: A secret key used for signing JWT tokens
   - `AWS_ACCESS_KEY_ID`: Your AWS access key ID, which is used to authenticate requests to AWS services
   - `AWS_SECRET_ACCESS_KEY`: Your AWS secret access key, which is used with the access key ID to sign requests
   - `AWS_S3_BUCKET_NAME`: The name of the S3 bucket where your application will store and retrieve files
   - `AWS_REGION`: The AWS region where your S3 bucket is located

   #### Optional:

   For testing image uploading for product images and user avatars, set up your own AWS S3 Bucket.
   Login [here](https://console.aws.amazon.com/console/home?nc2=h_ct&src=header-signin) and follow [this guide](https://medium.com/@shivam97.dawar/easy-and-simple-4-steps-to-upload-images-to-aws-s3-bucket-through-node-js-server-using-express-5f1095fcc485)

   This might be easier to test if you change the `base_url` collection variable in the [Postman Collection](https://www.postman.com/wolfzkin/workspace/merchandizer/collection/14878277-b26761a4-e2dd-4640-82b1-1ddc303bc8a2?action=share&creator=14878277) to `https://merchandizer.onrender.com` and test it on the deployed production environment.

5. ### Run the Application

   Start the application using the following command:

   ```bash
   npm start
   ```

The application will be accessible at to use with at [localhost:3000](http://localhost:3000)

7. ### Run Tests

   This can be done before or after starting the application and should not affect the data in the database

   ```bash
   npm run test
   ```

## Usage

### Check the the API Documentation

The Merchandizer API is designed to manage band merchandise inventory during tours.
For detailed examples and responses, refer to the [Postman Collection](https://www.postman.com/wolfzkin/workspace/merchandizer/collection/14878277-b26761a4-e2dd-4640-82b1-1ddc303bc8a2?action=share&creator=14878277)

[Postman Documentation](https://www.postman.com/wolfzkin/merchandizer/documentation/dkmx3ul/merchandizer)

If you want to populate the database with example data for manual testing, this can be done with a POST request to the endpoint [localhost:3000/init]. This also adds the admin user specified in the Course Assignment Instructions.
This is not available in the production deployment since you dont need to be authenticated to use this endpoint.

# Libraries/Packages used

- **express:** Web application framework for building the server and routes.
- **sequelize:** ORM for managing SQL databases.
- **mysql2:** Modern MySQL client.
- **dotenv:** Loads environment variables from .env file.
- **jsonwebtoken:** Used for securing routes via token authentication.
- **swagger-ui-express:** Serves Swagger UI for API documentation.
- **morgan:** Logs HTTP requests to the console.
- **debug:** Creates debug logs.
- **http-errors:** Creates HTTP errors for error handling.
- **@aws-sdk/client-s3:** AWS SDK for JavaScript S3 client.
- **express-validator:** Middleware for validating and sanitizing user input.
- **multer:** Middleware for handling multipart/form-data, used for uploading files.
- **sharp:** High-performance image processing library.
- **jest:** Used for writing and running tests.
- **supertest:** Provides a high-level abstraction for testing HTTP servers.

# REFERENCES

[sequelize](https://sequelize.org/docs/v6/)  
[express-validator](https://express-validator.github.io/docs)  
[multer](https://github.com/expressjs/multer)  
[sharp](https://sharp.pixelplumbing.com/)  
[Promise.all](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)  
[setting up S3 Bucket](https://medium.com/@shivam97.dawar/easy-and-simple-4-steps-to-upload-images-to-aws-s3-bucket-through-node-js-server-using-express-5f1095fcc485)  
[AWS-SDK](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html)  
[AWS-SDK@Client-S3](https://www.npmjs.com/package/@aws-sdk/client-s3)  
[API Best Practices](https://apibestpractices.info/url-design/nested-resources)  
[router.param](https://javascript.plainenglish.io/using-param-middleware-in-express-simplifying-route-validation-36e939635567)  
[Postman to Swagger](https://www.postman.com/postman/postman-public-workspace/documentation/ijkf7ei/postman-to-swagger-oas-2)  
[ChatGPT](https://chat.openai.com)
