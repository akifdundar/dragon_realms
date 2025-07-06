"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ChainIds,
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
  const [userAddresses, setUserAddresses] = useState<string[] | undefined>();
  const [currentChainId, setCurrentChainId] = useState<number | null>(null);

  const switchChain = async (chainId: number) => {
    try {
      await connector?.switchChain(chainId);
      setCurrentChainId(chainId);
    } catch (error) {
      console.error(error);
    }
  };

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

  const connectRoninWallet = async () => {
    if (!connector && error === ConnectorErrorType.PROVIDER_NOT_FOUND) {
      window.open("https://wallet.roninchain.com", "_blank");
      return;
    }

    const connectResult = await connector?.connect();

    if (connectResult) {
      setConnectedAddress(connectResult.account);
      setCurrentChainId(connectResult.chainId);

      // Call the onConnect callback with the connected address
      if (props.onConnect) {
        props.onConnect(connectResult.account);
      }
    }

    const accounts = await connector?.getAccounts();

    if (accounts) {
      setUserAddresses(accounts);
    }
  };

  useEffect(() => {
    getRoninWalletConnector().then((connector) => {
      setConnector(connector);
    });
  }, []);

  const formatConnectedChain = (chainId: number | null) => {
    switch (chainId) {
      case ChainIds.RoninMainnet:
        return `Ronin Mainnet - ${chainId}`;
      case ChainIds.RoninTestnet:
        return `Saigon Testnet - ${chainId}`;
      case null:
        return "Unknown Chain";
      default:
        return `Unknown Chain - ${chainId}`;
    }
  };

  return (
    <div className="space-y-4">
      {connectedAddress && (
        <div className="space-y-2">
          <Button
            onClick={() =>
              switchChain(
                currentChainId === ChainIds.RoninMainnet
                  ? ChainIds.RoninTestnet
                  : ChainIds.RoninMainnet
              )
            }
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            Switch Chain
          </Button>
          <p className="text-sm text-slate-300">
            Current Chain: {formatConnectedChain(currentChainId)}
          </p>
        </div>
      )}

      <Button
        onClick={connectRoninWallet}
        disabled={!connector}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold"
      >
        Connect Ronin Wallet
      </Button>

      {connectedAddress && (
        <div className="text-sm text-slate-300 space-y-1">
          <p>🎉 Ronin Wallet is connected!</p>
          <p>Current address: {connectedAddress}</p>
          {userAddresses && userAddresses.length > 1 && (
            <p>All addresses: {userAddresses.join(", ")}</p>
          )}
        </div>
      )}

      {error && <p className="text-red-400 text-sm">Error: {error}</p>}
    </div>
  );
}

export default ConnectRoninWalletButton;
