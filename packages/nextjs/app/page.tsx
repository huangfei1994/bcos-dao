"use client";

import React from "react";
import Link from "next/link";
import { Button } from "antd";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
// 假设使用wagmi获取当前连接的账户
import { ProposalCard } from "~~/components/ProposalCard";
import { useIsMaintainer } from "~~/hooks/blockchain/BCOSGovernor";
import { useLatestProposalId, useProposalList } from "~~/hooks/blockchain/BCOSGovernor";

type ProposalStatus = {
  key: number;
  label: string;
  color: string;
  icon?: React.ReactNode;
};

const proposalStatuses: ProposalStatus[] = [
  {
    key: -1,
    label: "All Proposals",
    color: "bg-blue-400",
  },
  {
    key: 0,
    label: "Pending",
    color: "bg-yellow-400",
  },
  {
    key: 1,
    label: "Active",
    color: "bg-green-400",
  },
  {
    key: 2,
    label: "Canceled",
    color: "bg-red-400",
  },
];

const Home: NextPage = () => {
  const { address } = useAccount();
  const isMaintainer = useIsMaintainer(address || "");
  console.log("isMaintainer: ", isMaintainer);
  const proposalFilterKey = -1;
  const latestProposal = useLatestProposalId();
  console.log("latestProposal: ", latestProposal);

  const { data: proposalList, loadMore, hasMoreProposals, switchProposalState } = useProposalList(0, 6, latestProposal);
  console.log("proposalList: ", proposalList);
  return (
    <>
      <div className="container mx-auto px-4 py-6">
        {/*Stats Section*/}
        <div className="grid grid-cols-4 gap-6 mb-6">
          <div id="userStats" className="contents">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-gray-600 text-sm">Active Proposals</h3>
              <p className="text-2xl font-bold text-blue-900 mt-2">12</p>
              <p className="text-green-600 text-sm mt-1">+2 this week</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-gray-600 text-sm">Total Votes</h3>
              <p className="text-2xl font-bold text-blue-900 mt-2">1,458</p>
              <p className="text-green-600 text-sm mt-1">+126 this week</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-gray-600 text-sm">Participation Rate</h3>
              <p className="text-2xl font-bold text-blue-900 mt-2">76.5%</p>
              <p className="text-green-600 text-sm mt-1">+5.2% this month</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-gray-600 text-sm">Executed Proposals</h3>
              <p className="text-2xl font-bold text-blue-900 mt-2">89</p>
              <p className="text-green-600 text-sm mt-1">+3 this week</p>
            </div>
          </div>
        </div>

        {/*Proposal Section*/}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Proposals</h2>
            <Link
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-300"
              href="/proposal/creation"
            >
              Create Proposal
            </Link>
          </div>
          {/*Filter Tabs*/}
          <div className="flex space-x-4 mb-6">
            {proposalStatuses.map(status => {
              const isActive = status.key === proposalFilterKey;
              return (
                <Button
                  key={status.key}
                  color="default"
                  variant="filled"
                  className={`${
                    isActive ? "bg-secondary shadow-md" : ""
                  } font-medium text-neutral hover:bg-secondary hover:shadow-md focus:!bg-secondary active:!text-neutral py-1.5 px-3 text-sm rounded-full gap-2 grid grid-flow-col`}
                  icon={status.icon}
                  onClick={() => switchProposalState(status.key)}
                >
                  {status.label}
                </Button>
              );
            })}
          </div>

          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {proposalList.map(proposal => (
                <ProposalCard key={proposal.id} {...proposal} />
              ))}
            </div>
          </div>

          {hasMoreProposals ? (
            <div className="text-center mt-8">
              <button
                onClick={loadMore}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-300"
              >
                Load More Proposals
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default Home;
