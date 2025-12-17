# AI-Powered Job Matching Platform

**Group Name:** 404 Group Not Found

**Group Members:**

- James Barbi
- James Kaddissi
- Neel Kulkarni
- Yuvan Rengifo

## Technologies

### Course Technologies

- **React** - Frontend framework
- **Redis** - In-memory database for fast data storage and retrieval
- **GraphQL** - API interface for efficient data queries and real-time updates

### Independent Technologies

- **Docker** - Containerization for consistent runtime behavior
- **AWS** - Cloud deployment platform
- **LLM Implementation** - AI-powered resume matching and job recommendations

## Setup

1. Install/get dependencies: Docker Desktop, Google AI API key (free tier account)
2. Install dependencies in client and server:
```bash
cd server
npm i (include --legacy-peer-deps if any errors)
cd ..
cd client
npm i (include --legacy-peer-deps if any errors)
cd ..
```
3. Run the docker container from the root (command may be docker compose or docker-compose)
```bash
docker-compose -f docker/dockerCompose.yml up --build
```
4. Run seed file within running docker container (not necessary unless you want more data)
```bash
cd server
docker exec -it jobmatch-server node seed.js
```