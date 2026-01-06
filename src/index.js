import { LOGO_BASE64 } from './logo.js';

const ADMIN_USERNAME = 'Skyabove@gmail.com';
const ADMIN_PASSWORD = 'LoopLoop123@@';

const INITIAL_CANDIDATES = [
  { id: 'candidate_1', name: 'Sharon Forester', position: 'Parish Council' },
  { id: 'candidate_2', name: 'Neil Dusek', position: 'Parish Council' },
  { id: 'candidate_3', name: 'Tina Seidel', position: 'Parish Council' },
  { id: 'candidate_4', name: 'Brian Waneck', position: 'Parish Council' },
  { id: 'candidate_5', name: 'Jodi Pruitt', position: 'Parish Council' },
  { id: 'candidate_6', name: 'Deana Seidel', position: 'Parish Council' },
  { id: 'candidate_7', name: 'Micheal Goertz', position: 'Parish Council' },
];

async function getCandidates(env) {
  const stored = await env.VOTING_KV.get('candidates');
  if (stored) {
    return JSON.parse(stored);
  }
  return INITIAL_CANDIDATES;
}

function renderVotingPage(candidates) {
  return \`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Parish Council Election 2026</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; }
  </style>
</head>
<body>
  <div id="app" class="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 p-4 md:p-8">
    <div class="max-w-2xl mx-auto">
      <div class="text-center mb-8">
        <div class="inline-block bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-4">
          <span class="text-blue-200 text-sm font-medium">2026 Election</span>
        </div>
        <img src="\${LOGO_BASE64}" alt="Parish Logo" class="h-24 mx-auto mb-6 rounded-lg shadow-lg">
        <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">Parish Council Election</h1>
        <p class="text-blue-200" id="subtitle">Select your candidate and cast your vote</p>
      </div>
      <div id="error-box" class="hidden bg-red-500/20 border border-red-400 text-red-100 px-4 py-3 rounded-lg mb-6"></div>
      <div class="bg-white rounded-2xl shadow-2xl overflow-hidden" id="main-card">
        <div class="p-6 text-center text-gray-600">Loading...</div>
      </div>
      <div class="text-center mt-6 text-blue-200 text-sm">
        <p>Your vote is private and secure</p>
        <p class="mt-1 text-blue-300/60">Each device can only vote once</p>
        <div class="mt-8 pt-6 border-t border-white/10">
          <a href="/admin" class="text-blue-300/40 hover:text-blue-200 text-xs transition-colors">Admin Login</a>
        </div>
      </div>
    </div>
  </div>

  <script>
    const CANDIDATES = \${JSON.stringify(candidates)};
    let selectedCandidate = null;
    let hasVoted = false;
    let voteCounts = {};
    let confirmMode = false;

    async function init() {
      try {
        const response = await fetch('/api/status');
        const data = await response.json();
        hasVoted = data.hasVoted;
        voteCounts = data.voteCounts || {};
        
        if (hasVoted) {
          document.getElementById('subtitle').textContent = 'Thank you for voting!';
          showResults();
        } else {
          showVotingForm();
        }
      } catch (err) {
        showError('Failed to load voting data. Please refresh.');
      }
    }

    function showError(message) {
      const box = document.getElementById('error-box');
      box.textContent = message;
      box.classList.remove('hidden');
    }

    function hideError() {
      document.getElementById('error-box').classList.add('hidden');
    }

    function showVotingForm() {
      const card = document.getElementById('main-card');
      card.innerHTML = \`
        <div class="p-6">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">Select Your Candidate</h2>
          <div class="space-y-3" id="candidates-list"></div>
        </div>
        <div class="bg-gray-50 p-6 border-t" id="submit-area"></div>
      \`;
      
      const list = document.getElementById('candidates-list');
      CANDIDATES.forEach(candidate => {
        const btn = document.createElement('button');
        btn.className = 'w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 border-gray-200 hover:border-blue-300 hover:bg-gray-50';
        btn.dataset.id = candidate.id;
        btn.innerHTML = \`
          <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center border-gray-300" id="radio-\\\${candidate.id}"></div>
          <div>
            <div class="font-medium text-gray-900">\\\${candidate.name}</div>
            <div class="text-sm text-gray-500">\\\${candidate.position}</div>
          </div>
        \`;
        btn.onclick = () => selectCandidate(candidate.id);
        list.appendChild(btn);
      });
      
      updateSubmitArea();
    }

    function selectCandidate(id) {
      selectedCandidate = id;
      confirmMode = false;
      
      document.querySelectorAll('#candidates-list button').forEach(btn => {
        const isSelected = btn.dataset.id === id;
        btn.className = 'w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ' + 
          (isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50');
        
        const radio = document.getElementById('radio-' + btn.dataset.id);
        if (isSelected) {
          radio.className = 'w-6 h-6 rounded-full border-2 flex items-center justify-center border-blue-500 bg-blue-500';
          radio.innerHTML = '<svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>';
        } else {
          radio.className = 'w-6 h-6 rounded-full border-2 flex items-center justify-center border-gray-300';
          radio.innerHTML = '';
        }
      });
      
      updateSubmitArea();
    }

    function updateSubmitArea() {
      const area = document.getElementById('submit-area');
      
      if (!confirmMode) {
        area.innerHTML = \`
          <button onclick="showConfirm()" id="continue-btn" class="\\\${selectedCandidate ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl' : 'bg-gray-300 text-gray-500 cursor-not-allowed'} w-full py-4 rounded-xl font-semibold text-lg transition-all" \\\${selectedCandidate ? '' : 'disabled'}>
            Continue to Vote
          </button>
        \`;
      } else {
        const candidateName = CANDIDATES.find(c => c.id === selectedCandidate)?.name;
        area.innerHTML = \`
          <div class="space-y-4">
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p class="text-yellow-800 font-medium">Confirm Your Vote</p>
              <p class="text-yellow-700 text-sm mt-1">
                You are voting for <strong>\\\${candidateName}</strong>. This action cannot be undone.
              </p>
            </div>
            <div class="flex gap-3">
              <button onclick="cancelConfirm()" class="flex-1 py-3 rounded-xl font-medium border-2 border-gray-300 text-gray-700 hover:bg-gray-100">
                Go Back
              </button>
              <button onclick="submitVote()" id="confirm-btn" class="flex-1 py-3 rounded-xl font-medium bg-green-600 text-white hover:bg-green-700">
                Confirm Vote
              </button>
            </div>
          </div>
        \`;
      }
    }

    function showConfirm() {
      if (!selectedCandidate) return;
      confirmMode = true;
      updateSubmitArea();
    }

    function cancelConfirm() {
      confirmMode = false;
      updateSubmitArea();
    }

    async function submitVote() {
      if (!selectedCandidate) return;
      
      const btn = document.getElementById('confirm-btn');
      btn.disabled = true;
      btn.textContent = 'Submitting...';
      btn.className = 'flex-1 py-3 rounded-xl font-medium bg-green-400 text-white';
      
      hideError();
      
      try {
        const response = await fetch('/api/vote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ candidateId: selectedCandidate })
        });
        
        const data = await response.json();
        
        if (data.success) {
          hasVoted = true;
          voteCounts = data.voteCounts;
          document.getElementById('subtitle').textContent = 'Thank you for voting!';
          showResults();
        } else {
          showError(data.error || 'Failed to submit vote.');
          btn.disabled = false;
          btn.textContent = 'Confirm Vote';
          btn.className = 'flex-1 py-3 rounded-xl font-medium bg-green-600 text-white hover:bg-green-700';
        }
      } catch (err) {
        showError('Failed to submit vote. Please try again.');
        btn.disabled = false;
        btn.textContent = 'Confirm Vote';
        btn.className = 'flex-1 py-3 rounded-xl font-medium bg-green-600 text-white hover:bg-green-700';
      }
    }

    function showResults() {
      const card = document.getElementById('main-card');
      const totalVotes = Object.values(voteCounts).reduce((sum, count) => sum + count, 0);
      
      let resultsHtml = \`
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-gray-800">Current Results</h2>
            <span class="text-sm text-gray-500">\\\${totalVotes} total votes</span>
          </div>
          <div class="space-y-4">
      \`;
      
      CANDIDATES.forEach(candidate => {
        const votes = voteCounts[candidate.id] || 0;
        const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
        
        resultsHtml += \`
          <div class="relative">
            <div class="flex items-center justify-between mb-1">
              <span class="font-medium text-gray-900">\\\${candidate.name}</span>
              <span class="text-sm text-gray-600">\\\${votes} votes (\\\${percentage}%)</span>
            </div>
            <div class="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500" style="width: \\\${percentage}%"></div>
            </div>
          </div>
        \`;
      });
      
      resultsHtml += \`
          </div>
        </div>
      \`;
      
      if (hasVoted) {
        resultsHtml += \`
          <div class="bg-green-50 p-4 border-t border-green-100">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
              <div>
                <p class="font-medium text-green-800">Your vote has been recorded</p>
                <p class="text-sm text-green-600">Thank you for participating in the election</p>
              </div>
            </div>
          </div>
        \`;
      }
      
      card.innerHTML = resultsHtml;
    }

    init();
  </script>
</body>
</html>\`;
}

function renderAdminPage(candidates) {
  return \`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Election Admin</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen">
  <div id="login-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-xl shadow-xl p-8 max-w-md w-full">
      <div class="text-center mb-6">
        <img src="\${LOGO_BASE64}" alt="Logo" class="h-16 mx-auto mb-4">
        <h2 class="text-2xl font-bold text-gray-800">Admin Login</h2>
      </div>
      <input type="text" id="username-input" class="w-full border-2 border-gray-300 rounded-lg p-3 mb-3 focus:border-blue-500 focus:outline-none" placeholder="Email Address">
      <input type="password" id="password-input" class="w-full border-2 border-gray-300 rounded-lg p-3 mb-4 focus:border-blue-500 focus:outline-none" placeholder="Password">
      <button onclick="login()" class="w-full bg-blue-600 text-white rounded-lg p-3 font-semibold hover:bg-blue-700 transition-colors">Login</button>
      <p id="login-error" class="hidden text-red-500 mt-3 text-sm text-center"></p>
    </div>
  </div>

  <div id="dashboard" class="hidden container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-8">
      <div class="flex items-center gap-4">
        <img src="\${LOGO_BASE64}" alt="Logo" class="h-10">
        <h1 class="text-3xl font-bold text-gray-900">Election Dashboard</h1>
      </div>
      <button onclick="logout()" class="text-gray-600 hover:text-gray-900">Logout</button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 class="text-gray-500 text-sm font-medium">Total Votes</h3>
        <p class="text-3xl font-bold text-gray-900 mt-1" id="total-votes">-</p>
      </div>
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 class="text-gray-500 text-sm font-medium">Leading Candidate</h3>
        <p class="text-xl font-bold text-gray-900 mt-1" id="leading-candidate">-</p>
      </div>
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
        <div>
          <h3 class="text-gray-500 text-sm font-medium">Reset Election</h3>
          <p class="text-xs text-gray-400 mt-1">Clears all data permanently</p>
        </div>
        <button onclick="confirmReset()" class="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 border border-red-200 transition-colors">
          Reset All
        </button>
      </div>
    </div>

    <!-- Add Candidate -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <h3 class="font-semibold text-gray-800 mb-4">Add Candidate</h3>
      <div class="flex gap-4">
        <input type="text" id="new-name" placeholder="Candidate Name" class="flex-1 border-2 border-gray-200 rounded-lg p-3 focus:border-blue-500 outline-none">
        <input type="text" id="new-pos" placeholder="Position (e.g. Council Member)" class="flex-1 border-2 border-gray-200 rounded-lg p-3 focus:border-blue-500 outline-none">
        <button onclick="addCandidate()" class="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700">Add</button>
      </div>
    </div>

    <!-- Results Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
      <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 class="font-semibold text-gray-800">Live Results</h3>
      </div>
      <div id="results-bars" class="p-6 space-y-4"></div>
    </div>

    <!-- Vote Audit Log -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h3 class="font-semibold text-gray-800">Vote Audit Log</h3>
        <button onclick="loadData()" class="text-blue-600 hover:underline text-sm">Refresh</button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-gray-600">
          <thead class="bg-gray-50 text-gray-900 font-medium">
            <tr>
              <th class="px-6 py-3">Time</th>
              <th class="px-6 py-3">Candidate ID</th>
              <th class="px-6 py-3">Candidate Name</th>
            </tr>
          </thead>
          <tbody id="audit-log" class="divide-y divide-gray-200"></tbody>
        </table>
      </div>
    </div>
  </div>

  <script>
    const CANDIDATES = \${JSON.stringify(candidates)};
    let authToken = localStorage.getItem('adminToken');

    if (authToken) {
      document.getElementById('login-modal').classList.add('hidden');
      document.getElementById('dashboard').classList.remove('hidden');
      loadData();
    }

    async function login() {
      const user = document.getElementById('username-input').value;
      const pwd = document.getElementById('password-input').value;
      
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pwd })
      });
      
      if (res.ok) {
        authToken = pwd;
        localStorage.setItem('adminToken', pwd);
        document.getElementById('login-modal').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        loadData();
      } else {
        const err = document.getElementById('login-error');
        err.textContent = 'Invalid credentials';
        err.classList.remove('hidden');
      }
    }

    function logout() {
      localStorage.removeItem('adminToken');
      location.reload();
    }

    async function loadData() {
      try {
        const res = await fetch('/api/admin/votes', {
          headers: { 'x-admin-password': authToken }
        });
        
        if (res.status === 401) return logout();
        
        const data = await res.json();
        renderDashboard(data);
      } catch (err) {
        console.error(err);
      }
    }

    function renderDashboard(data) {
      // Update local candidates list if changed
      if (data.candidates) {
        // Simple reload if candidates changed to refresh globals
        if (JSON.stringify(CANDIDATES) !== JSON.stringify(data.candidates)) {
           location.reload();
           return;
        }
      }

      // Stats
      const total = Object.values(data.counts).reduce((a, b) => a + b, 0);
      document.getElementById('total-votes').textContent = total;
      
      const sorted = Object.entries(data.counts).sort((a, b) => b[1] - a[1]);
      const leaderId = sorted[0]?.[0];
      const leader = CANDIDATES.find(c => c.id === leaderId);
      document.getElementById('leading-candidate').textContent = leader ? leader.name : 'None';

      // Bars
      const bars = document.getElementById('results-bars');
      bars.innerHTML = CANDIDATES.map(c => {
        const votes = data.counts[c.id] || 0;
        const pct = total ? Math.round((votes / total) * 100) : 0;
        return \`
          <div>
            <div class="flex justify-between text-sm mb-1">
              <span>\\\${c.name}</span>
              <span class="font-medium">\\\${votes} (\\\${pct}%)</span>
            </div>
            <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div class="h-full bg-blue-500 rounded-full" style="width: \\\${pct}%"></div>
            </div>
          </div>
        \`;
      }).join('');

      // Audit Log
      const log = document.getElementById('audit-log');
      log.innerHTML = data.votes.map(v => {
        const c = CANDIDATES.find(kan => kan.id === v.candidateId);
        return \`
          <tr class="hover:bg-gray-50">
            <td class="px-6 py-3">\\\${new Date(v.votedAt).toLocaleString()}</td>
            <td class="px-6 py-3 font-mono text-xs">\\\${v.candidateId}</td>
            <td class="px-6 py-3">\\\${c?.name || 'Unknown'}</td>
          </tr>
        \`;
      }).join('');
    }

    async function addCandidate() {
      const name = document.getElementById('new-name').value;
      const pos = document.getElementById('new-pos').value;
      if (!name || !pos) return alert('Please fill in both fields');

      const res = await fetch('/api/admin/candidates', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-password': authToken 
        },
        body: JSON.stringify({ name, position: pos })
      });

      if (res.ok) {
        document.getElementById('new-name').value = '';
        document.getElementById('new-pos').value = '';
        loadData(); // Will trigger reload
      } else {
        alert('Failed to add candidate');
      }
    }

    async function confirmReset() {
      if (!confirm('DANGER: This will delete ALL votes and cannot be undone. Are you sure?')) return;
      
      const res = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: { 'x-admin-password': authToken }
      });
      
      if (res.ok) {
        alert('Election reset successfully');
        loadData();
      } else {
        alert('Failed to reset');
      }
    }
  </script>
</body>
</html>\`;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Get voter ID from cookie or create new one
    const cookies = request.headers.get('Cookie') || '';
    let voterId = cookies.match(/voter_id=([^;]+)/)?.[1];

    if (!voterId) {
      voterId = crypto.randomUUID();
    }

    // Load candidates
    const CANDIDATES = await getCandidates(env);

    // API: Get status
    if (url.pathname === '/api/status') {
      const hasVoted = await env.VOTING_KV.get(`voted:${ voterId } `);
      const countsRaw = await env.VOTING_KV.get('vote_counts');
      const voteCounts = countsRaw ? JSON.parse(countsRaw) : {};

      return new Response(JSON.stringify({ hasVoted: !!hasVoted, voteCounts }), {
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': `voter_id = ${ voterId }; Path =/; Max-Age=31536000; SameSite=Strict`
}
      });
    }

// API: Submit vote
if (url.pathname === '/api/vote' && request.method === 'POST') {
  // Check if already voted
  const hasVoted = await env.VOTING_KV.get(`voted:${voterId}`);
  if (hasVoted) {
    return new Response(JSON.stringify({ success: false, error: 'You have already voted.' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const body = await request.json();
  const candidateId = body.candidateId;

  // Validate candidate
  if (!CANDIDATES.find(c => c.id === candidateId)) {
    return new Response(JSON.stringify({ success: false, error: 'Invalid candidate.' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Get current counts
  const countsRaw = await env.VOTING_KV.get('vote_counts');
  const voteCounts = countsRaw ? JSON.parse(countsRaw) : {};

  // Increment vote
  voteCounts[candidateId] = (voteCounts[candidateId] || 0) + 1;

  // Save updated counts
  await env.VOTING_KV.put('vote_counts', JSON.stringify(voteCounts));

  // Mark voter as having voted
  // We store metadata in the KV entry to allow listing votes without fetching values
  await env.VOTING_KV.put(`voted:${voterId}`, JSON.stringify({
    candidateId,
    votedAt: new Date().toISOString()
  }), {
    metadata: {
      candidateId,
      votedAt: new Date().toISOString()
    }
  });

  return new Response(JSON.stringify({ success: true, voteCounts }), {
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': `voter_id=${voterId}; Path=/; Max-Age=31536000; SameSite=Strict`
    }
  });
}

// ADMIN API ROUTES

// Admin Auth Check
if (url.pathname === '/api/admin/auth' && request.method === 'POST') {
  const body = await request.json();
  if (body.username === ADMIN_USERNAME && body.password === ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  return new Response('Unauthorized', { status: 401 });
}

// Admin Data List
if (url.pathname === '/api/admin/votes') {
  const auth = request.headers.get('x-admin-password');
  if (auth !== ADMIN_PASSWORD) return new Response('Unauthorized', { status: 401 });

  // List all votes (metadata only)
  const votes = [];
  let cursor = null;

  do {
    const list = await env.VOTING_KV.list({ prefix: 'voted:', cursor });
    votes.push(...list.keys.map(k => k.metadata).filter(Boolean)); // Filter out null metadata if old data exists
    cursor = list.list_complete ? null : list.cursor;
  } while (cursor);

  // Sort by time desc
  votes.sort((a, b) => new Date(b.votedAt) - new Date(a.votedAt));
  return new Response(JSON.stringify({ votes, counts, candidates: CANDIDATES }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// Admin Add Candidate
if (url.pathname === '/api/admin/candidates' && request.method === 'POST') {
  const auth = request.headers.get('x-admin-password');
  if (auth !== ADMIN_PASSWORD) return new Response('Unauthorized', { status: 401 });

  const body = await request.json();
  if (!body.name || !body.position) {
    return new Response(JSON.stringify({ success: false, error: 'Missing fields' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const newId = 'candidate_' + Date.now();
  const newCandidate = { id: newId, name: body.name, position: body.position };

  const currentCandidates = await getCandidates(env);
  currentCandidates.push(newCandidate);

  await env.VOTING_KV.put('candidates', JSON.stringify(currentCandidates));

  return new Response(JSON.stringify({ success: true, candidates: currentCandidates }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// Admin Reset
if (url.pathname === '/api/admin/reset' && request.method === 'POST') {
  const auth = request.headers.get('x-admin-password');
  if (auth !== ADMIN_PASSWORD) return new Response('Unauthorized', { status: 401 });

  // Delete all votes
  let cursor = null;
  do {
    const list = await env.VOTING_KV.list({ prefix: 'voted:', cursor });
    // KV doesn't support bulk delete, so we do it concurrently
    await Promise.all(list.keys.map(key => env.VOTING_KV.delete(key.name)));
    cursor = list.list_complete ? null : list.cursor;
  } while (cursor);

  // Reset counts
  await env.VOTING_KV.delete('vote_counts');

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// Serve Admin UI
if (url.pathname === '/admin') {
  return new Response(renderAdminPage(CANDIDATES), {
    headers: { 'Content-Type': 'text/html' }
  });
}

// Serve the HTML page
return new Response(renderVotingPage(CANDIDATES), {
  headers: {
    'Content-Type': 'text/html',
    'Set-Cookie': `voter_id=${voterId}; Path=/; Max-Age=31536000; SameSite=Strict`
  }
});
  }
};
