
def defaults = [:]
defaults['version'] = 'latest'
def version = params.version == null ? defaults['version'] : params.version

def label = "worker-${UUID.randomUUID().toString()}"
def SERVICE_NAME = "firebase-auth-connector"
def dockerhubUser = "surfadvisor"
def registry = "${dockerhubUser}/${SERVICE_NAME}"
def registryCredential = 'dockerhub'
def REPOSITORY_TAG="${registry}:${version}"
def dockerImage = ''

podTemplate(label: label, serviceAccount: 'jenkins-stg', containers: [
  containerTemplate(name: 'docker', image: 'docker', command: 'cat', ttyEnabled: true),
  containerTemplate(name: 'kubectl', image: 'lachlanevenson/k8s-kubectl:v1.16.0', command: 'cat', ttyEnabled: true)
],
volumes: [
  hostPathVolume(mountPath: '/var/run/docker.sock', hostPath: '/var/run/docker.sock')
]) {

  node(label) {
    parameters {
       string(defaultValue: defaults['version'], description: 'Dictionary version?', name: 'version')
    }

    stage('Clone git') {
          git credentialsId: 'jenkins-github', url: "https://github.com/surfadvisor/${SERVICE_NAME}"
    }

    stage('Build image') {
         container('docker') {
           script {
             dockerImage = docker.build("${REPOSITORY_TAG}")
             docker.withRegistry( '', registryCredential ) {
                dockerImage.push()
             }
           }
         }
    }

    stage('Deploy to Cluster') {
        container('kubectl') {
          sh 'kubectl apply -f ${WORKSPACE}/deploy.yaml'
        }
    }
  }
}
