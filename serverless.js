require("dotenv").config();
const axios = require("axios");
const ethers = require("ethers");
// const { abis, addresses } = require("../contracts");

// exports.handler =
async function main() {
	console.log("Starting...");
	// Load Contract ABIs
	const DummyStorageABI = require("./abii.json");

	console.log("Contract ABIs loaded");

	// Initialize Ethers wallet
	const provider = new ethers.getDefaultProvider(parseInt("4"));

	// Connect to mainnet with a Project ID and Project Secret
	// provider = new ethers.providers.InfuraProvider("rinkeby", {
	// 	projectId: process.env.PROJECTID,
	// 	projectSecret: process.env.PROJECTSECRET",
	// });

	// Connect to the INFURA WebSocket endpoints with a WebSocketProvider
	// provider = ethers.providers.InfuraProvider.getWebSocketProvider();

	let wallet = ethers.Wallet.fromMnemonic(process.env.WALLETMN);
	wallet = wallet.connect(provider);
	console.log("Ethers wallet loaded");
	// let gs = await wallet.estimateGas();
	// console.log(gs);
	// let wal = await wallet.getBalance();
	// console.log(wal);
	// Load contract
	const contract = new ethers.Contract(
		process.env.CONTRACTADDRESS,
		DummyStorageABI,
		wallet
	);
	console.log("Contract loaded");

	console.log("Sending transaction...");
	try {
		// Specify custom tx overrides, such as gas price https://docs.ethers.io/ethers.js/v5-beta/api-contract.html#overrides
		const overrides = { gasLimit: "3000000" };

		// Call smart contract function `put(uint)`
		const RANDOM_INTEGER = Math.floor(Math.random() * 100); // returns a random integer from 0 to 99
		const tx = await contract.tokenURI("4", overrides);
		// const tx = await contract.mintToken(
		// 	"0x4033Fa14e9c72b8ab023911848B4041676D6f279",
		// 	"bafyreihpxajpa5xa35zthcdqidebpg53pnu7qbyox76iq6lmaa7uhysliq/metadata.json",
		// 	overrides
		// );

		console.log(tx);
		// const successMessage = `:white_check_mark: Transaction sent https://rinkeby.etherscan.io/tx/${tx.hash}`;
		// console.log(successMessage);
		// await postToSlack(successMessage);
	} catch (err) {
		const errorMessage = `:warning: Transaction failed: ${err.message}`;
		console.error(errorMessage);
		// await postToSlack(errorMessage);
		return err;
	}

	console.log("Completed");
	// return true;
}

// function postToSlack(text) {
//   const payload = JSON.stringify({
//     text,
//   });
//   return axios.post(process.env.SLACK_HOOK_URL, payload)
// }
main();
