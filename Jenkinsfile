pipeline {
    
    agent any/*{
        docker {
            image 'maven:3.8.1-adoptopenjdk-11'
            args '--privileged -v /home/jenkins/.m2:/home/jenkins/.m2' 
        }
    }*/
    
    environment {
        //Use Pipeline Utility Steps plugin to read information from pom.xml into env variables
        IMAGE = "node-online-service"
    }
    
    stages {
        stage('Build docker image') {
             steps {
                sh '''
                export IMAGE
                export VERSION
		            sh ./jenkins/buildDockerImage.sh
                '''
            }
        }
        stage('Deploy') {
            steps {
                sh '''
                export IMAGE
                export VERSION
                    sh ./jenkins/deployDockerImage.sh
                '''
            }
        }
    }
}