const MagicNumbers = artifacts.require("MagicNumbers");

// require("dotenv").config();

module.exports = async function (deployer, network) {
    await deployer.deploy(MagicNumbers);
};
