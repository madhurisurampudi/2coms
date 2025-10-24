import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const loadWKCList = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/observations/work-center-list`);
        return response.data;
    } catch (error) {
        console.error('Error loading work center list:', error);
        throw error;
    }
};

const generateObservationCode = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/listoftempdocs/generate-code`);
        return response.data.code;
    } catch (error) {
        console.error('Error generating observation code:', error);
        throw error;
    }
};

const saveObservation = async (observationData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/listoftempdocs/save`, observationData);
        return response.data;
    } catch (error) {
        console.error('Error saving observation:', error);
        throw error;
    }
};

const updateObservation = async (observationData) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/listoftempdocs/update`, observationData);
        return response.data;
    } catch (error) {
        console.error('Error updating observation:', error);
        throw error;
    }
};

const forwardObservation = async (observationCode) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/listoftempdocs/forward`, { observcode: observationCode });
        return response.data;
    } catch (error) {
        console.error('Error forwarding observation:', error);
        throw error;
    }
};

const deleteObservation = async (observationCode) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/listoftempdocs/delete`, {
            observcode: observationCode
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting observation:', error);
        throw error;
    }
};

const getObservationsList = async (sessionData) => {
    try {
        console.log('🌐 Making API call to:', `${API_BASE_URL}/listoftempdocs/list`);
        console.log('🌐 Request data:', JSON.stringify(sessionData, null, 2));
        
        const response = await axios.post(`${API_BASE_URL}/listoftempdocs/list`, sessionData);
        
        console.log('🌐 API Response status:', response.status);
        console.log('🌐 API Response data:', response.data);
        console.log('🌐 API Response data type:', typeof response.data);
        console.log('🌐 API Response data length:', response.data?.length);
        
        return response.data;
    } catch (error) {
        console.error('❌ Error getting observations list:', error);
        console.error('❌ Error response:', error.response?.data);
        console.error('❌ Error status:', error.response?.status);
        throw error;
    }
};

