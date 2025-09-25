# Find Community — CI/CD Starter (Node.js + Express)

This is a minimal, **CI-ready** scaffold for your *Find Community* project.
It includes:
- A tiny Express API (`/health`) so the app can run immediately.
- A unit test (Jest + Supertest) so the CI Test stage is meaningful.
- A `Dockerfile` so the Build stage can output a deployable image.
- A `Jenkinsfile` with Checkout → Install → Build → Test → Docker Build stages.

## 1) Run locally
```bash
npm ci
npm test
npm start
# open http://localhost:3000/health
```

## 2) Build a Docker image
```bash
docker build -t find-community:dev .
docker run --rm -p 3000:3000 find-community:dev
```

## 3) Jenkins
Create a Pipeline in Jenkins pointing to your Git repo containing this project.
The provided `Jenkinsfile` will:
- Install deps (`npm ci`)
- Build (`npm run build` — currently a placeholder)
- Test (`npm run test:ci` with JUnit output at `reports/junit/junit.xml`)
- Docker build (tags with Jenkins BUILD_NUMBER)

## 4) Extend next
- Add real API routes and database access (e.g., MongoDB).
- Add more tests (unit/integration).
- Enable Code Quality (SonarQube/CodeClimate) and Security (npm audit/Snyk).
- Add Deploy/Release/Monitoring stages.

## Notes
- Adjust Node version in `Dockerfile` if required.
- If Jenkins runs in Docker, ensure it can reach the host Docker daemon (Docker-out-of-Docker or DinD).