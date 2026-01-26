'use client';

import { useState } from 'react';

export default function ConnectButton() {
    const [address, setAddress] = useState<string | null>(null);

    const connect = () => {
        // Mock connection
        setTimeout(() => {
            setAddress('0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''));
        }, 500);
    };

    return (
        <div className="w-full">
            {address ? (
                <div className="bg-green-900/30 border border-green-500/50 p-3 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="font-mono text-green-400 text-sm">{address.slice(0, 6)}...{address.slice(-4)}</span>
                    </div>
                    <button onClick={() => setAddress(null)} className="text-xs text-red-400 hover:text-red-300">
                        Disconnect
                    </button>
                </div>
            ) : (
                <div className="relative">
                    <div className="absolute -top-3 -right-2 bg-yellow-600 text-[10px] px-1 rounded text-white font-bold transform rotate-12">TEST MODE</div>
                    <button
                        onClick={connect}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                        <i className="fa-solid fa-wallet" />
                        CONNECT WALLET
                    </button>
                </div>
            )}
        </div>
    );
}
