pipeline {
  agent any
  tools { nodejs 'Node20' }   
  options { timestamps() }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Install') {
      steps { sh 'npm ci' }
    }

    stage('Build') {
      steps { sh 'npm run build' }
    }

    stage('Test') {
      steps { sh 'npm run test:ci || true' }
      post {
        always {
          junit allowEmptyResults: true, testResults: 'reports/junit/junit.xml'
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

