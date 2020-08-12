const Wait = require("testcontainers/dist/wait").Wait

const GenericContainer = require("testcontainers").GenericContainer

const LOCALSTACK_PORT = 4566

const startContainer = () => new GenericContainer("localstack/localstack")
    .withExposedPorts(LOCALSTACK_PORT)
    .withDefaultLogDriver()
    .withWaitStrategy(
        Wait.forLogMessage("Ready.")
    )
    .start()

module.exports = async () => {
    console.log("Stating localstack/localstack...")
    const container = await startContainer()
    console.log("...done.")
    // globalSetup scripts' global variable is different from the one with which the tests are run
    global.container = container
    // set this to let setupIntegrationTest.js initialize the aws config based on the container
    process.env.CONTAINER_URL = "http://" + container.getContainerIpAddress() + ":" + container.getMappedPort(LOCALSTACK_PORT)
}
