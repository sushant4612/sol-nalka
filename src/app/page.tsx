"use client"

import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useRef, useState } from "react";

export default function Home() {
  const [sol, setSol] = useState(1);
  const [network, setNetwork] = useState("testnet");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const solRef = useRef<HTMLInputElement>(null);
  const keyRef = useRef<HTMLInputElement>(null);
  
  async function requestAirdrop() {
    setError("");
    setStatus("");
    setLoading(true);
    
    try {
      if (!keyRef.current?.value) {
        throw new Error("Please enter a public key");
      }
      
      const solAmount = parseFloat(solRef.current?.value || "1");
      if (isNaN(solAmount) || solAmount <= 0) {
        throw new Error("Please enter a valid SOL amount");
      }
      
      const connectionUrl = (network === 'testnet') ? "https://api.testnet.solana.com" : "https://api.devnet.solana.com";
      const connection = new Connection(connectionUrl, "confirmed");
      
      const publicKey = new PublicKey(keyRef.current?.value);
      const lamports = solAmount * LAMPORTS_PER_SOL;
      
      setStatus(`Requesting ${solAmount} SOL to ${publicKey.toString().slice(0, 8)}...`);
      const signature = await connection.requestAirdrop(publicKey, lamports);
      
      setStatus("Confirming transaction...");
      const confirmation = await connection.confirmTransaction(signature, "confirmed");
      
      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err.toString()}`);
      }
      
      setStatus(`Success! ${solAmount} SOL has been sent to ${publicKey.toString().slice(0, 8)}...`);
    } catch (err: any) {
      setError(err.message || "Failed to request airdrop. Please check your inputs and try again.");
    } finally {
      setLoading(false);
    }
  }
  
  function handleNetworkChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setNetwork(e.target.value);
  }
  
  function handleSolChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value > 0) {
      setSol(value);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-blue-800/30 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-blue-600/20">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-2">
            <svg className="w-10 h-10 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h1 className="text-3xl font-bold ml-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-cyan-200">
              Sol Nalka
            </h1>
          </div>
          <p className="text-blue-200">Refill your development wallet with SOL tokens</p>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="network" className="block text-sm text-blue-200">Network</label>
            <select 
              id="network"
              value={network} 
              onChange={handleNetworkChange}
              className="w-full px-4 py-3 rounded-lg bg-blue-900/50 border border-blue-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <option value="testnet">Testnet</option>
              <option value="devnet">Devnet</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="publicKey" className="block text-sm text-blue-200">Wallet Address</label>
            <input 
              id="publicKey"
              ref={keyRef} 
              type="text" 
              placeholder="Enter your Solana public key" 
              className="w-full px-4 py-3 rounded-lg bg-blue-900/50 border border-blue-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="solAmount" className="block text-sm text-blue-200">SOL Amount</label>
            <div className="relative">
              <input 
                id="solAmount"
                ref={solRef} 
                type="text" 
                defaultValue={sol}
                min="0.1"
                step="0.1"
                onChange={handleSolChange}
                placeholder="Enter SOL amount" 
                className="w-full px-4 py-3 rounded-lg bg-blue-900/50 border border-blue-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <div className="absolute right-3 top-3 text-blue-300">SOL</div>
            </div>
            <p className="text-xs text-blue-300/80">Testnet limit: 2 SOL | Devnet limit: 5 SOL</p>
          </div>
          
          <button 
            onClick={requestAirdrop}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-medium transition-all duration-300 ${
              loading 
                ? "bg-blue-800 cursor-not-allowed" 
                : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg hover:shadow-cyan-500/20"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Request SOL
              </span>
            )}
          </button>
          
          {status && (
            <div className="mt-4 p-4 bg-cyan-900/30 border border-cyan-700 rounded-lg text-cyan-100 text-sm flex items-start">
              <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{status}</span>
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-100 text-sm flex items-start">
              <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}
        </div>
        
        <div className="mt-8 text-center text-xs text-blue-300/70">
          <p>Sol Nalka provides test SOL for development purposes</p>
          <p className="mt-1">Powered by Solana's Web3.js</p>
        </div>
      </div>
    </div>
  );
}