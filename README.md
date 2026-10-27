SkillBridge — Freelancing Marketplace

SkillBridge is a full-stack freelancing marketplace built using the MERN stack. It connects clients looking for skilled professionals with freelancers searching for work opportunities.

The platform allows clients to post projects, receive proposals, hire freelancers, manage contracts, and make payments. Freelancers can discover projects, submit proposals, list their services, communicate with clients, and manage their work through a unified dashboard.

1. Project Name

SkillBridge — A Full-Stack Freelancing Marketplace

2. Problem Statement

Finding reliable freelancers and managing freelance projects can be challenging for clients. Similarly, freelancers often struggle to discover suitable opportunities, communicate with clients, and manage their work efficiently.

Many freelancing workflows involve multiple activities, including project discovery, hiring, communication, contract management, and payment processing.

SkillBridge aims to simplify these activities by bringing them together into a single platform.

3. Target Users

SkillBridge is designed for two primary types of users.

Clients

Individuals, startups, and businesses looking to hire freelancers for specific projects.

Clients can:

* Post projects with descriptions, budgets, and required skills.
* Browse freelancer services.
* Review proposals submitted by freelancers.
* Hire freelancers and manage contracts.
* Communicate with freelancers.
* Make payments and review completed work.

Freelancers

Individuals who want to offer their skills and find freelance opportunities.

Freelancers can:

* Discover projects based on their skills.
* Submit proposals and bid on projects.
* Create and manage service listings.
* Communicate with clients.
* Submit completed work.
* Track their contracts and orders.

4. Solution

SkillBridge provides a centralized marketplace where clients and freelancers can manage the complete freelancing process.

The platform supports two primary workflows.

Project-Based Hiring

1. A client creates a project with a description, budget, and required skills.
2. Freelancers discover the project through search and filters.
3. Interested freelancers submit proposals.
4. The client reviews proposals and selects a freelancer.
5. A contract is created between the client and freelancer.
6. The users communicate and manage the work.
7. The freelancer submits the completed work.
8. The client reviews the submission and can request revisions or approve completion.

Service-Based Hiring

1. A freelancer creates a service listing.
2. Clients browse available services.
3. A client selects a service and places an order.
4. The order is managed through the platform.
5. The freelancer completes the requested work.

These workflows reduce the need to manage freelance projects across multiple applications.

5. Key Features

Authentication and User Management

* User registration and login.
* JWT-based authentication.
* Secure password hashing using bcrypt.
* Client and freelancer roles.
* Protected API endpoints.
* User profiles.

Project Marketplace

* Create and browse freelance projects.
* Add project descriptions, budgets, and required skills.
* Search projects using keywords.
* Filter projects by skills and budget.
* Sort and explore available opportunities.

Proposals and Hiring

* Freelancers can submit proposals.
* Clients can review proposals.
* Clients can accept proposals and hire freelancers.
* Accepted proposals are connected to contracts.

Freelancer Services

* Freelancers can create service listings.
* Clients can browse available services.
* Service-based ordering functionality.

Contract Management

* Contract creation and tracking.
* Work submission by freelancers.
* Revision requests.
* Work approval and completion tracking.

Payments

* Razorpay Test Mode integration.
* Payment order creation through the backend.
* Payment signature verification.
* Payment records stored in MongoDB.
* Payment status tracking.

Note: Razorpay is integrated in Test Mode for demonstration purposes. The application does not process real-money transactions in this configuration.

Messaging

* Communication between clients and freelancers.
* Persistent message storage.
* Conversation management.

Dashboards

* Role-based dashboard functionality.
* Project and proposal information.
* Contract and order tracking.
* Overview of relevant marketplace activities.

Ratings and Reviews

* Review functionality for completed work.
* Ratings to help users evaluate their experience.

User Experience

* Responsive marketplace interface.
* Search and filtering.
* Form validation.
* Loading and error feedback.
* Reusable interface components.

6. Tech Stack

Frontend

* React.js — Building the user interface.
* Vite — Frontend development and build tooling.
* JavaScript — Application logic.
* CSS — Styling and responsive layouts.

Backend

* Node.js — JavaScript runtime.
* Express.js — REST API development.
* JWT — Authentication.
* bcrypt — Password hashing.

Database

* MongoDB Atlas — Cloud-hosted database.
* Mongoose — MongoDB object modeling and database operations.

Payment Integration

* Razorpay Test Mode — Demonstration payment processing and verification.

Development Tools

* Git — Version control.
* GitHub — Source code hosting.
* Visual Studio Code — Development environment.
* npm — Package management.

7. Architecture

SkillBridge follows a client-server architecture.

                    USER
                     |
                     v
             React Frontend
               (Vite + CSS)
                     |
                     | HTTP Requests
                     v
              Express REST API
                (Node.js)
                     |
          +----------+----------+
          |          |          |
          v          v          v
     Authentication Projects  Payments
          |          |          |
          +----------+----------+
                     |
                     v
                Mongoose
                     |
                     v
               MongoDB Atlas

