require("dotenv").config();
const axios = require("axios");
const fs = require("fs");
const NFT = require("nft.storage");
const endpoint = process.env.NFTSTORAGEENDPOINT;
const token = process.env.NFTSTORAGETOKEN;
const ethers = require("ethers");

const fetch = require("node-fetch");

const adminSecret = process.env.ADMIN_SECRET;
const hgeEndpoint = process.env.HGE_ENDPOINT;

const query = `
mutation MyMutation($caption:String,$fileURL:String,$name:String,$userAddress:String) {
    insert_test_schema_test_data(objects: [{caption: $caption, fileURL: $fileURL, name: $name, userAddress: $userAddress}]) {
      returning {
        id
      }
    }
  }
`;

async function main() {
	// console.log(event.body);
	// TODO implement

	// const body = JSON.parse(event.body);
	let imageName =
		"https://scontent-ort2-1.cdninstagram.com/v/t51.29350-15/194261179_1115936125554080_3706821304686187356_n.jpg?_nc_cat=102&ccb=1-3&_nc_sid=8ae9d6&_nc_ohc=RKDOQVNuCvwAX-gQrFl&_nc_ht=scontent-ort2-1.cdninstagram.com&oh=5283dacc3ddb1377e38fdc70c92b85c8&oe=60B68BCD";
	//Download Image, Upload it to IPFS
	const storage = new NFT.NFTStorage({ endpoint, token });
	const response = await axios.get(imageName, {
		responseType: "arraybuffer",
	});
	const buffer = Buffer.from(response.data, "utf-8");
	console.log("Image downloaded");
	imageName = imageName.split("?");
	imageName = imageName[0].split("/");
	imageName = imageName[imageName.length - 1];
	console.log("Image Name extracted");
	console.log("Token:", process.env.NFTSTORAGETOKEN);
	let metaURI = "";
	try {
		const metadata = await storage.store({
			name: imageName,
			description: "Test Caption",
			image: new NFT.File([response.data], imageName, {
				type: "image/jpg",
			}),
		});
		console.log("IPFS URL for the metadata:", metadata.url);
		metaURI = metadata.url.replace("ipfs://", "");
		// console.log("metadata.json contents:\n", metadata.data);
		// console.log(
		// 	"metadata.json contents with IPFS gateway URLs:\n",
		// 	metadata.embed()
		// );
	} catch (error) {
		console.log("Error:", error);
		const result = {
			statusCode: 400,
			body: JSON.stringify(error),
		};
		return result;
	}

	//Minting NFT
	console.log("Minting NFT begins");
	const DummyStorageABI = require("./abii.json");
	console.log("Contract ABIs loaded");

	// Initialize Ethers wallet
	const provider = new ethers.getDefaultProvider(parseInt("4"));
	let wallet = ethers.Wallet.fromMnemonic(process.env.WALLETMN);
	wallet = wallet.connect(provider);
	console.log("Ethers wallet loaded");
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
		const tx = await contract.mintToken(
			process.env.USERADD,
			metaURI,
			overrides
		);

		console.log(tx);
		const successMessage = `:white_check_mark: Transaction sent https://rinkeby.etherscan.io/tx/${tx.hash}`;
		console.log(successMessage);
	} catch (err) {
		const errorMessage = `:warning: Transaction failed: ${err.message}`;
		console.error(errorMessage);
		const result = {
			statusCode: 400,
			body: JSON.stringify(errorMessage),
		};
		return result;
		// await postToSlack(errorMessage);
		return err;
	}

	console.log("Completed");

	//Insert Data
	let request;
	const response2 = {
		statusCode: 200,
		body: "success",
	};
	const qv = {
		caption: imageName,
		fileURL:
			"https://scontent-ort2-1.cdninstagram.com/v/t51.29350-15/194261179_1115936125554080_3706821304686187356_n.jpg?_nc_cat=102&ccb=1-3&_nc_sid=8ae9d6&_nc_ohc=RKDOQVNuCvwAX-gQrFl&_nc_ht=scontent-ort2-1.cdninstagram.com&oh=5283dacc3ddb1377e38fdc70c92b85c8&oe=60B68BCD",
		name: "test",
		userAddress: "test",
	};
	try {
		fetch(hgeEndpoint + "/v1/graphql", {
			method: "POST",
			body: JSON.stringify({ query: query, variables: qv }),
			headers: {
				"Content-Type": "application/json",
				"x-hasura-admin-secret": adminSecret,
			},
		})
			.then((res) => res.json())
			.then((json) => {
				console.log(json);
				// callback(null, response2);
			});
	} catch (error) {
		console.log("Error Data Submission: ", error);
	}

	const result = {
		statusCode: 200,
		body: JSON.stringify("Hello from Lambda!"),
	};
	return result;
}
main();
