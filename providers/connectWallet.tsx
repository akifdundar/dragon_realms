"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ConnectorError,
  ConnectorErrorType,
  requestRoninWalletConnector,
} from "@sky-mavis/tanto-connect";

interface ConnectRoninWalletButtonProps {
  onConnect?: (address: string) => void;
}

function ConnectRoninWalletButton(props: ConnectRoninWalletButtonProps) {
  const [connector, setConnector] = useState<any>(null);
  const [connectedAddress, setConnectedAddress] = useState<
    string | undefined
  >();
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const getRoninWalletConnector = async () => {
    try {
      const connector = await requestRoninWalletConnector();
      return connector;
    } catch (error) {
      if (error instanceof ConnectorError) {
        setError(error.name);
      }
      return null;
    }
  };

  const connectWallet = async () => {
    if (!connector) return;

    setIsConnecting(true);
    try {
      const accounts = await connector.connect();
      if (accounts && accounts.length > 0) {
        const address = accounts[0];
        setConnectedAddress(address);
        props.onConnect?.(address);
      }
    } catch (error) {
      if (error instanceof ConnectorError) {
        setError(error.name);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    getRoninWalletConnector().then((connector) => {
      setConnector(connector);
    });
  }, []);

  return (
    <Button
      onClick={connectWallet}
      disabled={!connector || isConnecting}
      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold"
    >
      {isConnecting ? "Connecting..." : "Connect Ronin Wallet"}
    </Button>
  );
}

export default ConnectRoninWalletButton;