const PP_ListTmDocs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
    const [sessionData, setSessionData] = useState({
        UserId: '',
        ActGroup: '',
        ARTCLENO: '',
        ASSM_PARTSLNO: '',
        INVNO: '',
        PPDOCID: '',
        OPERID: '',
        OPERNO: '',
        sourceform: ''
    });
    
  const [formData, setFormData] = useState({
        txtFields5: '', // Observation Code (OBSERVCODE)
        txtbudSlno: '', // Observation Sl.No (OBSERVSLNO)
        dtpProposalDate: '', // Observation Date (OBSERVDATE)
        txtoperno: '', // Operation Number (OPERNO)
        lstWKC: 'Select', // Raised By (RAISEDBYNAMEDESG)
        ComTender: 'Select', // Raised Group (MAKINGBYNAMEDESg)
        txtJustfication: '', // Observation (OBSERVATIONSTR)
        TxtItem: '', // Decision Taken (DECISIONTAKEN)
        txtTechSpec: '', // Operator Signed Stamp (OPER_SINGED_STAMP)
        txtTaskComp: '', // Lead Signed Stamp (LEAD_SINGED_STAMP)
        txtTask: '', // QAG Signed Stamp (QAG_SINGED_STAMP)
        txtitempurchasedearlier: '', // MSQAA Signed Stamp (MSQAA_SINGED_STAMP)
        txtDeliveryDate: '', // Remarks 1 (RMKS1)
        txtSupplNo: '', // Remarks 2 (RMKS2)
        txtIniatingOffcr: '', // Remarks 3 (RMKS3)
        txtTechDir: '' // Remarks 4 (RMKS4)
    });
    
    const [observationsData, setObservationsData] = useState([]);
    const [filteredObservationsData, setFilteredObservationsData] = useState([]);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(true);
    
    const [txtDAKIDSearch, setTxtDAKIDSearch] = useState(''); // Observation Sl.No
    const [txtSubjectSearch, setTxtSubjectSearch] = useState(''); // Observation Content
    const [txtDacumentRefNoSearch, setTxtDacumentRefNoSearch] = useState(''); // Raised By
    const [txtSearchParametersSearch, setTxtSearchParametersSearch] = useState(''); // Raised Group
    const [txtReceivedFrom, setTxtReceivedFrom] = useState('');
    const [txtReceivedTo, setTxtReceivedTo] = useState('');
    
    const [chkDAKIDSearch, setChkDAKIDSearch] = useState(false);
    const [chkSubjectSearch, setChkSubjectSearch] = useState(false);
    const [chkDacumentRefNoSearch, setChkDacumentRefNoSearch] = useState(false);
    const [chkSearchParameters, setChkSearchParameters] = useState(false);
    const [chkReceivedRentDateSearch, setChkReceivedRentDateSearch] = useState(false);
    
  const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [operationMode, setOperationMode] = useState('New');
    const [isGeneratingCode, setIsGeneratingCode] = useState(false);
    
    const [raisedGroupOptions, setRaisedGroupOptions] = useState(['Select', 'Operator', 'Production Leader', 'QA Master', 'Customer']);
    const [raisedByOptions, setRaisedByOptions] = useState(['Select']);
    
  useEffect(() => {
        initializeComponent();
    }, []);
    
    useEffect(() => {
        console.log('🔍 State changed - observationsData:', observationsData.length, 'filteredObservationsData:', filteredObservationsData.length);
    }, [observationsData, filteredObservationsData]);
    
    const initializeComponent = async () => {
        try {
            setLoading(true);
            
            console.log('🔍 PP_ObservationsEntry: Initializing component...');
            
            const userId = sessionStorage.getItem('UserId') || localStorage.getItem('UserId');
            if (!userId) {
                console.log('❌ No user ID found, redirecting to login');
                navigate('/login');
                return;
            }
            
            console.log('✅ User ID found:', userId);
            
            const sessionInfo = location.state?.sessionData || 
                JSON.parse(sessionStorage.getItem('sessionData') || '{}') || {
                UserId: userId,
                ActGroup: sessionStorage.getItem('ActGroup') || '',
                ARTCLENO: sessionStorage.getItem('ARTCLENO') || '',
                ASSM_PARTSLNO: sessionStorage.getItem('ASSM_PARTSLNO') || '',
                INVNO: sessionStorage.getItem('INVNO') || '',
                PPDOCID: sessionStorage.getItem('PPDOCID') || '',
                OPERID: parseInt(sessionStorage.getItem('OPERID') || '0'),
                OPERNO: sessionStorage.getItem('OPERNO') || '0',
                sourceform: sessionStorage.getItem('sourceform') || ''
            };
            
            if (typeof sessionInfo.OPERID === 'string') {
                sessionInfo.OPERID = parseInt(sessionInfo.OPERID) || 0;
            }
            if (sessionInfo.OPERID === null || sessionInfo.OPERID === undefined) {
                sessionInfo.OPERID = 0;
            }
            
            console.log('🔍 PP_ObservationsEntry - Session data sources:');
            console.log('  location.state?.sessionData:', location.state?.sessionData);
            console.log('  sessionStorage.getItem("sessionData"):', sessionStorage.getItem('sessionData'));
            console.log('  Final sessionInfo:', sessionInfo);
            
            console.log('📋 Session Info:', sessionInfo);
            console.log('📋 Session Storage Check:');
            console.log('  PPDOCID:', sessionStorage.getItem('PPDOCID'));
            console.log('  ARTCLENO:', sessionStorage.getItem('ARTCLENO'));
            console.log('  ASSM_PARTSLNO:', sessionStorage.getItem('ASSM_PARTSLNO'));
            console.log('  INVNO:', sessionStorage.getItem('INVNO'));
            console.log('  OPERID:', sessionStorage.getItem('OPERID'), 'type:', typeof sessionStorage.getItem('OPERID'));
            console.log('  OPERNO:', sessionStorage.getItem('OPERNO'), 'type:', typeof sessionStorage.getItem('OPERNO'));
            console.log('📋 Parsed OPERID:', parseInt(sessionStorage.getItem('OPERID') || '0'), 'type:', typeof parseInt(sessionStorage.getItem('OPERID') || '0'));
            
            const allSessionKeys = Object.keys(sessionStorage);
            console.log('📋 All session storage keys:', allSessionKeys);
            console.log('📋 Session storage length:', sessionStorage.length);
            
            const hasRequiredParams = sessionInfo.PPDOCID && sessionInfo.ARTCLENO && sessionInfo.ASSM_PARTSLNO && sessionInfo.INVNO && (sessionInfo.OPERID !== null && sessionInfo.OPERID !== undefined);
            const hasOperno = sessionInfo.OPERNO && sessionInfo.OPERNO !== '';
            
            console.log('🔍 Has required parameters:', hasRequiredParams);
            console.log('🔍 Has OPERNO:', hasOperno);
            console.log('🔍 Parameter values:', {
                PPDOCID: sessionInfo.PPDOCID,
                ARTCLENO: sessionInfo.ARTCLENO,
                ASSM_PARTSLNO: sessionInfo.ASSM_PARTSLNO,
                INVNO: sessionInfo.INVNO,
                OPERID: sessionInfo.OPERID,
                OPERNO: sessionInfo.OPERNO
            });
            console.log('🔍 Missing parameters:', {
                PPDOCID: !sessionInfo.PPDOCID,
                ARTCLENO: !sessionInfo.ARTCLENO,
                ASSM_PARTSLNO: !sessionInfo.ASSM_PARTSLNO,
                INVNO: !sessionInfo.INVNO,
                OPERID: (sessionInfo.OPERID === null || sessionInfo.OPERID === undefined),
                OPERNO: !hasOperno
            });
            
            if (!hasRequiredParams) {
                console.log('❌ Missing required parameters - cannot proceed without proper session data');
                console.log('❌ Session storage contents:', {
                    PPDOCID: sessionStorage.getItem('PPDOCID'),
                    ARTCLENO: sessionStorage.getItem('ARTCLENO'),
                    ASSM_PARTSLNO: sessionStorage.getItem('ASSM_PARTSLNO'),
                    INVNO: sessionStorage.getItem('INVNO'),
                    OPERID: sessionStorage.getItem('OPERID'),
                    OPERNO: sessionStorage.getItem('OPERNO'),
                    sourceform: sessionStorage.getItem('sourceform')
                });
                setError('Missing required session data. Please navigate from the Production Operations page.');
                return;
            }
            
            if (!hasOperno) {
                console.log('⚠️ OPERNO is missing, setting default value');
                sessionInfo.OPERNO = '0';
            }
            
            setSessionData(sessionInfo);
            
            await loadWKCListData();
            
            const initialFormData = {
                txtFields5: '', // Will be generated
                txtbudSlno: '', // Observation Sl.No
                dtpProposalDate: '', // Observation Date
                txtoperno: '', // Operation Number
                lstWKC: 'Select', // Raised By
                ComTender: 'Select', // Raised Group
                txtJustfication: '', // Observation
                TxtItem: '', // Decision Taken
                txtTechSpec: '', // Operator Signed Stamp
                txtTaskComp: '', // Lead Signed Stamp
                txtTask: '', // QAG Signed Stamp
                txtitempurchasedearlier: '', // MSQAA Signed Stamp
                txtDeliveryDate: '', // Remarks 1
                txtSupplNo: '', // Remarks 2
                txtIniatingOffcr: '', // Remarks 3
                txtTechDir: '' // Remarks 4
            };
            
            console.log('📝 Setting initial form data:', initialFormData);
            setFormData(initialFormData);
            
            await loadObservationsList(sessionInfo);
            
            setOperationMode(location.state?.operationMode || 'New');
            
        } catch (error) {
            console.error('Error initializing component:', error);
            setError('Failed to initialize component: ' + error.message);
        } finally {
            setLoading(false);
        }
    };
    
    const loadWKCListData = async () => {
        try {
            console.log('🔍 Loading work center list...');
            console.log('🔍 API URL:', `${API_BASE_URL}/observations/work-center-list`);
            
            const wkcData = await loadWKCList();
            
            console.log('🔍 Raw work center data:', wkcData);
            console.log('🔍 Data type:', typeof wkcData);
            console.log('🔍 Is array:', Array.isArray(wkcData));
            
            const wkcOptions = ['Select'];
            if (wkcData && Array.isArray(wkcData)) {
                wkcData.forEach(item => {
                    if (item && typeof item === 'string') {
                        wkcOptions.push(item);
                    }
                });
            }
            
            console.log('✅ Work center list loaded:', wkcOptions);
            
            setRaisedByOptions(wkcOptions);
            
        } catch (error) {
            console.error('❌ Error loading work center list:', error);
            console.error('❌ Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                statusText: error.response?.statusText
            });
            setError('Failed to load work center list: ' + error.message);
        }
    };
    
    const loadExistingOperation = async (sessionInfo) => {
        try {
            console.log('🔍 Loading existing operation with session info:', sessionInfo);
            
            const data = await getPPOperationsEntryDataVB({
                ppdocid: sessionInfo.PPDOCID,
                artcleno: sessionInfo.ARTCLENO,
                assm_partslno: sessionInfo.ASSM_PARTSLNO,
                invno: sessionInfo.INVNO,
                operid: sessionInfo.OPERID,
                operno: sessionInfo.OPERNO
            });
            
            console.log('📊 Received operation data:', data);
            
            if (data && data.data && data.data.length > 0) {
                const operation = data.data[0];
                console.log('Loading existing operation data:', operation);
                console.log('Available operation fields:', Object.keys(operation));
                
                const formatDateForInput = (dateStr) => {
                    if (!dateStr) return '';
                    try {
                        let date;
                        if (typeof dateStr === 'string') {
                            if (dateStr.includes('-')) {
                                date = new Date(dateStr);
                            } else if (dateStr.includes('/')) {
                                date = new Date(dateStr.replace(/\//g, '-'));
                            } else {
                                date = new Date(dateStr);
                            }
                        } else {
                            date = new Date(dateStr);
                        }
                        
                        if (isNaN(date.getTime())) {
                            console.log('Invalid date:', dateStr);
                            return '';
                        }
                        
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        return `${year}-${month}-${day}`;
                    } catch (e) {
                        console.log('Date formatting error:', e, 'for date:', dateStr);
                        return '';
                    }
                };
                
                const newFormData = {
                    txtFields5: operation.operid || operation.OPERID || operation.OPER_ID || '',
                    txtoperno: operation.operno || operation.OPERNO || '',
                    txtbudSlno: operation.operchk || operation.OPERCHK || '',
                    dtpProposalDate: formatDateForInput(operation.date_accm_start || operation.DATE_ACCM_START),
                    txtTechSpec: operation.time_accm_start || operation.TIME_ACCM_START || '',
                    txtTaskComp: operation.time_accm_end || operation.TIME_ACCM_END || '',
                    txtJustfication: operation.rmks1 || operation.RMKS1 || '',
                    TxtItem: operation.rmks2 || operation.RMKS2 || '',
                    txtDeliveryDate: operation.rmks3 || operation.RMKS3 || '',
                    txtSupplNo: operation.rmks4 || operation.RMKS4 || '',
                    lstWKC: operation.oper_presentstatus || operation.OPER_PRESENTSTATUS || 'Initiated'
                };
                
                console.log('📝 Setting form data from API:', newFormData);
                setFormData(prev => ({ ...prev, ...newFormData }));
            } else {
                console.log('No operation data found for the given parameters, using session data as fallback');
                const fallbackFormData = {
                    txtFields5: sessionInfo.OPERID || '',
                    txtoperno: sessionInfo.OPERNO || '',
                    txtbudSlno: 'Y',
                    dtpProposalDate: '',
                    txtTechSpec: '',
                    txtTaskComp: '',
                    txtJustfication: '',
                    TxtItem: '',
                    txtDeliveryDate: '',
                    txtSupplNo: '',
                    lstWKC: 'Initiated'
                };
                console.log('📝 Setting fallback form data:', fallbackFormData);
                setFormData(prev => ({ ...prev, ...fallbackFormData }));
            }
        } catch (error) {
            console.error('Error loading existing operation:', error);
            console.log('Using session data as fallback due to error');
            const fallbackFormData = {
                txtFields5: sessionInfo.OPERID || '',
                txtoperno: sessionInfo.OPERNO || '',
                txtbudSlno: 'Y',
                dtpProposalDate: '',
                txtTechSpec: '',
                txtTaskComp: '',
                txtJustfication: '',
                TxtItem: '',
                txtDeliveryDate: '',
                txtSupplNo: '',
                lstWKC: 'Initiated'
            };
            console.log('📝 Setting error fallback form data:', fallbackFormData);
            setFormData(prev => ({ ...prev, ...fallbackFormData }));
        }
    };
    
    const loadObservationsList = async (sessionDataToUse = null) => {
        try {
            const dataToUse = sessionDataToUse || sessionData;
            console.log('🔄 Loading observations list with session data:', dataToUse);
            console.log('🔄 API URL:', `${API_BASE_URL}/observations/list`);
            console.log('🔄 Request payload:', JSON.stringify(dataToUse, null, 2));
            console.log('🔄 Session data validation:', {
                PPDOCID: dataToUse.PPDOCID,
                ARTCLENO: dataToUse.ARTCLENO,
                ASSM_PARTSLNO: dataToUse.ASSM_PARTSLNO,
                INVNO: dataToUse.INVNO,
                OPERID: dataToUse.OPERID,
                OPERNO: dataToUse.OPERNO
            });
            
            const requiredFields = ['PPDOCID', 'ARTCLENO', 'ASSM_PARTSLNO', 'INVNO', 'OPERNO'];
            const missingFields = requiredFields.filter(field => !dataToUse[field]);
            if (dataToUse.OPERID === null || dataToUse.OPERID === undefined) {
                missingFields.push('OPERID');
            }
            
            console.log('🔍 Field validation details:', {
                PPDOCID: { value: dataToUse.PPDOCID, valid: !!dataToUse.PPDOCID },
                ARTCLENO: { value: dataToUse.ARTCLENO, valid: !!dataToUse.ARTCLENO },
                ASSM_PARTSLNO: { value: dataToUse.ASSM_PARTSLNO, valid: !!dataToUse.ASSM_PARTSLNO },
                INVNO: { value: dataToUse.INVNO, valid: !!dataToUse.INVNO },
                OPERID: { value: dataToUse.OPERID, valid: dataToUse.OPERID !== null && dataToUse.OPERID !== undefined },
                OPERNO: { value: dataToUse.OPERNO, valid: !!dataToUse.OPERNO }
            });
            
            if (missingFields.length > 0) {
                console.log('❌ Missing required fields:', missingFields);
                console.log('❌ Session storage at time of error:', {
                    PPDOCID: sessionStorage.getItem('PPDOCID'),
                    ARTCLENO: sessionStorage.getItem('ARTCLENO'),
                    ASSM_PARTSLNO: sessionStorage.getItem('ASSM_PARTSLNO'),
                    INVNO: sessionStorage.getItem('INVNO'),
                    OPERID: sessionStorage.getItem('OPERID'),
                    OPERNO: sessionStorage.getItem('OPERNO'),
                    sourceform: sessionStorage.getItem('sourceform')
                });
                setError(`Missing required fields: ${missingFields.join(', ')}`);
                return;
            }
            
            const observationsData = await getObservationsList(dataToUse);
            
            console.log('🔄 Raw API response:', observationsData);
            console.log('🔄 Response type:', typeof observationsData);
            console.log('🔄 Is array:', Array.isArray(observationsData));
            console.log('🔄 Response length:', observationsData?.length);
            console.log('🔄 Response content:', JSON.stringify(observationsData, null, 2));
            
            if (observationsData && observationsData.error) {
                console.log('❌ API returned error:', observationsData.error);
                setError('API Error: ' + observationsData.error);
                setObservationsData([]);
                setFilteredObservationsData([]);
                return;
            }
            
            if (observationsData && Array.isArray(observationsData)) {
                setObservationsData(observationsData);
                setFilteredObservationsData(observationsData);
                console.log('✅ Observations list loaded:', observationsData.length, 'records');
                console.log('✅ Observations data:', observationsData);
                console.log('✅ Setting filteredObservationsData to:', observationsData);
                setSuccessMessage(`Loaded ${observationsData.length} observations successfully`);
            } else {
                console.log('⚠️ No observations data received');
                console.log('⚠️ Data received:', observationsData);
                setObservationsData([]);
                setFilteredObservationsData([]);
                setError('No observations found in database. Please check if data exists.');
            }
            
        } catch (error) {
            console.error('❌ Error loading observations list:', error);
            console.error('❌ Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                statusText: error.response?.statusText
            });
            setError('Failed to load observations list: ' + error.message);
            setObservationsData([]);
            setFilteredObservationsData([]);
        }
    };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSearchChange = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    applyFilters(term);
  };

  const applyFilters = (search, status) => {
    let filtered = observationsData;

    if (search) {
      filtered = filtered.filter(observation => 
        observation.OBSERVSLNO?.toString().toLowerCase().includes(search) ||  // Observation Sl.No
        observation.OBSERVATIONSTR?.toLowerCase().includes(search) || // Observation Content
        observation.OBSERVDATE?.includes(search)            // Observation Date
      );
    }

    setFilteredObservationsData(filtered);
  };

  const handleVBFilterSearch = () => {
    console.log('🔧 SEARCH button clicked');
    console.log('🔍 Starting search with filters:', {
      txtDAKIDSearch,
      txtSubjectSearch,
      txtDacumentRefNoSearch,
      txtSearchParametersSearch,
      txtReceivedFrom,
      txtReceivedTo
    });
    
    console.log('🔍 Total observations data:', observationsData.length);
    console.log('🔍 Sample observation data:', observationsData[0]);
    
    if (!txtDAKIDSearch.trim() && !txtSubjectSearch.trim() && !txtDacumentRefNoSearch.trim() && 
        !txtSearchParametersSearch.trim() && !txtReceivedFrom && !txtReceivedTo) {
      console.log('🔍 No search criteria provided, showing all data');
      setFilteredObservationsData(observationsData);
      setError('');
      setSuccessMessage(`Showing all ${observationsData.length} observations`);
      return;
    }
    
    let filtered = [...observationsData];
    let searchCriteria = [];
    
    if (txtDAKIDSearch.trim()) {
        filtered = filtered.filter(observation => 
        observation.OBSERVCODE?.toLowerCase().includes(txtDAKIDSearch.toLowerCase()) ||
          observation.OBSERVSLNO?.toLowerCase().includes(txtDAKIDSearch.toLowerCase())
        );
      searchCriteria.push(`Observation Code: ${txtDAKIDSearch}`);
      }
    
    if (txtSubjectSearch.trim()) {
        filtered = filtered.filter(observation => 
        observation.OBSERVATIONSTR?.toLowerCase().includes(txtSubjectSearch.toLowerCase())
        );
      searchCriteria.push(`Observation Content: ${txtSubjectSearch}`);
    }
    
    if (txtDacumentRefNoSearch.trim()) {
        filtered = filtered.filter(observation => 
        observation.RAISEDBYNAMEDESG?.toLowerCase().includes(txtDacumentRefNoSearch.toLowerCase())
        );
      searchCriteria.push(`Raised By: ${txtDacumentRefNoSearch}`);
    }
    
    if (txtSearchParametersSearch.trim()) {
        filtered = filtered.filter(observation => 
        observation.MAKINGBYNAMEDESg?.toLowerCase().includes(txtSearchParametersSearch.toLowerCase())
        );
      searchCriteria.push(`Raised Group: ${txtSearchParametersSearch}`);
    }
    
    if (txtReceivedFrom && txtReceivedTo) {
        filtered = filtered.filter(observation => {
        const obsDate = new Date(observation.OBSERVDATE);
          const fromDate = new Date(txtReceivedFrom);
          const toDate = new Date(txtReceivedTo);
          return obsDate >= fromDate && obsDate <= toDate;
        });
      searchCriteria.push(`Date Range: ${txtReceivedFrom} to ${txtReceivedTo}`);
    }
    
    if (searchCriteria.length === 0) {
      filtered = [...observationsData];
      setError('');
      setSuccessMessage('Showing all observations');
    } else {
      setError('');
      setSuccessMessage(`Search results: ${searchCriteria.join(', ')} - Found ${filtered.length} observations`);
    }
    
    console.log('🔍 Search completed. Found:', filtered.length, 'observations');
    console.log('🔍 Filtered results:', filtered);
    console.log('🔍 Setting filteredObservationsData to:', filtered.length, 'items');
    setFilteredObservationsData(filtered);
  };

  const clearAllFilters = () => {
    console.log('🗑️ Clearing all filters');
    setTxtDAKIDSearch("");
    setTxtSubjectSearch("");
    setTxtDacumentRefNoSearch("");
    setTxtSearchParametersSearch("");
    setTxtReceivedFrom("");
    setTxtReceivedTo("");
    setFilteredObservationsData(observationsData);
    setError('');
    setSuccessMessage('All filters cleared - showing all observations');
  };

  const validateForm = () => {
        if (formData.lstWKC === 'Select') {
            setError('Select Raised By');
      return false;
    }
        if (!formData.dtpProposalDate) {
            setError('Select Date');
      return false;
    }
        if (formData.ComTender === 'Select') {
            setError('Select Raised Group');
      return false;
    }
        if (!formData.txtJustfication || !String(formData.txtJustfication).trim()) {
            setError('Enter Test Parameter');
      return false;
    }
        if (!formData.txtbudSlno || !String(formData.txtbudSlno).trim()) {
            setError('Enter Sl.No');
      return false;
    }
        // Fixed validation: Check if code is empty or still "System Generated"
        if (!formData.txtFields5 || formData.txtFields5 === 'System Generated' || formData.txtFields5.trim() === '') {
            setError('Please Check Sl.No Generation');
      return false;
    }
    return true;
  };

    const formatDateForMySQL = (dateValue) => {
        if (!dateValue) return null;
        
        if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
            return dateValue;
        }
        
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) return null;
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    };
    
    const generateObservationCodeForNew = async () => {
        try {
            console.log('🔢 Generating observation code...');
            setIsGeneratingCode(true);
            setError('');
            
            const code = await generateObservationCode();
            console.log('✅ Generated observation code:', code);
            
            setFormData(prev => ({ ...prev, txtFields5: code }));
            setSuccessMessage('Observation code generated successfully');
            
        } catch (error) {
            console.error('❌ Error generating observation code:', error);
            setError('Failed to generate observation code: ' + error.message);
        } finally {
            setIsGeneratingCode(false);
        }
    };
    
    const handleSaveUpdate = async () => {
        try {
            setLoading(true);
            setError('');
            setSuccessMessage('');
            
            // If it's a new observation and no code is generated yet, generate it first
            if (operationMode === 'New' && (!formData.txtFields5 || formData.txtFields5 === 'System Generated' || formData.txtFields5.trim() === '')) {
                console.log('🔢 No observation code found, generating one...');
                await generateObservationCodeForNew();
                
                // Check if generation was successful
                if (!formData.txtFields5 || formData.txtFields5 === 'System Generated' || formData.txtFields5.trim() === '') {
                    setError('Failed to generate observation code. Please try again.');
                    return;
                }
            }
            
            if (!validateForm()) {
                return;
            }

            const cleanedObservation = formData.txtJustfication.replace(/'/g, '').replace(/"/g, '');
            const cleanedDecision = formData.TxtItem.replace(/'/g, '').replace(/"/g, '');
            
            const operSignedStamp = formData.txtTechSpec || 'Nil';
            const leadSignedStamp = formData.txtTaskComp || 'Nil';
            const qagSignedStamp = formData.txtTask || 'Nil';
            const msqaaSignedStamp = formData.txtitempurchasedearlier || 'Nil';
            const rmks1 = formData.txtDeliveryDate || 'Nil';
            const rmks2 = formData.txtSupplNo || 'Nil';
            const rmks3 = formData.txtIniatingOffcr || 'Nil';
            const rmks4 = formData.txtTechDir || 'Nil';
            
            const formattedDate = formatDateForMySQL(formData.dtpProposalDate);
            
      const observationData = {
                ppdocid: sessionData.PPDOCID,
                artcleno: sessionData.ARTCLENO,
                assm_partslno: sessionData.ASSM_PARTSLNO,
                invno: sessionData.INVNO,
                operid: sessionData.OPERID,
                operno: sessionData.OPERNO,
                observcode: formData.txtFields5,
                observslno: formData.txtbudSlno,
                observdate: formattedDate,
                raisedbynamedesg: formData.lstWKC,
                makingbynamedesg: formData.ComTender,
                observationstr: cleanedObservation,
                decisiontaken: cleanedDecision,
                oper_singed_stamp: operSignedStamp,
                lead_singed_stamp: leadSignedStamp,
                qag_singed_stamp: qagSignedStamp,
                msqaa_singed_stamp: msqaaSignedStamp,
                rmks1: rmks1,
                rmks2: rmks2,
        rmks3: rmks3,
        rmks4: rmks4,
                observ_presentstatus: 'Initiated'
            };
            
            let result;
            if (operationMode === 'New') {
                console.log('💾 Saving new observation:', observationData);
                result = await saveObservation(observationData);
            } else {
                console.log('🔄 Updating existing observation:', observationData);
                console.log('🔄 Update data details:', {
                    observcode: observationData.observcode,
                    observslno: observationData.observslno,
                    observdate: observationData.observdate,
                    raisedbynamedesg: observationData.raisedbynamedesg,
                    makingbynamedesg: observationData.makingbynamedesg,
                    observationstr: observationData.observationstr,
                    decisiontaken: observationData.decisiontaken,
                    observ_presentstatus: observationData.observ_presentstatus
                });
                result = await updateObservation(observationData);
            }
            
            console.log('📊 API Response:', result);
            
            if (result.success) {
                setSuccessMessage('Saved/Updated');
                setOperationMode('Edit');
                await loadObservationsList(sessionData); // Refresh observations list
            } else {
                setError(result.message || 'Failed to save/update');
            }
            
        } catch (error) {
            console.error('Error saving/updating:', error);
            setError('Failed to save/update: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForward = async () => {
        try {
            if (!formData.txtFields5) {
                setError('Please Check Code');
      return;
    }

    setLoading(true);
            
            const result = await forwardObservation(formData.txtFields5);
            
            if (result.success) {
                setSuccessMessage('Forwarded');
                clearData();
                await loadObservationsList(sessionData); // Refresh observations list
            } else {
                setError(result.message || 'Failed to forward');
            }
            
        } catch (error) {
            console.error('Error forwarding:', error);
            setError('Failed to forward: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

    const handleEditObservation = (observation) => {
        console.log('🔧 EDIT button clicked');
        console.log('🔧 Editing observation - Full observation data:', observation);
        console.log('🔧 Available observation fields:', Object.keys(observation));
        
        const formatDateForInput = (dateStr) => {
            if (!dateStr) return '';
            try {
                let date;
                if (typeof dateStr === 'string') {
                    if (dateStr.includes('-')) {
                        date = new Date(dateStr);
                    } else if (dateStr.includes('/')) {
                        date = new Date(dateStr.replace(/\//g, '-'));
                    } else {
                        date = new Date(dateStr);
                    }
                } else {
                    date = new Date(dateStr);
                }
                
                if (isNaN(date.getTime())) {
                    console.log('Invalid date:', dateStr);
                    return '';
                }
                
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            } catch (e) {
                console.log('Date formatting error:', e, 'for date:', dateStr);
                return '';
            }
        };

        const editFormData = {
            txtFields5: observation.OBSERVCODE || observation.observcode || '',
            txtbudSlno: String(observation.OBSERVSLNO || observation.observslno || ''),
            dtpProposalDate: formatDateForInput(observation.OBSERVDATE || observation.observdate),
            lstWKC: observation.RAISEDBYNAMEDESG || observation.raisedbynamedesg || 'Select',
            ComTender: observation.MAKINGBYNAMEDESg || observation.makingbynamedesg || 'Select',
            txtJustfication: observation.OBSERVATIONSTR || observation.observationstr || '',
            TxtItem: observation.DECISIONTAKEN || observation.decisiontaken || '',
            txtTechSpec: observation.OPER_SINGED_STAMP || observation.oper_singed_stamp || '',
            txtTaskComp: observation.LEAD_SINGED_STAMP || observation.lead_singed_stamp || '',
            txtTask: observation.QAG_SINGED_STAMP || observation.qag_singed_stamp || '',
            txtitempurchasedearlier: observation.MSQAA_SINGED_STAMP || observation.msqaa_singed_stamp || '',
            txtDeliveryDate: observation.RMKS1 || observation.rmks1 || '',
            txtSupplNo: observation.RMKS2 || observation.rmks2 || '',
            txtIniatingOffcr: observation.RMKS3 || observation.rmks3 || '',
            txtTechDir: observation.RMKS4 || observation.rmks4 || ''
        };
        
        console.log('📝 Setting edit form data:', editFormData);
        console.log('📝 Field mapping details:', {
            'Observation Code': {
                'OBSERVCODE': observation.OBSERVCODE,
                'observcode': observation.observcode,
                'final': editFormData.txtFields5
            },
            'Observation Sl.No': {
                'OBSERVSLNO': observation.OBSERVSLNO,
                'observslno': observation.observslno,
                'final': editFormData.txtbudSlno
            },
            'Observation Date': {
                'OBSERVDATE': observation.OBSERVDATE,
                'observdate': observation.observdate,
                'final': editFormData.dtpProposalDate
            },
            'Observation Content': {
                'OBSERVATIONSTR': observation.OBSERVATIONSTR,
                'observationstr': observation.observationstr,
                'final': editFormData.txtJustfication
            },
            'Decision Taken': {
                'DECISIONTAKEN': observation.DECISIONTAKEN,
                'decisiontaken': observation.decisiontaken,
                'final': editFormData.TxtItem
            }
        });
        
        setFormData(editFormData);
        setOperationMode('Edit');
        setError('');
        setSuccessMessage('');
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        const updatedSessionData = {
            ...sessionData,
            OPERID: sessionData.OPERID, // Keep existing OPERID
            OPERNO: sessionData.OPERNO  // Keep existing OPERNO
        };
        setSessionData(updatedSessionData);
        
        console.log('✅ Edit observation completed successfully');
    };
    
    const handleDeleteObservation = async (observation) => {
        console.log('🔧 DELETE button clicked');
        if (window.confirm('Are you sure you want to delete this observation?')) {
            try {
                setLoading(true);
                setError('');
                setSuccessMessage('');
                
                console.log('🗑️ Deleting observation:', observation);
                
                const deleteData = {
                    observcode: observation.OBSERVCODE || observation.observcode,
                        ppdocid: sessionData.PPDOCID,
                        artcleno: sessionData.ARTCLENO,
                        assm_partslno: sessionData.ASSM_PARTSLNO,
                    invno: sessionData.INVNO,
                    operid: sessionData.OPERID,
                    operno: sessionData.OPERNO
                };
                
                console.log('🗑️ Delete data:', deleteData);
                
                await deleteObservation(deleteData.observcode);
                
                setSuccessMessage('Observation deleted successfully');
                await loadObservationsList(sessionData); // Refresh observations list
                
            } catch (error) {
                console.error('Error deleting observation:', error);
                setError('Failed to delete observation: ' + error.message);
    } finally {
      setLoading(false);
    }
    }
  };

  const clearData = () => {
    setFormData({
            txtFields5: '',
            txtbudSlno: '',
            dtpProposalDate: '',
            txtoperno: '',
            lstWKC: 'Select',
            ComTender: 'Select',
            txtJustfication: '',
            TxtItem: '',
            txtTechSpec: '',
            txtTaskComp: '',
            txtTask: '',
            txtitempurchasedearlier: '',
            txtDeliveryDate: '',
            txtSupplNo: '',
            txtIniatingOffcr: '',
            txtTechDir: ''
        });
        setOperationMode('New');
        setError('');
        setSuccessMessage('');
    };

    const handleNewObservation = async () => {
        console.log('🔧 NEW button clicked');
        try {
            clearData();
            setOperationMode('New');
            await generateObservationCodeForNew();
            console.log('✅ NEW button completed successfully');
        } catch (error) {
            console.error('❌ NEW button error:', error);
            setError('Failed to create new observation: ' + error.message);
        }
    };
    
    const handleForwardObservation = async () => {
        console.log('🔧 FORWARD button clicked');
        try {
            if (!formData.txtFields5 || formData.txtFields5 === 'System Generated') {
                setError('Please Check Code');
                return;
            }
            
            setLoading(true);
            
            const result = await forwardObservation(formData.txtFields5);
            
            if (result.success) {
                setSuccessMessage('Forwarded');
                clearData();
                await loadObservationsList(sessionData);
                console.log('✅ FORWARD button completed successfully');
            } else {
                setError(result.message || 'Failed to forward');
            }
            
        } catch (error) {
            console.error('❌ FORWARD button error:', error);
            setError('Failed to forward: ' + error.message);
        } finally {
            setLoading(false);
        }
    };
    
    
    const handleForNew = async () => {
        try {
            setLoading(true);
            
            clearData();
            setOperationMode('New');
            await generateObservationCodeForNew();
            
            setSuccessMessage('Ready for new observation');
            
        } catch (error) {
            console.error('Error preparing for new:', error);
            setError('Failed to prepare for new: ' + error.message);
        } finally {
            setLoading(false);
        }
    };
    
    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading PP Observations Entry...</p>
        </div>
        );
    }

  return (
        <div className="pp-operations-entry">
            {/* Header section removed to eliminate horizontal bar above title */}
                {error && <div className="error-message">{error}</div>}

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                {successMessage && <div className="success-message" style={{ margin: 0 }}>{successMessage}</div>}
                <h4 style={{ margin: 0 }}>List of Temporary Documentation Entry</h4>
            </div>
                   

            {/* Form Content - Direct in main container */}
            <div className="form-container">
                
                {/* Observation For Text Field */}
                <div className="form-row">
                    <div className="form-group full-width">
                        <label>Observation For:</label>
                        <input
                            type="text"
                            value={`${sessionData.PPDOCID || 'N/A'}/${sessionData.ARTCLENO || 'N/A'}/${sessionData.ASSM_PARTSLNO || 'N/A'}/${sessionData.INVNO || 'N/A'}/${sessionData.OPERID || 'N/A'}/${sessionData.OPERNO || 'N/A'}`}
                            className="form-control"
                            readOnly
                        />
                    </div>
                </div>
                    {/* Row 1: Observation Code, Sl.No and Date */}
        <div className="form-row">
                        <div className="form-group">
                            <label>Observation Code:</label>
            <input
              type="text"
                                    name="txtFields5"
                                    value={formData.txtFields5}
                                    onChange={handleInputChange}
                                    className="form-control"
                                    placeholder={isGeneratingCode ? "Generating..." : "System Generated"}
                                    readOnly
                                />
        </div>
                        <div className="form-group">
                            <label>Observation Sl.No:</label>
            <input
              type="text"
                                    name="txtbudSlno"
                                    value={formData.txtbudSlno}
              onChange={handleInputChange}
                                className="form-control"
                                    placeholder="Enter Sl.No"
                                    required
                                />
        </div>
          <div className="form-group">
                                        <label>Date:</label>
            <input
              type="date"
                                name="dtpProposalDate"
                                value={formData.dtpProposalDate}
              onChange={handleInputChange}
                                className="form-control"
              required
            />
          </div>
                    </div>

                    {/* Row 2: Raised By and Raised Group */}
                    <div className="form-row">
          <div className="form-group">
                            <label>Raised By:</label>
              <select
                                name="lstWKC"
                                value={formData.lstWKC}
                onChange={handleInputChange}
              className="form-control"
              required
            >
                                {raisedByOptions.map(option => (
                                    <option key={option} value={option}>
                                        {option}
                    </option>
              ))}
              </select>
          </div>
          <div className="form-group">
                            <label>Raised Group:</label>
              <select
                                name="ComTender"
                                value={formData.ComTender}
                onChange={handleInputChange}
              className="form-control"
              required
            >
                                {raisedGroupOptions.map(option => (
                                    <option key={option} value={option}>
                                        {option}
                    </option>
              ))}
              </select>
          </div>
        </div>

                    {/* Row 3: Observation and Decision Taken */}
        <div className="form-row">
          <div className="form-group">
                                        <label>Oper No:</label>
                            <textarea
                                name="txtJustfication"
                                value={formData.txtJustfication}
                onChange={handleInputChange}
                                rows="3"
                                className="form-control"
                                placeholder="Enter Oper No."
              required
            />
          </div>
          <div className="form-group">
                            <label>Document No:</label>
                            <textarea
                                name="TxtItem"
                                value={formData.TxtItem}
              onChange={handleInputChange}
                                rows="3"
                                className="form-control"
                                placeholder="Enter Document No."
                            />
          </div>
        </div>

                    {/* Row 4: Operator Signed Stamp and Lead Signed Stamp */}
        <div className="form-row">
          <div className="form-group">
                            <label>To Drawing :</label>
            <input
              type="text"
                                name="txtTechSpec"
                                value={formData.txtTechSpec}
              onChange={handleInputChange}
                                placeholder="Enter To Drawing"
                                className="form-control"
            />
          </div>
          <div className="form-group">
                            <label>Code Of Change:</label>
            <input
              type="text"
                                name="txtTaskComp"
                                value={formData.txtTaskComp}
              onChange={handleInputChange}
                                placeholder="Enter Code of Change"
                                className="form-control"
            />
          </div>
        </div>

                    {/* Row 5: QAG Signed Stamp and MSQAA Signed Stamp */}
        <div className="form-row">
          <div className="form-group">
                            <label>From Which Series:</label>
            <input
              type="text"
                                name="txtTask"
                                value={formData.txtTask}
              onChange={handleInputChange}
                                placeholder="Enter Series."
                                className="form-control"
            />
          </div>
          <div className="form-group">
                            <label>Operator:</label>
            <input
              type="text"
                                name="txtitempurchasedearlier"
                                value={formData.txtitempurchasedearlier}
              onChange={handleInputChange}
                                placeholder="Enter Operator"
                                className="form-control"
            />
          </div>
        </div>

                    {/* Row 6: Remarks 1 and Remarks 2 */}
        <div className="form-row">
          <div className="form-group">
                            <label>Master:</label>
            <input
              type="text"
                                name="txtDeliveryDate"
                                value={formData.txtDeliveryDate}
              onChange={handleInputChange}
                                placeholder="Enter master"
                                className="form-control"
            />
          </div>
          <div className="form-group">
                            <label>QAG:</label>
            <input
              type="text"
                                name="txtSupplNo"
                                value={formData.txtSupplNo}
              onChange={handleInputChange}
                                placeholder="Enter QAG"
                                className="form-control"
            />
          </div>
        </div>

                    {/* Row 7: Remarks 3 and Remarks 4 */}
        <div className="form-row">
          <div className="form-group">
                            <label>MSQAA:</label>
            <input
              type="text"
                                name="txtIniatingOffcr"
                                value={formData.txtIniatingOffcr}
                onChange={handleInputChange}
                                placeholder="Enter MSQAA"
              className="form-control"
            />
          </div>
          <div className="form-group">
                            <label>Remarks :</label>
            <input
              type="text"
                                name="txtTechDir"
                                value={formData.txtTechDir}
              onChange={handleInputChange}
                                placeholder="Enter remarks "
                                className="form-control"
            />
            </div>
                    </div>

                    {/* Action Buttons - Matching VB.NET buttons */}
                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={handleSaveUpdate}
                            className="btn btn-primary update-btn"
                            disabled={loading || isGeneratingCode}
                        >
                            {isGeneratingCode ? '⏳ Generating...' : '⭐ UPDATE'}
                        </button>
                        
                        <button
                            type="button"
                            onClick={handleNewObservation}
                            className="btn btn-success new-btn"
                            disabled={loading || isGeneratingCode}
                        >
                            📝 NEW
                        </button>
                        
                        <button
                            type="button"
                            onClick={handleForwardObservation}
                            className="btn btn-warning forward-btn"
                            disabled={loading || !formData.txtFields5 || formData.txtFields5 === 'System Generated'}
                        >
                            ➡️ FORWARD
                        </button>
                        
                </div>
              </div>

            {/* List of Temporary Documentation Grid - Side by Side Layout */}
            <h4 className="operations-title">List of Temporary Documentation</h4>
            {loading && (
                <div style={{textAlign: 'center', padding: '20px', color: '#666'}}>
                    Loading list of temporary documentation data...
                </div>
            )}
            <div className="operations-container">
                    {/* Filter Section */}
                    <div className="filter-sidebar">
                        <div className="filter-section">
                            <div className="filter-toggle">
                    <input
                                    type="checkbox"
                                    checked={showFilters}
                                    onChange={(e) => setShowFilters(e.target.checked)}
                                />
                                <label>Show Filters</label>
                </div>
                            
                            {showFilters && (
                                <div className="filter-controls">
                                    <div className="filter-group">
                                        <label>Temporary Documentation Sl.No:</label>
                    <input
                      type="text"
                                            placeholder="Enter Observation Sl.No"
                                            value={txtDAKIDSearch}
                                            onChange={(e) => setTxtDAKIDSearch(e.target.value)}
              className="form-control"
            />
                </div>
                                    <div className="filter-group">
                                        <label>Short Content of Observation:</label>
                    <input
                      type="text"
                                            placeholder="Enter Short Content of Observation"
                                            value={txtSubjectSearch}
                                            onChange={(e) => setTxtSubjectSearch(e.target.value)}
              className="form-control"
            />
                </div>
                                    <div className="filter-group">
                                        <label>Raised By:</label>
                    <input
                      type="text"
                                            placeholder="Enter Raised By"
                                            value={txtDacumentRefNoSearch}
                                            onChange={(e) => setTxtDacumentRefNoSearch(e.target.value)}
              className="form-control"
            />
                </div>
                                    <div className="filter-group">
                                        <label>Raised Group:</label>
                    <input
                      type="text"
                                            placeholder="Enter Raised Group"
                                            value={txtSearchParametersSearch}
                                            onChange={(e) => setTxtSearchParametersSearch(e.target.value)}
              className="form-control"
            />
                </div>
                                    <div className="filter-group">
                                        <label>Date From:</label>
                      <input
                        type="date"
                                            value={txtReceivedFrom}
                                            onChange={(e) => setTxtReceivedFrom(e.target.value)}
              className="form-control"
                      />
                    </div>
                                    <div className="filter-group">
                                        <label>Date To:</label>
                                        <input
                                            type="date"
                                            value={txtReceivedTo}
                                            onChange={(e) => setTxtReceivedTo(e.target.value)}
              className="form-control"
            />
                </div>
                                    <div className="filter-actions">
                <button
                                            onClick={handleVBFilterSearch}
                                            className="btn btn-primary search-btn"
                                        >
                                            🔍 SEARCH
              </button>
                                        <button
                                            onClick={clearAllFilters}
                                            className="btn btn-secondary clear-btn"
                                            style={{marginLeft: '10px'}}
                                        >
                                            🗑️ CLEAR
              </button>
        </div>
                                </div>
                            )}
            </div>
          </div>
          
                    {/* Table Section */}
                    <div className="table-section">
          <div className="table-container">
            <table className="operations-table">
              <thead>
                <tr>
                                        <th><input type="checkbox" /></th>
                                        <th>Code</th>
                                        <th>Sl.No</th>
                                        <th>Date</th>
                                        <th>Document No</th>
                                        <th>To Drawing</th>
                                        <th>Raised By</th>
                                        <th>Status</th>                                  
                                        <th>Action</th>
                </tr>
              </thead>
              <tbody>
                                    {console.log('🔍 Rendering table - filteredObservationsData:', filteredObservationsData, 'length:', filteredObservationsData.length)}
                                    {filteredObservationsData.length > 0 ? (
                                        filteredObservationsData.map((observation, index) => (
                      <tr key={index}>
                                            <td><input type="checkbox" /></td>
                                            <td>{observation.OBSERVCODE || observation.observcode || ''}</td>
                                            <td>{observation.OBSERVSLNO || observation.observslno || ''}</td>
                                            <td>{observation.OBSERVDATE || observation.observdate || ''}</td>
                                            
                                            
                                            <td>{observation.OBSERVATIONSTR || observation.observationstr || ''}</td>
                                            <td>{observation.DECISIONTAKEN || observation.decisiontaken || ''}</td>
                                            <td>{observation.RAISEDBYNAMEDESG || observation.raisedbynamedesg || ''}</td>
                                            <td>{observation.OBSERV_PRESENTSTATUS || observation.OBSERV_PRESENTSTATUS || ''}</td>
                                           
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn btn-sm btn-primary edit-btn"
                                                        onClick={() => handleEditObservation(observation)}
                                                        title="Edit Temporary Documentation"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-danger delete-btn"
                                                        onClick={() => handleDeleteObservation(observation)}
                                                        title="Delete Temporary Documentation"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                      </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="13" style={{textAlign: 'center', padding: '20px', color: '#666'}}>
                                                {loading ? 'Loading data...' : 'No temporary documentation found'}
                                            </td>
                                        </tr>
                                    )}
              </tbody>
            </table>
                        </div>
                    </div>
            </div>

      <style jsx>{`
                .pp-operations-entry {
                    padding: 5px;
                    max-width: 100%;
                    margin: 0 auto;
                    margin-bottom: 50px;
                }
                
                .header-section {
                    margin-bottom: 15px;
                }
                
                .header-top {
          display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                
                .header-top h3 {
          margin: 0;
                    color: #333;
                    font-size: 1.5em;
                }
                
                
                .form-container {
                    /* Compressed width and centered */
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 0 20px;
                }

                .main-title {
                    color: #2c3e50;
                    margin-bottom: 20px;
                    padding-bottom: 10px;
                    border-bottom: 2px solid #3498db;
                    font-size: 1.5em;
                    font-weight: normal;
                    text-align: center;
                    letter-spacing: 1px;
                }


                .triple-field {
                    flex: 2;
                }

                .triple-inputs {
                    display: flex;
                    gap: 10px;
                }

                .triple-inputs input {
                    flex: 1;
                }

                .update-btn {
                    background: #007bff;
                    color: white;
                    font-size: 14px;
                    font-weight: bold;
                    padding: 10px 20px;
                    min-width: 120px;
                    border-radius: 6px;
                    box-shadow: 0 2px 4px rgba(0,123,255,0.3);
                }

                .new-btn {
                    background: #28a745;
                    color: white;
                    font-size: 14px;
                    font-weight: bold;
                    padding: 10px 20px;
                    min-width: 120px;
                    border-radius: 6px;
                    box-shadow: 0 2px 4px rgba(40,167,69,0.3);
                }

                .forward-btn {
                    background: #ffc107;
                    color: #212529;
                    font-size: 14px;
                    font-weight: bold;
                    padding: 10px 20px;
                    min-width: 120px;
                    border-radius: 6px;
                    box-shadow: 0 2px 4px rgba(255,193,7,0.3);
                }


                .for-new-btn {
                    background: transparent;
                    color: #007bff;
                    border: 2px solid #007bff;
                    font-size: 14px;
                    font-weight: bold;
                    padding: 10px 20px;
                    min-width: 120px;
                    border-radius: 6px;
                }

                .for-new-btn:hover:not(:disabled) {
                    background: #007bff;
                    color: white;
                }

                .filter-section {
                    margin-bottom: 10px;
                    padding: 8px;
                    background: #f8f9fa;
                    border-radius: 4px;
                    border: 1px solid #ddd;
                }

                .filter-toggle {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    margin-bottom: 8px;
                }

                .filter-toggle input[type="checkbox"] {
                    width: 12px;
                    height: 12px;
                }

                .filter-toggle label {
                    font-size: 12px;
                    font-weight: 600;
                }

                .filter-controls {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .filter-group {
                    display: flex;
                    flex-direction: column;
                }

                .filter-group label {
                    margin-bottom: 2px;
                    font-weight: 600;
                    color: #333;
                    font-size: 11px;
                }

                .filter-group input {
                    padding: 4px 6px;
                    border: 1px solid #ddd;
                    border-radius: 3px;
                    font-size: 11px;
                }

                .search-btn {
                    background: #007bff;
                    color: white;
                    font-weight: bold;
                    font-size: 9px;
                    padding: 4px 8px;
                }

                .delete-btn {
                    background: #dc3545;
                    color: white;
                    border-radius: 50%;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
        }

        .form-row {
          display: flex;
                    gap: 10px;
                    margin-bottom: 10px;
                    align-items: flex-start;
        }

        .form-group {
          flex: 1;
          display: flex;
          flex-direction: column;
                    min-width: 0;
                }
                
                .form-group.full-width {
                    flex: 2;
        }

        .form-group label {
                    margin-bottom: 3px;
                    font-weight: 600;
                    color: #2c3e50;
                    font-size: 10px;
                    text-transform: uppercase;
                    letter-spacing: 0.2px;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
                    padding: 6px 8px;
                    border: 1px solid #e1e8ed;
          border-radius: 4px;
                    font-size: 11px;
                    transition: all 0.3s ease;
                    background: #ffffff;
                }

                .form-group input:focus,
                .form-group textarea:focus,
                .form-group select:focus {
                    outline: none;
                    border-color: #3498db;
                    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
        }
                
                .form-group textarea {
                    resize: vertical;
                    min-height: 40px;
                    font-family: inherit;
                }

                .form-group input[readonly] {
                    background-color: #f8f9fa;
                    color: #6c757d;
          cursor: not-allowed;
        }

                .form-actions {
                    display: flex;
                    gap: 10px;
                    margin-top: 20px;
                    padding-top: 15px;
                    justify-content: center;
                    flex-wrap: wrap;
                }

                .btn {
                    padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
                    font-size: 11px;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                    min-width: 80px;
        }

        .btn-sm {
                    padding: 5px 10px;
                    font-size: 11px;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

                .btn-primary:hover:not(:disabled) {
          background: #0056b3;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

                .btn-secondary:hover:not(:disabled) {
          background: #545b62;
        }

        .btn-danger {
          background: #dc3545;
          color: white;
        }

                .btn-danger:hover:not(:disabled) {
          background: #c82333;
        }

                .btn-outline {
                    background: transparent;
                    border: 1px solid #007bff;
                    color: #007bff;
                }
                
                .btn-outline:hover:not(:disabled) {
                    background: #007bff;
                    color: white;
                }
                
                .btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                
                h4 {
                    color: #000;
                    margin-bottom: 15px;
                    padding-bottom: 3px;
                    font-size: 1.1em;
                    font-weight: bold;
                    text-align: center;
                }

                .operations-title {
                    text-align: left;
                }


                .operations-container {
                    display: flex;
                    gap: 15px;
                    margin-top: 10px;
                }

                .filter-sidebar {
                    width: 250px;
                    background: #f8f9fa;
                    border-radius: 6px;
                    border: 1px solid #ddd;
                    padding: 10px;
                    overflow-y: auto;
                    flex-shrink: 0;
                }

                .table-section {
                    flex: 1;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }

                .table-container {
                    overflow-x: hidden;
                    overflow-y: auto;
                    max-height: 200px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    background: white;
                    box-shadow: 0 1px 4px rgba(0,0,0,0.1);
                    width: 100%;
                    max-width: 100%;
                }

                .table-container::-webkit-scrollbar {
                    width: 8px;
                }

                .table-container::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 4px;
                }

                .table-container::-webkit-scrollbar-thumb {
                    background: #c1c1c1;
                    border-radius: 4px;
                }

                .table-container::-webkit-scrollbar-thumb:hover {
                    background: #a8a8a8;
                }

                .operations-table {
                    width: 100%;
                    border-collapse: collapse;
                    background: white;
                    font-size: 10px;
                    min-width: 100%;
                    max-width: 100%;
                    table-layout: fixed;
                }

        .operations-table th,
        .operations-table td {
                    padding: 4px 6px;
          text-align: left;
                    border-bottom: 1px solid #e9ecef;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
        }

                .operations-table th:nth-child(1), .operations-table td:nth-child(1) { width: 30px; } /* Checkbox */
                .operations-table th:nth-child(2), .operations-table td:nth-child(2) { width: 60px; } /* Code */
                .operations-table th:nth-child(3), .operations-table td:nth-child(3) { width: 50px; } /* Sl.No */
                .operations-table th:nth-child(4), .operations-table td:nth-child(4) { width: 80px; } /* Date */
                .operations-table th:nth-child(5), .operations-table td:nth-child(5) { width: 90px; } /* Raised By */
                .operations-table th:nth-child(6), .operations-table td:nth-child(6) { width: 90px; } /* Raised Group */
                .operations-table th:nth-child(7), .operations-table td:nth-child(7) { width: 100px; } /* Observation */
                .operations-table th:nth-child(8), .operations-table td:nth-child(8) { width: 100px; } /* Decision Taken */
                .operations-table th:nth-child(9), .operations-table td:nth-child(9) { width: 80px; } /* Operator Stamp */
                .operations-table th:nth-child(10), .operations-table td:nth-child(10) { width: 80px; } /* Lead Stamp */
                .operations-table th:nth-child(11), .operations-table td:nth-child(11) { width: 80px; } /* QAG Stamp */
                .operations-table th:nth-child(12), .operations-table td:nth-child(12) { width: 80px; } /* MSQAA Stamp */
                .operations-table th:nth-child(13), .operations-table td:nth-child(13) { width: 100px; } /* Action */

                .operations-table th {
                    background: #f8f9fa;
                    font-weight: bold;
                    color: #555;
                    font-size: 12px;
                    position: sticky;
                    top: 0;
                    z-index: 10;
                }

        .operations-table tr:hover {
          background: #f5f5f5;
        }

                .action-buttons {
                    display: flex;
                    gap: 8px;
                    justify-content: center;
                    align-items: center;
                }

                .edit-btn, .delete-btn {
                    padding: 4px 8px;
                    font-size: 10px;
                    border-radius: 4px;
                    border: 1px solid;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-weight: 500;
                    min-width: 45px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .edit-btn {
                    background: #007bff;
                    color: white;
                    border-color: #007bff;
                }

                .edit-btn:hover:not(:disabled) {
                    background: #0056b3;
                    border-color: #0056b3;
                    transform: translateY(-1px);
                }

                .delete-btn {
                    background: #dc3545;
                    color: white;
                    border-color: #dc3545;
                }

                .delete-btn:hover:not(:disabled) {
                    background: #c82333;
                    border-color: #c82333;
                    transform: translateY(-1px);
                }
                
                .error-message {
                    background: #f8d7da;
                    color: #721c24;
                    padding: 10px;
                    border-radius: 4px;
                    margin: 10px 0;
                    border: 1px solid #f5c6cb;
                }
                
                .success-message {
                    background: #d4edda;
                    color: #155724;
                    padding: 10px;
          border-radius: 4px;
                    margin: 10px 0;
                    border: 1px solid #c3e6cb;
        }

                .loading-container {
          display: flex;
                    flex-direction: column;
          align-items: center;
                    justify-content: center;
                    padding: 50px;
                }
                
                .loading-spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #007bff;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
                    .form-row, .filter-row {
            flex-direction: column;
                        gap: 10px;
                    }
                    .form-group.full-width {
                        flex: none;
                        width: 100%;
                    }
                    .triple-inputs {
            flex-direction: column;
                    }
                    .triple-inputs input {
                        width: 100%;
                    }
                    .date-range {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    .action-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default PP_ListTmDocs;