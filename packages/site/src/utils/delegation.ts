/**
 * Delegation utilities for Orgon resource delegation
 */

import axios from 'axios';
import { createOrgonWebService } from './orgonWeb';

interface NetworkConfig {
  rpcUrl: string;
  apiKey?: string;
}

interface DelegationState {
  address: string;
  maxDelegatable: {
    ENERGY: number;
    BANDWIDTH: number;
  };
  incoming: Array<{
    fromAddress: string;
    ENERGY: number;
    BANDWIDTH: number;
  }>;
  outgoing: Array<{
    toAddress: string;
    ENERGY: number;
    BANDWIDTH: number;
  }>;
  totals: {
    delegatedIn: { ENERGY: number; BANDWIDTH: number };
    delegatedOut: { ENERGY: number; BANDWIDTH: number };
  };
  stake: {
    ORGON: { ENERGY: number; BANDWIDTH: number };
    SUN: { ENERGY: number; BANDWIDTH: number };
  };
  prices: {
    staking: { ENERGY: number; BANDWIDTH: number };
  };
  resourcesFromStake: {
    ENERGY: number;
    BANDWIDTH: number;
  };
}

/**
 * Get delegation state for an address
 */
export async function getDelegationState(
  address: string,
  network?: NetworkConfig,
): Promise<DelegationState> {
  try {
    const rpcUrl = network?.rpcUrl || 'https://gate.orgon.space';

    // 1) Индекс аккаунтов по Stake2.0 (прямой запрос к ноде)
    let index;
    try {
      const { data } = await axios.post(
        `${rpcUrl}/wallet/getdelegatedresourceaccountindexv2`,
        { value: address, visible: true },
        { headers: { 'Content-Type': 'application/json' } }
      );
      index = data || null;
    } catch (e) {
      index = null;
    }

    const normalizeList = (lst: any, key: string) => {
      if (!lst) return [];
      // Может вернуться как массив строк, так и объектов с разными ключами
      return lst.map((item: any) => {
        if (typeof item === 'string') return item;
        return item?.[key] || item?.address || item?.addr || null;
      }).filter(Boolean);
    };

    const fromAccounts = normalizeList(index?.fromAccounts || index?.froms || index?.from, 'fromAddress');
    const toAccounts = normalizeList(index?.toAccounts || index?.tos || index?.to, 'toAddress');

    // 2) Детализация делегирований входящих и исходящих
    const incoming = [];
    const outgoing = [];
    let totals = {
      delegatedIn: { ENERGY: 0, BANDWIDTH: 0 },
      delegatedOut: { ENERGY: 0, BANDWIDTH: 0 }
    };

    // Вспомогательная функция парсинга ответа getDelegatedResourceV2
    const parseDelegatedResourceV2 = (dr: any) => {
      const list = dr?.delegatedResource || dr?.delegated_resource || dr || [];
      const arr = Array.isArray(list) ? list : (list?.list || []);
      let ENERGY = 0, BANDWIDTH = 0;
      for (const it of arr) {
        const typeRaw = (it?.resource || it?.type || '').toString().toUpperCase();
        if (typeRaw) {
          const bal = Number(it?.balance || it?.balance_for_energy || it?.balance_for_bandwidth || 0);
          if (typeRaw === 'ENERGY') ENERGY += bal;
          if (typeRaw === 'BANDWIDTH') BANDWIDTH += bal;
          continue;
        }
        const e = Number(it?.frozen_balance_for_energy || it?.balance_for_energy || it?.energy || 0);
        const b = Number(it?.frozen_balance_for_bandwidth || it?.balance_for_bandwidth || it?.bandwidth || 0);
        ENERGY += isNaN(e) ? 0 : e;
        BANDWIDTH += isNaN(b) ? 0 : b;
      }
      return { ENERGY, BANDWIDTH };
    };

    // incoming: кто делегировал текущему адресу (прямой запрос к ноде)
    for (const from of fromAccounts) {
      try {
        const { data: dr } = await axios.post(
          `${rpcUrl}/wallet/getdelegatedresourcev2`,
          { fromAddress: from, toAddress: address, visible: true },
          { headers: { 'Content-Type': 'application/json' } }
        );
        const amounts = parseDelegatedResourceV2(dr);
        totals.delegatedIn.ENERGY += amounts.ENERGY;
        totals.delegatedIn.BANDWIDTH += amounts.BANDWIDTH;
        incoming.push({ fromAddress: from, ...amounts });
      } catch {}
    }

    // outgoing: кому делегировал текущий адрес (прямой запрос к ноде)
    for (const to of toAccounts) {
      try {
        const { data: dr } = await axios.post(
          `${rpcUrl}/wallet/getdelegatedresourcev2`,
          { fromAddress: address, toAddress: to, visible: true },
          { headers: { 'Content-Type': 'application/json' } }
        );
        const amounts = parseDelegatedResourceV2(dr);
        totals.delegatedOut.ENERGY += amounts.ENERGY;
        totals.delegatedOut.BANDWIDTH += amounts.BANDWIDTH;
        outgoing.push({ toAddress: to, ...amounts });
      } catch {}
    }

    // 3) Максимально возможная делегация (Stake2.0): ENERGY / BANDWIDTH
    const fetchMax = async (type: string) => {
      try {
        // API ожидает int32: 0 - BANDWIDTH, 1 - ENERGY
        const typeInt = (String(type).toUpperCase() === 'ENERGY' || Number(type) === 1) ? 1 : 0;
        const { data } = await axios.post(
          `${rpcUrl}/wallet/getcandelegatedmaxsize`,
          {
            owner_address: address,
            type: typeInt,
            visible: true
          },
          { headers: { 'Content-Type': 'application/json' } }
        );
        // Если {} — вернем 0
        return Number(data?.max_size || 0);
      } catch {
        return 0;
      }
    };

    const [maxEnergy, maxBandwidth] = await Promise.all([
      fetchMax('ENERGY'),
      fetchMax('BANDWIDTH')
    ]);

    // 4) Подсчёт собственного стейка (ENERGY/BANDWIDTH) и пересчёт в ресурсы по курсу (OrgonStation)
    let stakedEnergySun = 0;
    let stakedBandwidthSun = 0;
    try {
      const { data: accountData } = await axios.post(
        `${rpcUrl}/wallet/getaccount`,
        { address, visible: true },
        { headers: { 'Content-Type': 'application/json' } }
      );
      const frozenV2 = Array.isArray(accountData?.frozenV2) ? accountData.frozenV2 : [];
      for (const item of frozenV2) {
        const amt = Number(item?.amount || 0);
        const t = (item?.type || '').toString().toUpperCase();
        if (t === 'ENERGY') stakedEnergySun += amt;
        else stakedBandwidthSun += amt; // BANDWIDTH чаще без type
      }
    } catch {}

    // Курсы из OrgonStation (stakingPrice = ресурс за 1 sun стейка)
    let energyStakingPrice = 0;
    let netStakingPrice = 0;
    try {
      const orgonWebService = createOrgonWebService(rpcUrl);
      const dataRes = await orgonWebService.orgonWeb.trx.getAccountResources('odG3amVK5r4tFLdbp2NtEFeJBE4rzTShDZ');
      const params = await orgonWebService.orgonWeb.trx.getChainParameters();
      const chainParams = params?.chainParameter || [];
      // Энергия
      const totalEnergyLimit = Number(dataRes?.TotalEnergyLimit || 0);
      const totalEnergyWeight = Number(dataRes?.TotalEnergyWeight || 0);
      energyStakingPrice = totalEnergyWeight > 0 ? (totalEnergyLimit / totalEnergyWeight) : 0;
      // Сеть (Bandwidth)
      const totalNetLimit = Number(dataRes?.TotalNetLimit || 0);
      const totalNetWeight = Number(dataRes?.TotalNetWeight || 0);
      netStakingPrice = totalNetWeight > 0 ? (totalNetLimit / totalNetWeight) : 0;
    } catch {}

    const resourcesFromStake = {
      ENERGY: stakedEnergySun * energyStakingPrice,
      BANDWIDTH: stakedBandwidthSun * netStakingPrice
    };

    return {
      address,
      maxDelegatable: {
        ENERGY: maxEnergy,
        BANDWIDTH: maxBandwidth
      },
      incoming,   // [{ fromAddress, ENERGY, BANDWIDTH }]
      outgoing,   // [{ toAddress, ENERGY, BANDWIDTH }]
      totals,
      stake: {
        ORGON: {
          ENERGY: stakedEnergySun / 1_000_000,
          BANDWIDTH: stakedBandwidthSun / 1_000_000
        },
        SUN: {
          ENERGY: stakedEnergySun,
          BANDWIDTH: stakedBandwidthSun
        }
      },
      prices: {
        staking: {
          ENERGY: energyStakingPrice,
          BANDWIDTH: netStakingPrice
        }
      },
      resourcesFromStake
    };
  } catch (error) {
    throw new Error(
      `Failed to get delegation state: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
