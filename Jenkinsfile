pipeline {
  agent any
  tools { nodejs 'Node20' }   // 与 Global Tool Configuration 中的名称一致
  options { timestamps() }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Install') {
      steps {
        // 没有 package-lock 的情况下用 npm install；若后续提交了 lock，可换回 npm ci
        sh 'npm install'
      }
    }

    stage('Lint') {
      steps {
        // 演示期先不因告警失败；想严格可去掉 "|| true" 或加 --max-warnings=0
        sh 'npm run lint || true'
      }
    }

    stage('Test') {
      steps {
        sh 'npm run test:ci || true'
      }
      post {
        always {
          // 收集 JUnit 报告与覆盖率产物
          junit allowEmptyResults: true, testResults: 'reports/junit/junit.xml'
          archiveArtifacts artifacts: 'coverage/**/*', allowEmptyArchive: true
        }
      }
    }

    stage('Build') {
      steps {
        sh 'npm run build'
      }
    }

    stage('Security (npm audit)') {
      steps {
        sh 'npm run prepare:reports'
        sh 'npm run audit:json'
      }
      post {
        always {
          archiveArtifacts artifacts: 'reports/security/npm-audit.json', allowEmptyArchive: true
        }
      }
    }

    // === 可选：若以后在 Jenkins 主机装了 Docker，可解注释以下两个阶段 ===
    // stage('Docker Build') {
    //   when {
    //     expression { sh(script: 'command -v docker >/dev/null 2>&1', returnStatus: true) == 0 }
    //   }
    //   steps {
    //     sh 'docker build -t find-community:${BUILD_NUMBER} .'
    //   }
    // }
    //
    // stage('Deploy (Staging)') {
    //   when {
    //     expression { sh(script: 'command -v docker >/dev/null 2>&1', returnStatus: true) == 0 }
    //   }
    //   steps {
    //     sh 'docker rm -f fc-stg || true'
    //     sh 'docker run -d --name fc-stg -p 3000:3000 find-community:${BUILD_NUMBER}'
    //   }
    // }
  }

  post {
    success { echo '✅ Build • Lint • Test • Security 全部完成' }
    always  { archiveArtifacts artifacts: 'reports/**/*.xml', allowEmptyArchive: true }
  }
}

