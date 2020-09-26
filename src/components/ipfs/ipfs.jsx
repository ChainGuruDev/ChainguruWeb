import ipfsClient from "ipfs-http-client";

const ipfs = ipfsClient({
  host: "ipfs.infura.io",
  protocol: "https",
});

export default ipfs;
