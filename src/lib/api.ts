import axios, { AxiosError } from 'axios';

// Base URL from environment variable or default to 0.0.0.0:8000 as requested
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

// Create axios instance with base config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000, // 10 second timeout
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- TYPE DEFINITIONS (matching backend schemas) ---

export interface Account {
    device_id: string;
    profile_name: string;
    is_enabled: boolean;
    runtime_status: string;
    status: string;
    daily_limit: number;
    cooldown_until: string | null;
    stream_url?: string | null;
}

export interface AccountStats {
    recent_2h: number;
    rolling_24h: number;
}

export interface AccountWithStats extends Account {
    stats: AccountStats;
}

export interface AutomationStatus {
    status: 'ON' | 'OFF';
    message: string;
    accounts?: AccountWithStats[];
}

export interface DeviceSelection {
    device_ids?: string[];
}

export interface Target {
    username: string;
    source: string;
    status: string;
    reserved_by: string | null;
    added_at: string;
}

export interface TargetBase {
    username: string;
    source: string;
}

export interface TargetStats {
    pending: number;
    reserved: number;
    completed: number;
    failed: number;
    total: number;
}

export interface LogEntry {
    id: number;
    device_id: string;
    device_name: string;
    message: string;
    level: string;
    timestamp: string;
}

export interface SessionConfig {
    batch_size?: number;
    session_limit_2h?: number;
    min_batch_start?: number;
    cooldown_hours?: number;
    pattern_break?: number;
    min_delay?: number;
    max_delay?: number;
    do_vetting?: boolean;
}

// --- ERROR HANDLING ---

export class ApiError extends Error {
    constructor(
        message: string,
        public statusCode?: number,
        public originalError?: unknown
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

function handleApiError(error: unknown): never {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ detail?: string; message?: string }>;

        // Network error
        if (!axiosError.response) {
            throw new ApiError(
                'Cannot connect to server. Please check your connection.',
                undefined,
                error
            );
        }

        // Server returned an error response
        const statusCode = axiosError.response.status;
        const errorMessage =
            axiosError.response.data?.detail ||
            axiosError.response.data?.message ||
            axiosError.message;

        if (statusCode >= 500) {
            throw new ApiError(
                `Server error: ${errorMessage}`,
                statusCode,
                error
            );
        } else if (statusCode >= 400) {
            throw new ApiError(
                errorMessage,
                statusCode,
                error
            );
        }

        throw new ApiError(errorMessage, statusCode, error);
    }

    // Unknown error
    throw new ApiError(
        error instanceof Error ? error.message : 'An unexpected error occurred',
        undefined,
        error
    );
}

// --- API FUNCTIONS ---

// Automation endpoints
export const automationApi = {
    getStatus: async (): Promise<AutomationStatus> => {
        try {
            const response = await apiClient.get<AutomationStatus>('/automation/status');
            return response.data;
        } catch (error) {
            handleApiError(error);
        }
    },

    start: async (selection: DeviceSelection = {}): Promise<AutomationStatus> => {
        try {
            const response = await apiClient.post<AutomationStatus>('/automation/start', selection);
            return response.data;
        } catch (error) {
            handleApiError(error);
        }
    },

    stop: async (selection: DeviceSelection = {}): Promise<AutomationStatus> => {
        try {
            const response = await apiClient.post<AutomationStatus>('/automation/stop', selection);
            return response.data;
        } catch (error) {
            handleApiError(error);
        }
    },
};

// Account endpoints
export const accountsApi = {
    list: async (): Promise<Account[]> => {
        try {
            const response = await apiClient.get<Account[]>('/accounts');
            return response.data;
        } catch (error) {
            handleApiError(error);
        }
    },

    enable: async (deviceId: string): Promise<Account> => {
        try {
            const response = await apiClient.patch<Account>(`/accounts/${deviceId}/enable`);
            return response.data;
        } catch (error) {
            handleApiError(error);
        }
    },

    disable: async (deviceId: string): Promise<Account> => {
        try {
            const response = await apiClient.patch<Account>(`/accounts/${deviceId}/disable`);
            return response.data;
        } catch (error) {
            handleApiError(error);
        }
    },

    getStats: async (deviceId: string): Promise<AccountStats> => {
        try {
            const response = await apiClient.get<AccountStats>(`/accounts/${deviceId}/stats`);
            return response.data;
        } catch (error) {
            handleApiError(error);
        }
    },
};

// Target endpoints
export const targetsApi = {
    list: async (params?: { page?: number; limit?: number; status?: string }): Promise<Target[]> => {
        try {
            const response = await apiClient.get<Target[]>('/targets', { params });
            return response.data;
        } catch (error) {
            handleApiError(error);
        }
    },

    add: async (targets: TargetBase[]): Promise<{ message: string }> => {
        try {
            const response = await apiClient.post<{ message: string }>('/targets', targets);
            return response.data;
        } catch (error) {
            handleApiError(error);
        }
    },

    getStats: async (): Promise<TargetStats> => {
        try {
            const response = await apiClient.get<TargetStats>('/targets/stats');
            return response.data;
        } catch (error) {
            handleApiError(error);
        }
    },
};

// Log endpoints
export const logsApi = {
    list: async (params?: { limit?: number; device_id?: string }): Promise<LogEntry[]> => {
        try {
            const response = await apiClient.get<LogEntry[]>('/logs', { params });
            return response.data;
        } catch (error) {
            handleApiError(error);
        }
    },

    connectToLogStream: (
        deviceId: string,
        onMessage: (log: LogEntry) => void,
        onError?: (error: Event) => void,
        onClose?: () => void
    ): (() => void) => {
        // Convert http/https to ws/wss
        const wsProtocol = API_BASE_URL.startsWith('https') ? 'wss' : 'ws';
        const wsBaseUrl = API_BASE_URL.replace(/^https?:\/\//, '');
        const wsUrl = `${wsProtocol}://${wsBaseUrl}/logs/ws/${deviceId}`;

        const socket = new WebSocket(wsUrl);

        socket.onmessage = (event) => {
            try {
                const log = JSON.parse(event.data);
                onMessage(log);
            } catch (e) {
                console.error('Failed to parse log message:', e);
            }
        };

        if (onError) {
            socket.onerror = onError;
        }

        if (onClose) {
            socket.onclose = onClose;
        }

        // Return cleanup function
        return () => {
            if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
                socket.close();
            }
        };
    },
};

// Config endpoints
export const configApi = {
    get: async (): Promise<SessionConfig> => {
        try {
            const response = await apiClient.get<SessionConfig>('/config');
            return response.data;
        } catch (error) {
            handleApiError(error);
        }
    },

    update: async (config: SessionConfig): Promise<SessionConfig> => {
        try {
            const response = await apiClient.patch<SessionConfig>('/config', config);
            return response.data;
        } catch (error) {
            handleApiError(error);
        }
    },
};

export default apiClient;
