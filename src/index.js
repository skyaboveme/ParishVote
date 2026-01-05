const CANDIDATES = [
  { id: 'candidate_1', name: 'Sharon Forester', position: 'Parish Council' },
  { id: 'candidate_2', name: 'Neil Dusek', position: 'Parish Council' },
  { id: 'candidate_3', name: 'Tina Seidel', position: 'Parish Council' },
  { id: 'candidate_4', name: 'Brian Waneck', position: 'Parish Council' },
  { id: 'candidate_5', name: 'Jodi Pruitt', position: 'Parish Council' },
  { id: 'candidate_6', name: 'Deana Seidel', position: 'Parish Council' },
  { id: 'candidate_7', name: 'Micheal Goertz', position: 'Parish Council' },
];

const HTML_PAGE = `<!DOCTYPE html>
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
      </div>
    </div>
  </div>

  <script>
    const CANDIDATES = ${JSON.stringify(CANDIDATES)};
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
          <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center border-gray-300" id="radio-\${candidate.id}"></div>
          <div>
            <div class="font-medium text-gray-900">\${candidate.name}</div>
            <div class="text-sm text-gray-500">\${candidate.position}</div>
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
          <button onclick="showConfirm()" id="continue-btn" class="\${selectedCandidate ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl' : 'bg-gray-300 text-gray-500 cursor-not-allowed'} w-full py-4 rounded-xl font-semibold text-lg transition-all" \${selectedCandidate ? '' : 'disabled'}>
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
                You are voting for <strong>\${candidateName}</strong>. This action cannot be undone.
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
            <span class="text-sm text-gray-500">\${totalVotes} total votes</span>
          </div>
          <div class="space-y-4">
      \`;
      
      CANDIDATES.forEach(candidate => {
        const votes = voteCounts[candidate.id] || 0;
        const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
        
        resultsHtml += \`
          <div class="relative">
            <div class="flex items-center justify-between mb-1">
              <span class="font-medium text-gray-900">\${candidate.name}</span>
              <span class="text-sm text-gray-600">\${votes} votes (\${percentage}%)</span>
            </div>
            <div class="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500" style="width: \${percentage}%"></div>
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
</html>`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Get voter ID from cookie or create new one
    const cookies = request.headers.get('Cookie') || '';
    let voterId = cookies.match(/voter_id=([^;]+)/)?.[1];
    
    if (!voterId) {
      voterId = crypto.randomUUID();
    }

    // API: Get status
    if (url.pathname === '/api/status') {
      const hasVoted = await env.VOTING_KV.get(`voted:${voterId}`);
      const countsRaw = await env.VOTING_KV.get('vote_counts');
      const voteCounts = countsRaw ? JSON.parse(countsRaw) : {};
      
      return new Response(JSON.stringify({ hasVoted: !!hasVoted, voteCounts }), {
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': `voter_id=${voterId}; Path=/; Max-Age=31536000; SameSite=Strict`
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
      await env.VOTING_KV.put(`voted:${voterId}`, JSON.stringify({
        candidateId,
        votedAt: new Date().toISOString()
      }));

      return new Response(JSON.stringify({ success: true, voteCounts }), {
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': `voter_id=${voterId}; Path=/; Max-Age=31536000; SameSite=Strict`
        }
      });
    }

    // Serve the HTML page
    return new Response(HTML_PAGE, {
      headers: {
        'Content-Type': 'text/html',
        'Set-Cookie': `voter_id=${voterId}; Path=/; Max-Age=31536000; SameSite=Strict`
      }
    });
  }
};
