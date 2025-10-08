// Technological Passport Form Component
class PassportForm {
    constructor() {
        this.api = new PassportAPI();
        this.currentPassportId = null;
        this.initializeEventListeners();
        this.setCurrentDate();
    }

    initializeEventListeners() {
        // Load data button
        document.getElementById('load-data-btn').addEventListener('click', () => {
            this.showPassportSelector();
        });

        // Refresh button
        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.refreshCurrentPassport();
        });

        // Print button
        document.getElementById('print-btn').addEventListener('click', () => {
            this.printPassport();
        });
    }

    setCurrentDate() {
        const today = new Date();
        const formattedDate = today.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
        
        document.getElementById('current-date').textContent = formattedDate;
        document.getElementById('date-field').textContent = formattedDate;
    }

    async showPassportSelector() {
        try {
            this.showLoading(true);
            const response = await this.api.getAllPassports();
            
            if (response.success && response.data.length > 0) {
                this.createPassportSelector(response.data);
            } else {
                this.showMessage('No passports found in the database.', 'info');
            }
        } catch (error) {
            this.showMessage(`Error loading passports: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    createPassportSelector(passports) {
        const selector = document.createElement('div');
        selector.className = 'passport-selector';
        selector.innerHTML = `
            <div class="selector-overlay">
                <div class="selector-content">
                    <h3>Select Technological Passport</h3>
                    <div class="passport-list">
                        ${passports.map(passport => `
                            <div class="passport-item" data-id="${passport.passport_id}">
                                <strong>${passport.passport_id}</strong>
                                <div>Article: ${passport.article_number}</div>
                                <div>Assembly: ${passport.assembly_name}</div>
                                <div>Status: ${passport.quality_status}</div>
                                <div>Date: ${new Date(passport.manufacturing_date).toLocaleDateString()}</div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="selector-buttons">
                        <button id="close-selector" class="btn btn-secondary">Close</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(selector);

        // Add click handlers for passport items
        selector.querySelectorAll('.passport-item').forEach(item => {
            item.addEventListener('click', () => {
                const passportId = item.dataset.id;
                this.loadPassport(passportId);
                document.body.removeChild(selector);
            });
        });

        // Add close handler
        document.getElementById('close-selector').addEventListener('click', () => {
            document.body.removeChild(selector);
        });
    }

    async loadPassport(passportId) {
        try {
            this.showLoading(true);
            const response = await this.api.getPassportById(passportId);
            
            if (response.success) {
                this.currentPassportId = passportId;
                this.populateForm(response.data);
                this.showMessage(`Passport ${passportId} loaded successfully.`, 'success');
            } else {
                this.showMessage('Passport not found.', 'error');
            }
        } catch (error) {
            this.showMessage(`Error loading passport: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    populateForm(passportData) {
        // Header information
        document.getElementById('article-number').textContent = passportData.article_number;
        document.getElementById('serial-number').textContent = passportData.serial_number;
        document.getElementById('current-sheet').textContent = passportData.current_sheet;
        document.getElementById('total-sheets').textContent = passportData.total_sheets;
        document.getElementById('inv-number').textContent = passportData.inv_number;
        
        // Mid section
        document.getElementById('article-number-repeat').textContent = passportData.article_number;
        document.getElementById('total-sheets-repeat').textContent = passportData.total_sheets;
        
        // Central title
        document.getElementById('assembly-name').textContent = passportData.assembly_name;
        document.getElementById('unit-serial').textContent = passportData.unit_serial;
        
        // Form fields
        document.getElementById('passport-id').value = passportData.passport_id;
        document.getElementById('assembly-type').value = passportData.assembly_type_name || passportData.assembly_type;
        document.getElementById('manufacturing-date').value = passportData.manufacturing_date;
        document.getElementById('quality-status').value = passportData.quality_status;
        document.getElementById('inspector-name').value = passportData.inspector_name || '';
        document.getElementById('notes').value = passportData.notes || '';
        
        // Footer signatures
        document.getElementById('checked-by').textContent = passportData.checked_by || '';
        document.getElementById('authorized-by').textContent = passportData.authorized_by || '';
    }

    async refreshCurrentPassport() {
        if (this.currentPassportId) {
            await this.loadPassport(this.currentPassportId);
        } else {
            this.showMessage('No passport loaded. Please load a passport first.', 'info');
        }
    }

    printPassport() {
        window.print();
    }

    showLoading(show) {
        const container = document.querySelector('.container');
        if (show) {
            container.classList.add('loading');
        } else {
            container.classList.remove('loading');
        }
    }

    showMessage(message, type = 'info') {
        // Remove existing messages
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.textContent = message;
        
        // Style the message
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 4px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            max-width: 300px;
            word-wrap: break-word;
        `;

        // Set background color based on type
        switch (type) {
            case 'success':
                messageDiv.style.backgroundColor = '#28a745';
                break;
            case 'error':
                messageDiv.style.backgroundColor = '#dc3545';
                break;
            case 'info':
                messageDiv.style.backgroundColor = '#17a2b8';
                break;
            default:
                messageDiv.style.backgroundColor = '#6c757d';
        }

        document.body.appendChild(messageDiv);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 5000);
    }
}

// Initialize the form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PassportForm();
});

// Add CSS for passport selector
const style = document.createElement('style');
style.textContent = `
    .passport-selector {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1000;
    }
    
    .selector-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
    }
    
    .selector-content {
        background-color: white;
        padding: 20px;
        border-radius: 8px;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .selector-content h3 {
        margin-bottom: 20px;
        text-align: center;
        color: #333;
    }
    
    .passport-list {
        margin-bottom: 20px;
    }
    
    .passport-item {
        padding: 15px;
        border: 1px solid #ddd;
        border-radius: 4px;
        margin-bottom: 10px;
        cursor: pointer;
        transition: background-color 0.3s;
    }
    
    .passport-item:hover {
        background-color: #f8f9fa;
        border-color: #007bff;
    }
    
    .passport-item strong {
        display: block;
        margin-bottom: 5px;
        color: #007bff;
    }
    
    .passport-item div {
        margin: 2px 0;
        font-size: 14px;
        color: #666;
    }
    
    .selector-buttons {
        text-align: center;
    }
    
    .message {
        animation: slideIn 0.3s ease-out;
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);