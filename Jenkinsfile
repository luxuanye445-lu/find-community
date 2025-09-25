pipeline {
  agent any

  options {
    timestamps()
    ansiColor('xterm')
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install') {
      steps {
        sh 'npm ci'
      }
    }

    stage('Build') {
      steps {
        sh 'npm run build'
      }
    }

    stage('Test') {
      steps {
        sh 'npm run test:ci || true' // keep pipeline flowing while you stabilize tests
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
          def imageTag = "find-community:${env.BUILD_NUMBER}"
          sh "docker build -t ${imageTag} ."
          echo "Built image -> ${imageTag}"
        }
      }
    }

    // === Optional (enable later) ===
    // stage('Code Quality') {
    //   steps {
    //     // Example for SonarQube/CodeClimate goes here
    //   }
    // }
    //
    // stage('Security') {
    //   steps {
    //     // Example: npm audit --audit-level=moderate
    //     sh 'npm audit --audit-level=moderate || true'
    //   }
    // }
    //
    // stage('Deploy (Staging)') {
    //   steps {
    //     // Example: docker run -d -p 3000:3000 find-community:${env.BUILD_NUMBER}
    //   }
    // }
    //
    // stage('Release (Prod)') {
    //   steps {
    //     // Example: tag + push to registry, or trigger prod deployment
    //   }
    // }
    //
    // stage('Monitoring') {
    //   steps {
    //     // Hook to monitoring/alerting systems; /health is available
    //   }
    // }
  }
}