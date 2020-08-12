module.exports = async () => {
    console.log("Terminating container.")
    await global.container.stop()
}
