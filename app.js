const express = require("express")
const app = express()
exports.app = app
const port = 3000
const bodyParser = require("body-parser")
const {toy_router} = require("./controllers/toy_controller")
const {category_router} = require("./controllers/category_controller")
const { elf_router } = require("./controllers/elf_controller")
const {wish_router} = require("./controllers/wish_controller")
const {schedule_router} = require("./controllers/schedule_controller")

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.use('/toys', toy_router)
app.use('/categories', category_router)
app.use('/elves', elf_router)
app.use('/wishes', wish_router)
app.use('/schedules', schedule_router)

// start the app
app.listen(port,  () => {
    console.log(`Listening on port ${port}`)
})