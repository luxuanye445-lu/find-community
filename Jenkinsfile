pipeline {
  agent any
  options { timestamps() }

  environment {
    IMAGE_NAME = 'find-community'
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Node CI (Install, Build, Test)') {
      steps {
        script {
          docker.image('node:20-alpine').inside('-u root') {
            sh 'node -v && npm -v'
            sh 'npm ci'
            sh 'npm run build'
            sh 'npm run test:ci || true'  
          }
        }
      }
      post {
        always {
          junit allowEmptyResults: true, testResults: 'reports/junit/junit.xml'
        }
      }
    }

    stage('Docker Build') {
      steps {
        script {
          sh 'docker version'
          def tag = "${env.BUILD_NUMBER}"
          sh "docker build -t ${IMAGE_NAME}:${tag} ."
          sh "docker tag ${IMAGE_NAME}:${tag} ${IMAGE_NAME}:latest"
          echo "Built image -> ${IMAGE_NAME}:${tag}"
        }
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'reports/**/*.xml', allowEmptyArchive: true
    }
  }
}

