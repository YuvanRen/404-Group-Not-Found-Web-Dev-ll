# AI-Powered Job Matching Platform

**Group Name:** 404 Group Not Found

**Group Members:**
- James Barbi 
- James Kaddiss
- Neel Kulkarni 
- Yuvan Rengifo
- Shantel Alvarez

## Technologies

### Course Technologies
- **React** - Frontend framework
- **Redis** - In-memory database for fast data storage and retrieval
- **GraphQL** - API interface for efficient data queries and real-time updates

### Independent Technologies
- **Docker** - Containerization for consistent runtime behavior
- **AWS** - Cloud deployment platform
- **LLM Implementation** - AI-powered resume matching and job recommendations

## Project Structure

```
404-Group-Not-Found-Web-Dev-ll
│
├── client/                          # React frontend application
│   ├── public/
│   │   └── index.html              # HTML template
│   ├── src/
│   │   ├── components/            
│   │   │   ├── CreateJobForm.js   
│   │   │   └── CreateJobForm.css  
│   │   ├── pages/                  # Page components
│   │   │   ├── Landing/            # Landing page
│   │   │   │   ├── Landing.js
│   │   │   │   └── Landing.css
│   │   │   ├── Login/              # Login page
│   │   │   │   ├── Login.js
│   │   │   │   └── Login.css
│   │   │   ├── Signup/             # Signup page
│   │   │   │   ├── Signup.js
│   │   │   │   └── Signup.css
│   │   │   └── Dashboard/          # User dashboard
│   │   │       ├── Dashboard.js
│   │   │       └── Dashboard.css
│   │   ├── graphql/                # GraphQL client setup
│   │   │   ├── client.js          
│   │   │   ├── queries.js         
│   │   │   └── mutations.js       
│   │   ├── utils/                  # Utility functions
│   │   │   └── validation.js     
│   │   ├── App.js                  
│   │   ├── App.css                
│   │   ├── index.js                
│   │   └── index.css               
│   └── package.json                # Frontend dependencies
│
├── server/                          # GraphQL backend server
│   ├── config/
│   │   └── redisConnection.js    
│   ├── data/                       # Data access layer
│   │   ├── users.js               
│   │   └── jobs.js               
│   ├── graphql/                    # GraphQL schema and resolvers
│   │   ├── schema.js              
│   │   └── resolvers.js           
│   ├── routes/                     # Express routes
│   │   └── llmMatchRoute.js       # LLM matching route (placeholder)
│   ├── index.js                    
│   └── package.json               
│
├── docker/                          # Docker configuration
│   ├── clientDockerfile         
│   ├── serverDockerfile           
│   └── dockerCompose.yml          
│
├── .gitignore                      
├── LICENSE                         
└── README.md                       
```

## Getting Started

### Prerequisites
- Docker and Docker Compose installed
- Node.js 18+ (for local development)

### Steps to Run the Application

#### Option 1: Using Docker (Recommended)

1. **Navigate to the project root directory**
   ```bash
   cd 404-Group-Not-Found-Web-Dev-ll
   ```

2. **Start all services with Docker Compose**
   ```bash
   docker-compose -f docker/dockerCompose.yml up --build
   ```
   
   This will:
   - Build Docker images for client and server
   - Start Redis container
   - Start the GraphQL server on port 4000
   - Start the React client on port 3000

3. **Access the application**
   - Frontend: http://localhost:3000
   - GraphQL API: http://localhost:4000/graphql
   - GraphiQL Interface: http://localhost:4000/graphql (in development mode)

4. **Stop the application**
   ```bash
   docker-compose -f docker/dockerCompose.yml down
   ```

#### Option 2: Running Locally (Without Docker)

1. **Start Redis**
   - Make sure Redis is installed and running on port 6379

2. **Set up the Backend**
   ```bash
   cd server
   npm install --legacy-peer-deps
   npm start
   ```
   The server will run on http://localhost:4000

3. **Set up the Frontend** (in a new terminal)
   ```bash
   cd client
   npm install
   npm start
   ```
   The React app will open at http://localhost:3000


## API Endpoints

### GraphQL Endpoint
- **URL:** `http://localhost:4000/graphql`
- **Method:** POST
- **GraphiQL:** Available at the same URL in development mode

### Example Queries

#### Signup
```graphql
mutation {
  signup(input: {
    email: "user@example.com"
    password: "password123"
    name: "John Doe"
    userType: "jobseeker"
  }) {
    user {
      id
      email
      name
      userType
    }
    token
  }
}
```

#### Login
```graphql
mutation {
  login(input: {
    email: "user@example.com"
    password: "password123"
  }) {
    user {
      id
      email
      name
      userType
    }
    token
  }
}
```

#### Get Jobs
```graphql
query {
  getJobs(filters: {
    type: "full-time"
    field: "Software"
  }) {
    id
    title
    description
    field
    type
    skills
  }
}
```
