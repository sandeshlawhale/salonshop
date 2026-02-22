
import axios from 'axios';

const testGetAgents = async () => {
    try {
        const response = await axios.get('http://localhost:5000/api/v1/users/agents');
        console.log('✅ Agents retrieved successfully:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('❌ Failed to retrieve agents:', error.response?.data || error.message);
    }
};

testGetAgents();
