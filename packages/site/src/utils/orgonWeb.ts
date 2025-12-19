const {TronWeb} = require('orgonweb');

const TESTNET_NODE = 'https://trq80.orgon.space';
const MAINNET_NODE = 'https://tr80.orgon.space';
const TESTNET_EXPLORER_URL = 'https://quasar.orgonscan.org';
const MAINNET_EXPLORER_URL = 'https://orgonscan.org';
const TESTNET_GATE_API_URL = 'https://quasargate.orgon.space/v1';
const MAINNET_GATE_API_URL = 'https://gate.orgon.space/v1';

// Типизация для TronWeb
type OrgonWebType = any;

export interface OrgonWebConfig {
    fullHost: string;
}

export interface ContractDeploymentParams {
    abi: any[];
    bytecode: string;
    callValue?: number;
    userFeePercentage?: number;
    feeLimit?: number;
    constructorParams?: any[];
}

export interface DeploymentResult {
    success: boolean;
    contractAddress?: string;
    transactionHash?: string;
    receipt?: any;
    error?: string;
}

export class OrgonWebService {
    public orgonWeb: OrgonWebType;
    private config: OrgonWebConfig;

    constructor(config: OrgonWebConfig) {
        this.config = config;
        this.orgonWeb = new TronWeb({
            fullHost: config.fullHost
        });
    }

/**
 * Конвертировать hex адрес контракта в base58 формат
 * @param hexAddress - Hex адрес контракта (без префикса 0x)
 * @param chainId - ID сети для определения правильного узла (опционально)
 */
static getAddressFromHex(hexAddress: string, chainId?: string): string {
    // Используем правильную сеть на основе chainId
    const fullHost = getFullHostForNetwork(chainId);

    const orgonWeb = new TronWeb({
        fullHost: fullHost
    });

    // Конвертируем hex адрес в base58 формат
    return orgonWeb.address.fromHex(hexAddress);
}


    /**
     * Проверить подключение к сети
     */
    async checkConnection(): Promise<boolean> {
        try {
            const nodeInfo = await this.orgonWeb.trx.getNodeInfo();
            return !!nodeInfo;
        } catch (error) {
            console.error('Ошибка подключения к сети:', error);
            return false;
        }
    }

    /**
     * Валидация приватного ключа
     */
    static validatePrivateKey(privateKey: string): boolean {
        // Убираем префикс 0x если есть
        const cleanKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
        return cleanKey.length === 64 && /^[0-9a-fA-F]+$/.test(cleanKey);
    }

    /**
     * Создание неподписанной транзакции для деплоя контракта
     * Подпись и отправка будут выполнены через Snap
     */
    async createDeployTransaction(params: ContractDeploymentParams, fromAddress: string): Promise<any> {
        try {
            console.log('🚀 Создание транзакции деплоя контракта...');
            console.log('📍 Адрес деплоера:', fromAddress);
            console.log('🔗 Сеть:', this.config.fullHost);

            // Проверяем подключение к сети
            const isConnected = await this.checkConnection();
            if (!isConnected) {
                throw new Error('Нет подключения к сети Orgon');
            }

            // Создаем транзакцию для деплоя контракта
            console.log('📝 Создание транзакции деплоя...');
            console.log('📋 Параметры деплоя:', {
                abiLength: params.abi?.length || 0,
                bytecodeLength: params.bytecode?.length || 0,
                callValue: params.callValue || 0,
                userFeePercentage: params.userFeePercentage || 100,
                feeLimit: params.feeLimit || 1_000_000_000,
                constructorParams: params.constructorParams || []
            });

            const tx = await this.orgonWeb.transactionBuilder.createSmartContract(
                {
                    abi: params.abi,
                    bytecode: params.bytecode,
                    callValue: params.callValue || 0,
                    userFeePercentage: params.userFeePercentage || 100,
                    feeLimit: params.feeLimit || 1_000_000_000,
                    constructorParams: params.constructorParams || []
                },
                fromAddress
            );

            console.log('✅ Неподписанная транзакция создана:', tx.txID);

            // Возвращаем неподписанную транзакцию для подписи через Snap
            return tx;

        } catch (error) {
            console.error('❌ Ошибка при создании транзакции деплоя:', error);
            throw error;
        }
    }

    /**
     * Получить информацию о транзакции
     */
    async getTransactionInfo(txHash: string): Promise<any> {
        try {
            return await this.orgonWeb.trx.getTransactionInfo(txHash);
        } catch (error) {
            console.error('Ошибка получения информации о транзакции:', error);
            throw error;
        }
    }

