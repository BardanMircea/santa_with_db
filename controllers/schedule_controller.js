const { Elf, Schedule } = require("../models");
const bcrypt = require("bcrypt");
const { checkForQueryParams } = require("../utils/utils");
const express = require("express")
const schedule_router = express.Router()

// CRUD (GET and update) for Schedules
// get all scheduled wishes for a specific elf
schedule_router.get("/", checkForQueryParams, async (req, res) => {
    const elf = await Elf.findOne({ where: { login: req.query.login } });
    if (elf) {
        if (bcrypt.compareSync(req.query.password, elf.password)) {
            res.json(await Schedule.findAll({ where: { elf_id: elf.id } }));
            return;
        }
    }
    res.status(404).send("Elf credentials not found");

});
// update a Schedule / mark as done (if it is not already done)
schedule_router.put("/:idSchedule/done", async (req, res) => {
    const schedule = await Schedule.findByPk(req.params.idSchedule);

    if (schedule && !schedule.done) {
        await Schedule.update({ done: true, done_at: new Date() }, { where: { id: schedule.id } });
        res.json(await Schedule.findByPk(schedule.id));
    } else {
        res.status(404).send(schedule ? "Scheduled task is already done" : "Schedule not found");
    }
});

module.exports = {schedule_router}
