// import fs from "fs";
// import { NFTStorage, File } from "nft.storage";
require("dotenv").config();
const axios = require("axios");
const fs = require("fs");
const NFT = require("nft.storage");
const endpoint = process.env.NFTSTORAGEENDPOINT;
const token = process.env.NFTSTORAGETOKEN;

async function main() {
	const storage = new NFT.NFTStorage({ endpoint, token });
	const response = await axios.get(
		// "https://pngimg.com/uploads/light/light_PNG14440.png",
		"https://scontent-ort2-1.cdninstagram.com/v/t51.29350-15/194261179_1115936125554080_3706821304686187356_n.jpg?_nc_cat=102&ccb=1-3&_nc_sid=8ae9d6&_nc_ohc=RKDOQVNuCvwAX-gQrFl&_nc_ht=scontent-ort2-1.cdninstagram.com&oh=5283dacc3ddb1377e38fdc70c92b85c8&oe=60B68BCD",
		{ responseType: "arraybuffer" }
	);
	const buffer = Buffer.from(response.data, "utf-8");
	console.log("Hello");
	// console.log(response);
	try {
		const metadata = await storage.store({
			name: "nft.storage store test",
			description:
				"Using the nft.storage metadata API to create ERC-1155 compatible metadata.",
			image: new NFT.File(
				[response.data],
				// [await fs.promises.readFile("pinpie.png")],
				"pinpie.png",
				{
					type: "image/png",
				}
			),
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
}
main();