    /**
     * Получить информацию о контракте
     */
    async getContractInfo(contractAddress: string): Promise<any> {
        try {
            return await this.orgonWeb.trx.getContract(contractAddress);
        } catch (error) {
            console.error('Ошибка получения информации о контракте:', error);
            throw error;
        }
    }

    /**
     * Вызвать метод контракта (создает неподписанную транзакцию)
     */
    async callContract(contractAddress: string, functionSelector: string, parameters: any[] = [], fromAddress: string): Promise<any> {
        try {
            return await this.orgonWeb.transactionBuilder.triggerSmartContract(
                contractAddress,
                functionSelector,
                {},
                parameters,
                fromAddress
            );
        } catch (error) {
            console.error('Ошибка вызова контракта:', error);
            throw error;
        }
    }

    /**
     * Получить экземпляр TronWeb
     */
    getOrgonWeb(): OrgonWebType {
        return this.orgonWeb;
    }
}

/**
 * Получить fullHost на основе chainId
 */
export function getFullHostForNetwork(chainId?: string): string {
    if (!chainId) {
        // По умолчанию используем тестовую сеть
        return TESTNET_NODE;
    }

    const chainIdLower = chainId.toLowerCase();

    // Проверяем, является ли сеть mainnet
    if (chainIdLower.includes('mainnet')) {
        return MAINNET_NODE;
    }

    // Для всех остальных случаев (quasar, testnet) используем тестовую сеть
    return TESTNET_NODE;
}

/**
 * Получить URL обозревателя блокчейна на основе chainId
 */
export function getExplorerUrlForNetwork(chainId?: string): string {
    if (!chainId) {
        // По умолчанию используем тестовую сеть
        return TESTNET_EXPLORER_URL;
    }

    const chainIdLower = chainId.toLowerCase();

    // Проверяем, является ли сеть mainnet
    if (chainIdLower.includes('mainnet')) {
        return MAINNET_EXPLORER_URL;
    }

    // Для всех остальных случаев (quasar, testnet) используем тестовую сеть
    return TESTNET_EXPLORER_URL;
}

/**
 * Получить URL Gate API на основе chainId
 */
export function getGateApiUrlForNetwork(chainId?: string): string {
    if (!chainId) {
        // По умолчанию используем тестовую сеть
        return TESTNET_GATE_API_URL;
    }

    const chainIdLower = chainId.toLowerCase();

    // Проверяем, является ли сеть mainnet
    if (chainIdLower.includes('mainnet')) {
        return MAINNET_GATE_API_URL;
    }

    // Для всех остальных случаев (quasar, testnet) используем тестовую сеть
    return TESTNET_GATE_API_URL;
}

/**
 * Получить network ('mainnet' или 'testnet') на основе chainId
 */
export function getNetworkFromChainId(chainId?: string): string {
    if (!chainId) {
        // По умолчанию используем тестовую сеть
        return 'testnet';
    }

    const chainIdLower = chainId.toLowerCase();

    // Проверяем, является ли сеть mainnet
    if (chainIdLower.includes('mainnet')) {
        return 'mainnet';
    }

    // Для всех остальных случаев (quasar, testnet) используем тестовую сеть
    return 'testnet';
}

/**
 * Создать экземпляр OrgonWebService с настройками по умолчанию
 * @param fullHost - Прямой URL узла (приоритет)
 * @param chainId - ID сети для автоматического определения узла (orgon:mainnet или orgon:quasar)
 */
export function createOrgonWebService(fullHost?: string, chainId?: string): OrgonWebService {
    // Если передан прямой fullHost, используем его
    if (fullHost) {
        return new OrgonWebService({
            fullHost: fullHost
        });
    }

    // Иначе определяем на основе chainId
    const host = getFullHostForNetwork(chainId);

    return new OrgonWebService({
        fullHost: host
    });
}

/**
 * Валидация параметров деплоя
 */
export function validateDeploymentParams(params: any): { isValid: boolean; error?: string } {
    if (!params.abi || !Array.isArray(params.abi)) {
        return {isValid: false, error: 'ABI должен быть массивом'};
    }

    if (!params.bytecode || typeof params.bytecode !== 'string') {
        return {isValid: false, error: 'Bytecode должен быть строкой'};
    }

    if (params.callValue && (typeof params.callValue !== 'number' || params.callValue < 0)) {
        return {isValid: false, error: 'callValue должен быть неотрицательным числом'};
    }

    if (params.userFeePercentage && (params.userFeePercentage < 0 || params.userFeePercentage > 30)) {
        return {isValid: false, error: 'userFeePercentage должен быть от 0 до 30'};
    }

    if (params.feeLimit && (typeof params.feeLimit !== 'number' || params.feeLimit <= 0)) {
        return {isValid: false, error: 'feeLimit должен быть положительным числом'};
    }

    return {isValid: true};
}
