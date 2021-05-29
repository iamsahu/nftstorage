const axios = require("axios");
const fs = require("fs");
const NFT = require("nft.storage");
const endpoint = process.env.NFTSTORAGEENDPOINT;
const token = process.env.NFTSTORAGETOKEN;

exports.handler = async (event) => {
	console.log(event.body);
	// TODO implement

	const body = JSON.parse(event.body);

	//Download Image, Upload it to IPFS
	const storage = new NFT.NFTStorage({ endpoint, token });
	const response = await axios.get(body.SourceUrl, {
		responseType: "arraybuffer",
	});
	const buffer = Buffer.from(response.data, "utf-8");
	console.log("Hello");
	// console.log(response);
	try {
		const metadata = await storage.store({
			description: body.caption,
			image: new NFT.File([response.data], "pinpie.png", {
				type: "image/jpg",
			}),
		});
		console.log("IPFS URL for the metadata:", metadata.url);
		console.log("metadata.json contents:\n", metadata.data);
		console.log(
			"metadata.json contents with IPFS gateway URLs:\n",
			metadata.embed()
		);
	} catch (error) {
		console.log("Error:", error);
	}

	console.log(body);
	const response = {
		statusCode: 200,
		body: JSON.stringify("Hello from Lambda!"),
	};
	return response;
};
