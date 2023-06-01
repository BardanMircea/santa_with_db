const { Elf } = require("../models");
const { hashPassword, checkElfAttributes, setPassword, checkUniqueLogin } = require("../utils/utils");
const express = require("express")
const elf_router = express.Router();

// CRUD for Elves
// get all elves
elf_router.get("/", async (req, res) => {
    res.json(await Elf.scope('withoutPassword').findAll()); // added scope to get the Elf without the password attribute
});
// get a specific elf by id
elf_router.get("/:idElf", async (req, res) => {
    const elf = await Elf.scope('withoutPassword').findByPk(req.params.idElf);
    if (elf) {
        res.json(elf);
    } else {
        res.status(404).send("Elf not found");
    }
});
// create new elf
elf_router.post("/", checkElfAttributes, checkUniqueLogin, async (req, res) => {
    req.body.password = hashPassword(req.body.password);
    const elf = await Elf.create(req.body);
    res.json(await Elf.scope('withoutPassword').findByPk(elf.id));
});
// update an elf
elf_router.put("/:idElf", checkUniqueLogin, async (req, res) => {
    const elf = await Elf.findByPk(req.params.idElf);
    if (elf) {
        const password = setPassword(req.body.password, elf.password);
        await Elf.update({
            firstName: req.body.firstName ? req.body.firstName : elf.firstName,
            lastName: req.body.lastName ? req.body.lastName : elf.lastName,
            login: req.body.login ? req.body.login : elf.login,
            password: password
        }, { where: { id: elf.id } });
        res.json(await Elf.scope('withoutPassword').findByPk(elf.id));
    } else {
        res.status(404).send("Elf not found");
    }
});
// delete an elf
elf_router.delete("/:idElf", async (req, res) => {
    const elf = await Elf.scope('withoutPassword').findByPk(req.params.idElf);
    if (elf) {
        await Elf.destroy({ where: { id: elf.id } });
        res.json(elf);
    } else {
        res.status(404).send("Elf not found");
    }
});

module.exports = {elf_router}