"use client";

import React, { useCallback, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Input, Modal, message } from "antd";
import { hardhat } from "viem/chains";
import { useAccount } from "wagmi";
import { ArrowPathIcon, Bars3Icon, BugAntIcon } from "@heroicons/react/24/outline";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useDelegate, useDelegates, useVotePower } from "~~/hooks/blockchain/ERC20VotePower";
// import { useDelegate } from "~~/hooks/blockchain/BCOSGovernor";
import { useOutsideClick, useTargetNetwork } from "~~/hooks/scaffold-eth";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Debug Contracts",
    href: "/debug",
    icon: <BugAntIcon className="h-4 w-4" />,
  },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={`${
                isActive ? "bg-secondary shadow-md" : ""
              } hover:bg-secondary hover:shadow-md focus:!bg-secondary active:!text-neutral py-1.5 px-3 text-sm rounded-full gap-2 grid grid-flow-col`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

/**
 * Site header
 */
export const Header = () => {
  const { targetNetwork } = useTargetNetwork();
  const { address } = useAccount();
  const votePowerData = useVotePower(address || "");
  const currentDelegate = useDelegates(address || ""); // 从合约获取当前delegate
  console.log("currentDelegate: ", currentDelegate);
  const delegate = useDelegate();
  const isLocalNetwork = targetNetwork.id === hardhat.id;
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showDelegateOptions, setShowDelegateOptions] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);

  const burgerMenuRef = useRef<HTMLDivElement>(null);
  useOutsideClick(
    burgerMenuRef,
    useCallback(() => setIsDrawerOpen(false), []),
  );

  const handleDelegateToSelf = async () => {
    try {
      await delegate(address || "");
      message.success("Successfully delegated to yourself");
      setShowDelegateOptions(false);
    } catch (error) {
      console.error("Error delegating:", error);
      message.error("Failed to delegate");
    }
  };

  const handleDelegateToOther = () => {
    setShowDelegateOptions(false);
    setShowAddressModal(true);
  };

  // 处理 voting power 显示
  const formatVotePower = (power: bigint | undefined) => {
    if (!power) return "0";
    const powerNum = Number(power);
    if (powerNum > 1000) {
      return `${(powerNum / 1000).toFixed(1)}k`;
    }
    return powerNum.toString();
  };

  return (
    <div className="sticky lg:static top-0 navbar bg-base-100 min-h-0 flex-shrink-0 justify-between z-20 shadow-md shadow-secondary px-0 sm:px-2">
      <div className="navbar-start w-auto lg:w-1/2">
        <div className="lg:hidden dropdown" ref={burgerMenuRef}>
          <label
            tabIndex={0}
            className={`ml-1 btn btn-ghost ${isDrawerOpen ? "hover:bg-secondary" : "hover:bg-transparent"}`}
            onClick={() => {
              setIsDrawerOpen(prevIsOpenState => !prevIsOpenState);
            }}
          >
            <Bars3Icon className="h-1/2" />
          </label>
          {isDrawerOpen && (
            <ul
              tabIndex={0}
              className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
              onClick={() => {
                setIsDrawerOpen(false);
              }}
            >
              <HeaderMenuLinks />
            </ul>
          )}
        </div>
        <Link href="/" passHref className="hidden lg:flex items-center gap-2 ml-4 mr-6 shrink-0">
          <div className="flex relative w-10 h-10">
            <Image alt="SE2 logo" className="cursor-pointer" fill src="/logo.svg" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold leading-tight">BCOS Chain DAO</span>
            {/*<span className="text-xs">Ethereum dev stack</span>*/}
          </div>
        </Link>
        <ul className="hidden lg:flex lg:flex-nowrap menu menu-horizontal px-1 gap-2">
          <HeaderMenuLinks />
        </ul>
      </div>
      <div className="navbar-end flex-grow mr-4">
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
            <span className="text-sm font-semibold">Voting Power: {formatVotePower(votePowerData)}</span>
            <button
              onClick={() => setShowDelegateOptions(true)}
              className="p-1 hover:bg-primary/20 rounded-md transition-colors"
              title="Delegate voting power"
            >
              <ArrowPathIcon className="h-4 w-4" />
            </button>
          </div>
          <RainbowKitCustomConnectButton />
          {isLocalNetwork && <FaucetButton />}
        </div>
      </div>

      {/* First Modal: Delegate Options */}
      <Modal title="Delegate" open={showDelegateOptions} footer={null} onCancel={() => setShowDelegateOptions(false)}>
        <div className="py-4">
          {currentDelegate && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Current Delegate</p>
              <p className="font-medium">{currentDelegate}</p>
            </div>
          )}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleDelegateToSelf}
              disabled={currentDelegate === address}
              className={`w-full py-2 text-center text-lg rounded-xl transition-colors ${
                currentDelegate === address
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              Myself
            </button>
            <button
              onClick={handleDelegateToOther}
              disabled={currentDelegate !== address}
              className={`w-full py-2 text-center text-lg border border-black rounded-xl transition-colors ${
                currentDelegate !== address
                  ? "bg-gray-400 border-gray-500 text-gray-200 cursor-not-allowed"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Someone else
            </button>
            <div className="px-4 py-2 text-sm text-gray-500">Not eligible for free delegation</div>
          </div>
        </div>
      </Modal>

      {/* Second Modal: Address Input */}
      <AddressInputModal open={showAddressModal} onClose={() => setShowAddressModal(false)} onDelegate={delegate} />
    </div>
  );
};

interface AddressInputModalProps {
  open: boolean;
  onClose: () => void;
  onDelegate: (address: string) => Promise<void>;
}

const AddressInputModal = ({ open, onClose, onDelegate }: AddressInputModalProps) => {
  const [address, setAddress] = useState("");

  const handleSubmit = async () => {
    try {
      await onDelegate(address);
      message.success("Delegation successful");
      onClose();
    } catch (error) {
      console.error("Error delegating:", error);
      message.error("Failed to delegate");
    }
  };

  return (
    <Modal
      title="Enter Delegate Address"
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      okText="Delegate"
      cancelText="Cancel"
    >
      <div className="py-4">
        <p className="mb-2 text-gray-600">Enter the address you want to delegate your voting power to:</p>
        <Input placeholder="0x..." value={address} onChange={e => setAddress(e.target.value)} className="w-full" />
      </div>
    </Modal>
  );
};
