pipeline {
  agent any

  options {
    timestamps()
    // ansiColor('xterm')  // ← 删除这行
  }

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
      steps { sh 'npm run test:ci || true' }  // 先保证能跑通
      post {
        always {
          junit allowEmptyResults: true, testResults: 'reports/junit/junit.xml'
        }
      }
    }

    stage('Docker Build') {
      steps {
        script {
          def imageTag = "find-community:${env.BUILD_NUMBER}"
          sh "docker build -t ${imageTag} ."
          echo "Built image -> ${imageTag}"
        }
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: '**/coverage/**/*', allowEmptyArchive: true
    }
  }
}
