const express = require('express');
const OAuthClient = require('intuit-oauth');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// OAuth Client
let oauthClient = null;
let oauth2_token_json = null;

// Initialize OAuth Client
function getOAuthClient() {
    if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
        throw new Error('Missing CLIENT_ID or CLIENT_SECRET in .env');
    }
    return new OAuthClient({
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        environment: process.env.QB_ENVIRONMENT || 'sandbox',
        redirectUri: process.env.REDIRECT_URI
    });
}

// 1. Start Auth Flow
app.get('/auth/connect', (req, res) => {
    try {
        oauthClient = getOAuthClient();
        // Scopes: Accounting for transactions, Profile for company info
        const authUri = oauthClient.authorizeUri({
            scope: [OAuthClient.scopes.Accounting, OAuthClient.scopes.OpenId],
            state: 'init'
        });
        res.redirect(authUri);
    } catch (error) {
        res.status(500).send(`Error starting auth: ${error.message}`);
    }
});

// 2. Callback
app.get('/callback', async (req, res) => {
    try {
        const parseRedirect = req.url;
        const authResponse = await oauthClient.createToken(parseRedirect);
        oauth2_token_json = authResponse.getJson();
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Authentication Failed');
    }
});

// 3. Check Auth Status
app.get('/api/status', (req, res) => {
    const isConnected = !!oauth2_token_json;
    res.json({ isConnected });
});

// 4. Fetch Data (Transactions & Vendors)
// READ-ONLY: Only uses Query (Select) statements
app.get('/api/qb-data', async (req, res) => {
    if (!oauthClient || !oauthClient.isAccessTokenValid()) {
        return res.status(401).json({ error: 'Not authenticated or token expired' });
    }

    try {
        const companyId = oauthClient.getToken().realmId;

        // A. Fetch Vendors
        // Limit to 100 for now, can implement pagination if needed
        const vendorsQuery = "SELECT * FROM Vendor MAXRESULTS 1000";
        const vendorsResponse = await oauthClient.makeApiCall({
            url: `${getApiUrl()}/v3/company/${companyId}/query?query=${encodeURIComponent(vendorsQuery)}&minorversion=65`,
            method: 'GET'
        });

        // B. Fetch Unreconciled Transactions (generic approach)
        // Adjust date range as needed. For now, looking back 6 months.
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 6);
        const dateStr = startDate.toISOString().split('T')[0];

        // Fetching Expenses/Checks/Deposits that are NOT reconciled would require
        // checking the 'ClearedStatus' field if available, but it's not always queryable directly in standard 'Transaction' entity
        // We will fetch recent transactions and let the frontend do the "matching" to see what exists.
        // We look for: Purchases, Checks, Deposits, JournalEntries
        // Note: The 'Transaction' entity is not directly queryable in all scopes effectively, 
        // usually we query specific types like 'Purchase', 'Deposit', 'JournalEntry'.
        // For simplicity, let's query 'Purchase' (Expenses) and 'Deposit' first.

        const expenseQuery = `SELECT * FROM Purchase WHERE TxnDate > '${dateStr}' MAXRESULTS 1000`;
        const expenseResponse = await oauthClient.makeApiCall({
            url: `${getApiUrl()}/v3/company/${companyId}/query?query=${encodeURIComponent(expenseQuery)}&minorversion=65`,
            method: 'GET'
        });

        const depositQuery = `SELECT * FROM Deposit WHERE TxnDate > '${dateStr}' MAXRESULTS 1000`;
        const depositResponse = await oauthClient.makeApiCall({
            url: `${getApiUrl()}/v3/company/${companyId}/query?query=${encodeURIComponent(depositQuery)}&minorversion=65`,
            method: 'GET'
        });

        const customerQuery = "SELECT * FROM Customer MAXRESULTS 1000";
        const customerResponse = await oauthClient.makeApiCall({
            url: `${getApiUrl()}/v3/company/${companyId}/query?query=${encodeURIComponent(customerQuery)}&minorversion=65`,
            method: 'GET'
        });

        res.json({
            vendors: JSON.parse(vendorsResponse.body).QueryResponse.Vendor || [],
            customers: JSON.parse(customerResponse.body).QueryResponse.Customer || [],
            expenses: JSON.parse(expenseResponse.body).QueryResponse.Purchase || [],
            deposits: JSON.parse(depositResponse.body).QueryResponse.Deposit || []
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Failed to fetch data' });
    }
});

function getApiUrl() {
    return process.env.QB_ENVIRONMENT === 'production'
        ? 'https://quickbooks.api.intuit.com'
        : 'https://sandbox-quickbooks.api.intuit.com';
}

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