Frontend Architecture

The frontend is developed using React and Vite.

It is responsible for:

* Displaying marketplace pages and dashboards.
* Managing user interactions.
* Handling forms and navigation.
* Sending requests to backend APIs.
* Displaying project, proposal, contract, and payment information.

The frontend also uses reusable components and custom hooks for selected functionality.

Backend Architecture

The backend is developed using Node.js and Express.js.

It provides REST APIs for:

* Authentication
* Projects
* Proposals
* Contracts
* Freelancer services
* Orders
* Payments
* Messaging
* Reviews
* Freelancer information
* Dashboard data

The backend uses middleware for authentication and authorization.

Database Architecture

MongoDB Atlas stores application data, including:

* Users
* Projects
* Proposals
* Contracts
* Services
* Orders
* Payments
* Messages
* Reviews

Mongoose is used to define data models and perform database operations.

Payment Architecture

Payment processing is handled through the backend.

1. The frontend initiates a payment request.
2. The backend creates a Razorpay test order.
3. Razorpay Checkout handles the payment interaction.
4. The backend verifies the payment details and signature.
5. Verified payment information is stored in MongoDB.

This approach helps prevent the frontend from directly controlling payment verification.

8. Local Setup

Prerequisites

Ensure the following are installed or available:

* Node.js
* npm
* Git
* MongoDB Atlas database
* Razorpay Test Mode credentials

Step 1: Clone the Repository

git clone https://github.com/SamadSabharwal/SkillBridge.git

Navigate to the project directory:

cd SkillBridge

Step 2: Install Backend Dependencies

cd server
npm install

Step 3: Configure Backend Environment Variables

Create a .env file inside the server directory.

Add the required environment variables described in the next section.

Step 4: Start the Backend

npm run dev

The backend will start on the port configured for the application.

Step 5: Install Frontend Dependencies

Open another terminal and navigate to the frontend directory:

cd SkillBridge/client
npm install

If you are already inside the server directory, use:

cd ../client
npm install

Step 6: Start the Frontend

npm run dev

Vite will display a local development URL in the terminal.

Open that URL in your browser to access SkillBridge.

Step 7: Build the Frontend

To generate a production build:

npm run build

The generated production files will be placed in the frontend build directory.

9. Environment Variables

SkillBridge uses environment variables to manage sensitive configuration.

Create a .env file inside the server directory.

Backend Environment Variables

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret_at_least_32_characters
PORT=8080
RAZORPAY_KEY_ID=your_razorpay_test_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret

Explanation

Variable	Purpose
MONGO_URI	MongoDB Atlas connection string
JWT_SECRET	Secret used to sign and verify authentication tokens
PORT	Backend server port
RAZORPAY_KEY_ID	Razorpay Test Mode key identifier
RAZORPAY_KEY_SECRET	Razorpay Test Mode secret key

Security Notes

* Never commit .env files to GitHub.
* Never expose database passwords or JWT secrets.
* Keep Razorpay secret keys on the backend.
* Use Test Mode credentials when demonstrating payments.
* Configure environment variables securely on the deployment platform.

10. Deployment

SkillBridge consists of a React frontend and an Express backend connected to MongoDB Atlas.

Live Application

Frontend URL:

https://skill-bridge-pi-eight.vercel.app/

Backend URL:

https://dashboard.render.com/project/prj-dbgadj4ipgvc73f0j1hg/environment/evm-dbgadj4ipgvc73f0j1i0

GitHub Repository

SkillBridge — GitHub Repository

Deployment Configuration

The deployment requires:

1. Hosting the frontend application.
2. Hosting the Express backend.
3. Configuring the MongoDB Atlas connection.
4. Adding the required environment variables to the backend hosting platform.
5. Configuring the frontend to communicate with the deployed backend.
6. Ensuring the deployed application is publicly accessible.

11. Demo Video

A demonstration video showcasing the main features and workflows of SkillBridge.

Demo Video Link:

https://drive.google.com/file/d/14FO3U1ks7B9uQET8nQ0GoeL_faZo74x3/view?usp=sharing

The demonstration covers:

* Application overview.
* Authentication and user roles.
* Project creation.
* Proposal submission.
* Freelancer hiring.
* Contract management.
* Razorpay Test Mode payment.
* Messaging.
* Work submission and completion.
* User dashboards.

12. Conclusion

SkillBridge demonstrates the development of a full-stack freelancing marketplace using the MERN stack.

The project integrates frontend development, backend REST APIs, database management, authentication, authorization, marketplace workflows, and payment verification.

By combining project hiring, freelancer services, communication, contract management, and payments into a single application, SkillBridge provides a practical solution for connecting clients and freelancers.

⸻

Developed by: Samad Sabharwal
Project: SkillBridge
Technology: MERN Stack
