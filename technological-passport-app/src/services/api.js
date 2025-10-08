// API Service for Technological Passport
class PassportAPI {
    constructor(baseURL = 'http://localhost:3000/api') {
        this.baseURL = baseURL;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    async getAllPassports() {
        return this.request('/passports');
    }

    async getPassportById(id) {
        return this.request(`/passports/${id}`);
    }

    async getPassportSteps(id) {
        return this.request(`/passports/${id}/steps`);
    }

    async updatePassportStatus(id, status, inspectorName, notes) {
        return this.request(`/passports/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status, inspectorName, notes })
        });
    }

    async getAssemblyTypes() {
        return this.request('/assembly-types');
    }

    async getInspectors() {
        return this.request('/inspectors');
    }

    async createPassport(passportData) {
        return this.request('/passports', {
            method: 'POST',
            body: JSON.stringify(passportData)
        });
    }
}

// Export for use in other modules
window.PassportAPI = PassportAPI;