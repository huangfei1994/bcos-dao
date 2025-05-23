"use client";

import React from "react";
import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
// 假设使用wagmi获取当前连接的账户
import { ProposalCard } from "~~/components/ProposalCard";
import { useIsMaintainer, useProposalThreshold } from "~~/hooks/blockchain/BCOSGovernor";
import { useLatestProposalId, useProposalList } from "~~/hooks/blockchain/BCOSGovernor";
import { useVotePower } from "~~/hooks/blockchain/ERC20VotePower";

const Home: NextPage = () => {
  const { address } = useAccount();
  const isMaintainer = useIsMaintainer(address || "");
  console.log("isMaintainer: ", isMaintainer);
  const pageSize = 9;
  const latestProposal = useLatestProposalId();
  console.log("latestProposal: ", latestProposal);
  const votingPower = useVotePower(address || "");
  const proposalThreshold = useProposalThreshold();
  console.log("votingPower: ", votingPower);
  const { data: proposalList, loadMore, hasMoreProposals, loading } = useProposalList(pageSize, latestProposal || 0);
  if (!latestProposal) {
    return <div className="container mx-auto px-4 py-6">loading....</div>;
  }
  console.log("proposalList: ", proposalList);
  return (
    <>
      <div className="container mx-auto px-4 py-6">
        {/*Stats Section*/}
        {/* <div className="grid grid-cols-4 gap-6 mb-6">
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
        </div> */}

        {/*Proposal Section*/}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Proposals</h2>
            {Number(votingPower) >= proposalThreshold && (
              <Link
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-300"
                href="/proposal/creation"
              >
                Create Proposal
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {proposalList.map(proposal => (
              <ProposalCard key={proposal.id} {...proposal} />
            ))}
          </div>

          {loading && (
            <div className="col-span-full flex justify-center items-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {hasMoreProposals && !loading && (
            <div className="text-center mt-8 col-span-full">
              <button
                onClick={loadMore}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-300"
              >
                Load More Proposals
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Home;
