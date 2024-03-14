import { MetaMaskInpageProvider } from "@metamask/providers";
import React, { useEffect, useState } from "react";
import Web3 from "web3";
declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider;
    web3: any;
  }
}
const MyDApp: React.FC = () => {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [nonce, setNonce] = useState<number | null>(null);
  const [targetAddress, setTargetAddress] = useState<string>(
    "0x4E6294fC0E2A7477b5C0f15Dc2D516DB0D74608A"
  );
  const [txStatus, setTxStatus] = useState<string>("");

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        try {
          // Request account access if needed
          await window.ethereum.enable();
        } catch (error) {
          console.error(error);
        }
      } else if (window.web3) {
        // Legacy dapp browsers...
        const web3Instance = new Web3(window.web3.currentProvider);
        setWeb3(web3Instance);
      } else {
        console.log(
          "Non-Ethereum browser detected. You should consider trying MetaMask!"
        );
      }
    };

    initWeb3();

    return () => {
      setWeb3(null);
    };
  }, []);

  useEffect(() => {
    const fetchNonce = async () => {
      if (web3 && targetAddress) {
        const fetchedNonce = await web3.eth.getTransactionCount(
          targetAddress,
          "latest"
        );

        setNonce(Number(fetchedNonce));
      }
    };

    fetchNonce();
  }, [web3, targetAddress]);

  const sendTransaction = async () => {
    if (!web3 || !targetAddress) {
      console.error("Web3 instance, nonce, or target address not available.");
      return;
    }

    const [from] = await web3.eth.requestAccounts();
    try {
      const txHash = await window.ethereum?.request({
        method: "eth_sendTransaction",
        // The following sends an EIP-1559 transaction. Legacy transactions are also supported.
        params: [
          {
            // The user's active address.
            from,
            // Required except during contract publications.
            to: targetAddress,
            // Only required to send ether to the recipient from the initiating external account.
            nonce: nonce!.toString(16),
          },
        ],
      });

      setTxStatus(`Transaction sent successfully. Hash: ${txHash}`);
    } catch (error: any) {
      console.error("Error sending transaction:", error);
      setTxStatus(`Error sending transaction: ${error.message}`);
    }
  };

  return (
    <div>
      <h1>Send Transaction</h1>
      <div>
        <label htmlFor="targetAddress">Target Address:</label>
        <input
          type="text"
          id="targetAddress"
          value={targetAddress}
          onChange={(e) => setTargetAddress(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="nonce">Nonce:</label>
        <input
          placeholder="nonce"
          value={Number(nonce)}
          onChange={(e) => setNonce(Number(e.target.value))}
        />
      </div>
      <button onClick={sendTransaction}>Send Transaction</button>
      {txStatus && <p>{txStatus}</p>}
    </div>
  );
};

export default MyDApp;
