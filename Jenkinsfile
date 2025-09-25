pipeline {
  agent any

  options {
    timestamps()
    ansiColor('xterm')
    buildDiscarder(logRotator(numToKeepStr: '30'))
    durabilityHint('MAX_SURVIVABILITY')
  }

  environment {
    NODEJS_TOOL = 'Node20'                 // NodeJS tool name defined in Jenkins global tools
    DOCKER_NS   = '<xuanyelu>'  // DockerHub namespace 
    APP_NAME    = 'find-community'

    IMAGE_TAG    = "${env.BRANCH_NAME == 'main' ? 'latest' : env.BRANCH_NAME}-${env.BUILD_NUMBER}"
    IMAGE_NAME   = "${DOCKER_NS}/${APP_NAME}:${IMAGE_TAG}"
    IMAGE_LATEST = "${DOCKER_NS}/${APP_NAME}:latest"
  }

  tools {
    nodejs "${env.NODEJS_TOOL}"
  }

  stages {

    stage('Build stage') {
      steps {
        deleteDir()
        // Checkout source code from SCM (GitHub/GitLab)
        checkout scm
        sh 'npm ci'
        sh 'npm run build || true'   // Optional build step (non-blocking if not configured)
      }
    }

    stage('Test stage') {
      steps {
        sh 'npm run test:ci'          // Run tests and generate reports/junit/*.xml + coverage
      }
      post {
        always {
          junit testResults: 'reports/junit/*.xml', allowEmptyResults: true
          publishHTML(target: [
            reportName: 'Coverage',
            reportDir : 'coverage/lcov-report',
            reportFiles: 'index.html',
            alwaysLinkToLastBuild: true,
            keepAll: true
          ])
        }
      }
    }

    stage('run code quality analysis') {
      steps {
        sh 'npm run prepare:reports'
        // Save ESLint output for visibility in Jenkins console and archived artifacts
        sh 'npm run lint | tee reports/eslint/eslint.txt || true'
      }
      post {
        always {
          archiveArtifacts artifacts: 'reports/eslint/**', allowEmptyArchive: true
        }
      }
    }

    stage('Security stage') {
      steps {
        // npm audit (does not fail pipeline if issues exist)
        sh 'npm run prepare:reports'
        sh 'npm run audit:json'

        // Trivy scan the project folder for vulnerabilities, secrets, misconfigurations
        sh '''
          docker run --rm \
            -v "$PWD":/scan \
            -w /scan \
            aquasec/trivy:0.53.0 fs --scanners vuln,secret,misconfig \
            --format json -o reports/security/trivy-fs.json . || true
        '''
      }
      post {
        always {
          archiveArtifacts artifacts: 'reports/security/*', allowEmptyArchive: true
        }
      }
    }

    stage('Release stage') {
      when { anyOf { branch 'main'; branch 'master' } }
      steps {
        sh "docker build -t ${IMAGE_NAME} ."

        withCredentials([usernamePassword(
          credentialsId: 'DOCKERHUB_CREDS',       // Pre-created DockerHub credentials in Jenkins
          usernameVariable: 'DU',
          passwordVariable: 'DP'
        )]) {
          sh 'echo "$DP" | docker login -u "$DU" --password-stdin'
          sh "docker push ${IMAGE_NAME}"
          sh """
            docker tag ${IMAGE_NAME} ${IMAGE_LATEST}
            docker push ${IMAGE_LATEST}
          """
          sh 'docker logout || true'
        }
      }
    }

    stage('Deploy stage') {
      when { anyOf { branch 'main'; branch 'master' } }
      steps {
        // Deploy container on Jenkins host, exposed at http://localhost:3001
        sh '''
          set -eux
          APP_PORT=3001
          CONTAINER_NAME=find-community

          docker rm -f "$CONTAINER_NAME" 2>/dev/null || true
          docker run -d --name "$CONTAINER_NAME" \
            -p ${APP_PORT}:3000 \
            --restart unless-stopped \
            ${IMAGE_LATEST}
        '''
      }
    }

    stage('Monitoring and Alerting stage') {
      when { anyOf { branch 'main'; branch 'master' } }
      steps {
        // Health check endpoint with retries (fail build if not ready)
        sh '''
          set +e
          for i in $(seq 1 30); do
            curl -fsS http://localhost:3001/health && exit 0 || true
            echo "Health not ready, retry $i/30..."
            sleep 2
          done
          echo "Health check failed: http://localhost:3001/health"
          exit 1
        '''
      }
    }
  }

  post {
    success {
      echo "Build ${env.BUILD_NUMBER} SUCCESS → ${env.IMAGE_NAME}"
    }
    always {
      archiveArtifacts artifacts: 'npm-debug.log', allowEmptyArchive: true
    }
  }
}
