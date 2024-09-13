import { FormEvent, useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { Wallet } from "ethers";
import { Contract } from "ethers";
import { BrowserProvider } from "ethers";
import { JsonRpcSigner } from "ethers";

const App = () => {
  //INFURA (ETHER) Configuration
  const API_KEY = import.meta.env.VITE_APP_API_KEY;
  const PRIVATE_KEY = import.meta.env.VITE_APP_PRIVATE_KEY;
  const ETHER_MAINNET_URL = import.meta.env.VITE_ETHER_MAINNET_URL;
  const ETHER_CONTRACT = import.meta.env.VITE_ETHER_CONTRACT;

  const infuraProvider = useMemo(
    () => new ethers.JsonRpcProvider(`${ETHER_MAINNET_URL}/${API_KEY}`),
    [ETHER_MAINNET_URL, API_KEY]
  );

  const infuraSigner = useMemo(
    () => new ethers.Wallet(PRIVATE_KEY, infuraProvider),
    [PRIVATE_KEY, infuraProvider]
  );

  const infuraContract = useMemo(() => {
    const abi = ["function symbol() view returns (string)"];
    return new Contract(ETHER_CONTRACT, abi, infuraSigner);
  }, [ETHER_CONTRACT, infuraSigner]);

  //WEB3 (BASE) Configuration
  // const BASE_CONTRACT = import.meta.env.VITE_BASE_CONTRACT;

  const getWeb3Provider = async () => {
    if (!window.ethereum) window.alert("No wallet found!");
    else {
      await window.ethereum.send("eth_requestAccounts");
      const provider = new ethers.BrowserProvider(window.ethereum);
      return provider;
    }
  };

  // const web3Contract = useMemo(async () => {
  //   const abi = ["function symbol() view returns (string)"];
  //   const provider = new ethers.BrowserProvider(window.ethereum);
  //   const signer = await provider.getSigner();
  //   return new Contract(BASE_CONTRACT, abi, signer);
  // }, [BASE_CONTRACT]);

  //APP
  const [InfuraTxSent, setInfuraTxSent] = useState<string | null>(null);
  const [txSent, setTxSent] = useState<string | null>(null);

  const [symbol, setSymbol] = useState<string | null>(null);

  useEffect(() => {
    const fetchSymbol = async () => {
      try {
        const fetchedSymbol = await infuraContract.symbol();
        setSymbol(fetchedSymbol);
      } catch (error) {
        console.error("ERROR", (error as Error).message);
      }
    };
    fetchSymbol();
  }, [infuraContract]);

  const sendTransaction = async (
    address: string,
    amount: string,
    signer: Wallet | JsonRpcSigner
  ) => {
    const tx = await signer.sendTransaction({
      to: address,
      value: ethers.parseEther(amount),
    });

    const state = `Transaction initiated! Tx hash: ${tx.hash}`;

    if (signer === infuraSigner) {
      setInfuraTxSent(state);
    } else {
      setTxSent(state);
    }
  };

  const handleSubmitWeb3 = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const address = data.get("address")?.toString();
    if (!address) return;
    const amount = data.get("amount")?.toString();
    if (!amount) return;

    const provider = (await getWeb3Provider()) as BrowserProvider;
    if (!provider) {
      console.error("Provider is not defined");
      return;
    }
    const signer = await provider.getSigner();

    sendTransaction(address, amount, signer);
  };

  const handleSubmitInfura = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const address = data.get("address")?.toString();
    if (!address) return;
    const amount = data.get("amount")?.toString();
    if (!amount) return;

    sendTransaction(address, amount, infuraSigner);
  };

  return (
    <div className="App">
      <div className="section">
        <h3>Dear hiring manager</h3>
        <p>
          I really tried to understand cross-chain transactions scripting in one
          night, but I had to stop on figuring out how to send transactions and
          create/use instance of the contract. <br />
          Sincerely hope that it will show you my commitment to mastering new
          skills.
        </p>
      </div>

      <div className="section">
        <h3> Contract symbol: </h3>
        <p>{symbol ? symbol : "Loading..."}</p>
      </div>

      <div className="section">
        <h3> Fill out the form to send a transaction via Web3Provider: </h3>
        <form onSubmit={handleSubmitWeb3}>
          <input type="text" name="address" placeholder="Recipient Address" />
          <input type="text" name="amount" placeholder="Amount (ETH)" />
          <input type="submit" value="Send w/ Web3Provider" />
        </form>
        <p>{txSent}</p>
      </div>

      <div className="section">
        <h3> Fill out the form to send a transaction via InfuraProvider: </h3>
        <form onSubmit={handleSubmitInfura}>
          <input type="text" name="address" placeholder="Recipient Address" />
          <input type="text" name="amount" placeholder="Amount (ETH)" />
          <input type="submit" value="Send w/ InfuraProvider" />
        </form>
        <p>{InfuraTxSent}</p>
      </div>
    </div>
  );
};

export default App;
