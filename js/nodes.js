/**
 * nodes.js — Node-Based Grammar Synthesizer
 *
 * A visual drag-and-drop canvas where students wire together sentence
 * components to build German sentences. Inspired by ComfyUI / Blender nodes.
 *
 * Node types & colors:
 *   PRONOUN  (Subject)  — Purple    #a855f7
 *   NOUN                — Neon Pink #ff2d78
 *   VERB                — Cyan      #00f5ff
 *   ARTICLE             — Yellow    #ffe600
 *   OUTPUT              — Green     #00ff88
 *
 * Architecture:
 *   _graph.nodes[]       — array of node objects
 *   _graph.connections[] — array of { fromNodeId, fromPort, toNodeId, toPort }
 *   The SVG layer renders wires; DOM nodes are absolutely positioned divs.
 */

const Nodes = (() => {

  // ── Node type definitions ───────────────────────────────────────────────────
  const NODE_DEFS = {
    pronoun: {
      label: 'Pronoun',
      color: '#a855f7',
      icon: '👤',
      description: 'Subject pronoun (ich, du, er…)',
      outputs: [{ id: 'subject', label: 'Subject', color: '#a855f7' }],
      inputs:  [],
      wordFilter: w => w.type === 'pronoun',
    },
    noun: {
      label: 'Noun',
      color: '#ff2d78',
      icon: '📦',
      description: 'A German noun with gender',
      outputs: [{ id: 'noun', label: 'Noun', color: '#ff2d78' }],
      inputs:  [],
      wordFilter: w => w.type === 'noun',
    },
    verb: {
      label: 'Verb',
      color: '#00f5ff',
      icon: '⚙️',
      description: 'Verb processor — conjugates by subject',
      inputs:  [{ id: 'subject', label: 'Subject', color: '#a855f7' }],
      outputs: [{ id: 'verb', label: 'Verb Out', color: '#00f5ff' }],
      wordFilter: w => w.type === 'verb',
    },
    article: {
      label: 'Article',
      color: '#ffe600',
      icon: '🏷️',
      description: 'Applies der/die/das or ein/eine by case',
      inputs:  [{ id: 'noun', label: 'Noun In', color: '#ff2d78' }],
      outputs: [{ id: 'modified_noun', label: 'Modified Noun', color: '#ffe600' }],
      wordFilter: null, // article handled internally
    },
    output: {
      label: 'Sentence',
      color: '#00ff88',
      icon: '📝',
      description: 'Assembles nodes into a German sentence',
      inputs: [
        { id: 'verb',          label: 'Verb',          color: '#00f5ff' },
        { id: 'modified_noun', label: 'Object',        color: '#ffe600' },
      ],
      outputs: [],
      wordFilter: null,
    },
  };

  const CASES = ['Nominative', 'Accusative'];
  const ARTICLE_MAP = {
    Nominative: { der: 'der', die: 'die', das: 'das' },
    Accusative: { der: 'den', die: 'die', das: 'das' },
  };

  // ── Graph state ─────────────────────────────────────────────────────────────
  let _graph = { nodes: [], connections: [] };
  let _nodeId = 0;

  // ── Drag state ──────────────────────────────────────────────────────────────
  let _dragging    = null;   // { nodeId, offsetX, offsetY }
  let _connecting  = null;   // { fromNodeId, fromPort, x1, y1, tempLine }

  // ── DOM refs ────────────────────────────────────────────────────────────────
  let _canvas  = null;
  let _svg     = null;

  // ── Public API ──────────────────────────────────────────────────────────────

  /** Called by App.setView('nodes') */
  function init() {
    _canvas = document.getElementById('node-canvas');
    _svg    = document.getElementById('node-svg');
    if (!_canvas || !_svg) return;

    // Clear canvas if it's a fresh load (but keep existing graph)
    if (_graph.nodes.length === 0) {
      _canvas.innerHTML = '';
      _svg.innerHTML    = '<defs><marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="rgba(255,255,255,0.4)"/></marker></defs>';
    } else {
      _fullRedraw();
    }

    _attachCanvasEvents();
  }

  /** Add a node of the given type to the canvas */
  function addNode(type) {
    Audio.play('click');
    const def  = NODE_DEFS[type];
    if (!def)  return;

    const node = {
      id:       `node-${_nodeId++}`,
      type,
      x:        120 + Math.random() * 300,
      y:        100 + Math.random() * 200,
      word:     null,     // selected vocabulary word
      caseMode: CASES[0], // for article nodes
    };
    _graph.nodes.push(node);
    _spawnNode(node);
  }

  /** Remove a node and its connections */
  function removeNode(nodeId) {
    _graph.nodes = _graph.nodes.filter(n => n.id !== nodeId);
    _graph.connections = _graph.connections.filter(
      c => c.fromNodeId !== nodeId && c.toNodeId !== nodeId
    );
    const el = document.getElementById(nodeId);
    if (el) el.remove();
    _redrawWires();
  }



  // ── Node DOM creation ───────────────────────────────────────────────────────

  function _spawnNode(node) {
    const def  = NODE_DEFS[node.type];
    const el   = document.createElement('div');
    el.id        = node.id;
    el.className = 'gnode';
    el.style.cssText = `left:${node.x}px; top:${node.y}px; --nc:${def.color}`;

    el.innerHTML = _buildNodeHTML(node, def);

    // Drag header
    const header = el.querySelector('.gnode-header');
    header.addEventListener('mousedown', e => _onDragStart(e, node.id));

    _canvas.appendChild(el);
    _attachPortEvents(el, node);
  }

  function _buildNodeHTML(node, def) {
    const wordOptions = _buildWordOptions(def);
    const wordSelector = wordOptions
      ? `<select class="gnode-select" onchange="Nodes._onWordChange('${node.id}', this.value)">
           <option value="">— select word —</option>
           ${wordOptions}
         </select>`
      : '';

    const caseSelector = node.type === 'article'
      ? `<select class="gnode-select" onchange="Nodes._onCaseChange('${node.id}', this.value)">
           ${CASES.map(c => `<option value="${c}">${c}</option>`).join('')}
         </select>
         <div class="gnode-article-preview" id="art-preview-${node.id}">—</div>`
      : '';

    const outputWord = node.type === 'output'
      ? `<div class="gnode-sentence-out" id="sentence-out-${node.id}">Wire nodes to build a sentence…</div>`
      : '';

    // Port markup
    const inputPorts  = (def.inputs  || []).map(p => _portHTML(p, 'input')).join('');
    const outputPorts = (def.outputs || []).map(p => _portHTML(p, 'output')).join('');

    return `
      <div class="gnode-header" style="background: linear-gradient(135deg, ${def.color}33, ${def.color}11)">
        <span class="gnode-icon">${def.icon}</span>
        <span class="gnode-type" style="color:${def.color}">${def.label}</span>
        <button class="gnode-del" onclick="Nodes.removeNode('${node.id}')" title="Remove">✕</button>
      </div>
      <div class="gnode-body">
        <div class="gnode-ports-in">${inputPorts}</div>
        ${wordSelector}
        ${caseSelector}
        ${outputWord}
        <div class="gnode-ports-out">${outputPorts}</div>
      </div>
    `;
  }

  function _portHTML(port, direction) {
    return `
      <div class="gnode-port-row ${direction === 'output' ? 'port-row-out' : ''}">
        ${direction === 'input' ? `<span class="port-label">${port.label}</span>` : ''}
        <div class="gnode-port port-${direction}"
             style="--pc:${port.color}"
             data-port="${port.id}"
             data-dir="${direction}"
             title="${port.label}">
        </div>
        ${direction === 'output' ? `<span class="port-label">${port.label}</span>` : ''}
      </div>
    `;
  }

  function _buildWordOptions(def) {
    if (!def.wordFilter) return null;
    return AppData.vocabulary
      .filter(def.wordFilter)
      .map(w => {
        const label = w.gender ? `${w.gender} ${w.word}` : w.word;
        return `<option value="${w.id}">${label} — ${w.translation}</option>`;
      })
      .join('');
  }

  // ── Word / Case change callbacks ────────────────────────────────────────────

  function _onWordChange(nodeId, wordId) {
    const node = _graph.nodes.find(n => n.id === nodeId);
    if (!node) return;
    node.word = AppData.vocabulary.find(w => w.id === wordId) || null;
    _updateArticlePreview(node.id);
    _updateOutputSentence();
    Audio.play('nodeConnect');
  }

  function _onCaseChange(nodeId, caseVal) {
    const node = _graph.nodes.find(n => n.id === nodeId);
    if (!node) return;
    node.caseMode = caseVal;
    _updateArticlePreview(nodeId);
    _updateOutputSentence();
  }

  // ── Port connectivity ───────────────────────────────────────────────────────

  function _attachPortEvents(el, node) {
    el.querySelectorAll('.gnode-port').forEach(portEl => {
      portEl.addEventListener('mousedown', e => {
        e.stopPropagation();
        const dir  = portEl.dataset.dir;
        const port = portEl.dataset.port;

        if (dir === 'output') {
          // Start a connection
          const rect = portEl.getBoundingClientRect();
          const cr   = _canvas.getBoundingClientRect();
          const x1   = rect.left + rect.width / 2 - cr.left;
          const y1   = rect.top  + rect.height / 2 - cr.top;

          // Draw a temp wire
          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path.setAttribute('class', 'wire wire-temp');
          path.setAttribute('stroke', NODE_DEFS[node.type].color);
          _svg.appendChild(path);

          _connecting = { fromNodeId: node.id, fromPort: port, x1, y1, path };
        } else if (dir === 'input' && _connecting) {
          // Complete the connection
          _completeConnection(node.id, port);
        }
      });
    });
  }

  function _completeConnection(toNodeId, toPort) {
    if (!_connecting) return;
    const { fromNodeId, fromPort, path } = _connecting;

    // Remove temp wire
    if (path) path.remove();
    _connecting = null;

    // Avoid self-loops
    if (fromNodeId === toNodeId) return;

    // Remove existing connection to this input port
    _graph.connections = _graph.connections.filter(
      c => !(c.toNodeId === toNodeId && c.toPort === toPort)
    );

    // Add new connection
    _graph.connections.push({ fromNodeId, fromPort, toNodeId, toPort });

    Audio.play('nodeConnect');
    _redrawWires();
    _updateOutputSentence();
  }

  function _attachCanvasEvents() {
    _canvas.addEventListener('mousemove', e => {
      const cr = _canvas.getBoundingClientRect();
      const mx = e.clientX - cr.left;
      const my = e.clientY - cr.top;

      if (_dragging) {
        const node = _graph.nodes.find(n => n.id === _dragging.nodeId);
        if (!node) return;
        // mx/my are already canvas-relative; offsetX/Y are node-relative to
        // the viewport, so we subtract cr.left/top to make them canvas-relative.
        const cr2 = _canvas.getBoundingClientRect();
        node.x = e.clientX - cr2.left - _dragging.offsetX;
        node.y = e.clientY - cr2.top  - _dragging.offsetY;
        const el = document.getElementById(node.id);
        if (el) { el.style.left = node.x + 'px'; el.style.top = node.y + 'px'; }
        _redrawWires();
      }

      if (_connecting && _connecting.path) {
        _drawTempWire(_connecting.x1, _connecting.y1, mx, my, _connecting.path);
      }
    });

    _canvas.addEventListener('mouseup', () => {
      _dragging = null;
      // Do NOT cancel _connecting here – the click-to-connect flow requires
      // that _connecting survives past the mouseup of the output-port click.
      // It is cancelled only when the user clicks empty canvas (see below)
      // or when a connection is successfully completed.
    });

    // Cancel connecting if clicking empty canvas
    _canvas.addEventListener('click', e => {
      if (e.target === _canvas && _connecting) {
        if (_connecting.path) _connecting.path.remove();
        _connecting = null;
      }
    });
  }

  function _onDragStart(e, nodeId) {
    e.preventDefault();
    // Cancel any pending connection when a drag starts
    if (_connecting) {
      if (_connecting.path) _connecting.path.remove();
      _connecting = null;
    }
    const node = _graph.nodes.find(n => n.id === nodeId);
    if (!node) return;
    const el   = document.getElementById(nodeId);
    const rect = el.getBoundingClientRect();
    // offsetX/Y = mouse position relative to the node's own top-left corner.
    // During mousemove we compute: node.x = (e.clientX - cr.left) - offsetX
    // which correctly preserves the grab point inside the node.
    _dragging  = {
      nodeId,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    };
    // Bring to front
    el.style.zIndex = Date.now();
  }

  // ── Wire rendering ──────────────────────────────────────────────────────────

  function _portPosition(nodeId, portId, direction) {
    const portEl = document.querySelector(
      `#${nodeId} [data-port="${portId}"][data-dir="${direction}"]`
    );
    if (!portEl) return null;
    const cr       = _canvas.getBoundingClientRect();
    const rect     = portEl.getBoundingClientRect();
    return {
      x: rect.left + rect.width  / 2 - cr.left,
      y: rect.top  + rect.height / 2 - cr.top,
    };
  }

  function _drawTempWire(x1, y1, x2, y2, pathEl) {
    const cp1x = x1 + Math.abs(x2 - x1) * 0.5;
    const cp2x = x2 - Math.abs(x2 - x1) * 0.5;
    pathEl.setAttribute('d', `M${x1},${y1} C${cp1x},${y1} ${cp2x},${y2} ${x2},${y2}`);
  }

  function _redrawWires() {
    // Remove all existing wires (but keep defs)
    Array.from(_svg.querySelectorAll('path.wire:not(.wire-temp)')).forEach(p => p.remove());

    _graph.connections.forEach(conn => {
      const fromDef  = NODE_DEFS[_graph.nodes.find(n => n.id === conn.fromNodeId)?.type];
      const p1       = _portPosition(conn.fromNodeId, conn.fromPort, 'output');
      const p2       = _portPosition(conn.toNodeId,   conn.toPort,   'input');
      if (!p1 || !p2 || !fromDef) return;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('class', 'wire');
      path.setAttribute('stroke', fromDef.color);
      path.setAttribute('marker-end', 'url(#arrowhead)');
      _drawTempWire(p1.x, p1.y, p2.x, p2.y, path);
      _svg.appendChild(path);
    });
  }

  // ── Sentence assembly ───────────────────────────────────────────────────────

  function _assembleSentence() {
    // Find output node
    const outNode = _graph.nodes.find(n => n.type === 'output');
    if (!outNode) return null;

    // Trace what's connected to the output node
    const verbConn         = _graph.connections.find(c => c.toNodeId === outNode.id && c.toPort === 'verb');
    const modNounConn      = _graph.connections.find(c => c.toNodeId === outNode.id && c.toPort === 'modified_noun');

    const verbNode         = verbConn    ? _graph.nodes.find(n => n.id === verbConn.fromNodeId)    : null;
    const articleNode      = modNounConn ? _graph.nodes.find(n => n.id === modNounConn.fromNodeId) : null;

    // Trace subject → verb
    let subjectNode = null;
    if (verbNode) {
      const subjConn = _graph.connections.find(c => c.toNodeId === verbNode.id && c.toPort === 'subject');
      if (subjConn) subjectNode = _graph.nodes.find(n => n.id === subjConn.fromNodeId);
    }

    // Trace noun → article
    let nounNode = null;
    if (articleNode) {
      const nounConn = _graph.connections.find(c => c.toNodeId === articleNode.id && c.toPort === 'noun');
      if (nounConn) nounNode = _graph.nodes.find(n => n.id === nounConn.fromNodeId);
    }

    // Assemble parts
    const parts = [];

    // Subject
    if (subjectNode?.word) parts.push(subjectNode.word.word);

    // Verb (conjugated if subject known)
    if (verbNode?.word) {
      const pronoun = subjectNode?.word?.word || 'er';
      const conj    = verbNode.word.conjugations?.[pronoun] || verbNode.word.word;
      parts.push(conj);
    }

    // Article + Noun (object)
    if (articleNode && nounNode?.word) {
      const gender  = nounNode.word.gender;
      const caseMap = ARTICLE_MAP[articleNode.caseMode || 'Nominative'] || ARTICLE_MAP.Nominative;
      const art     = caseMap[gender] || gender;
      parts.push(art);
      parts.push(nounNode.word.word);
    } else if (nounNode?.word) {
      parts.push(nounNode.word.word);
    }

    if (parts.length === 0) return null;

    // Capitalise first word, add period
    const sentence = parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
      + (parts.length > 1 ? ' ' + parts.slice(1).join(' ') : '') + '.';
    return sentence;
  }

  function _updateOutputSentence() {
    const outNode = _graph.nodes.find(n => n.type === 'output');
    if (!outNode) return;
    const el = document.getElementById(`sentence-out-${outNode.id}`);
    if (!el)  return;
    const s = _assembleSentence();
    el.textContent = s || 'Wire nodes to build a sentence…';
    if (s) el.classList.add('sentence-ready');
    else   el.classList.remove('sentence-ready');
  }

  function _updateArticlePreview(nodeId) {
    const node = _graph.nodes.find(n => n.id === nodeId);
    if (!node || node.type !== 'article') return;
    const el = document.getElementById(`art-preview-${nodeId}`);
    if (!el) return;

    // Find connected noun
    const nounConn = _graph.connections.find(c => c.toNodeId === nodeId && c.toPort === 'noun');
    const nounNode = nounConn ? _graph.nodes.find(n => n.id === nounConn.fromNodeId) : null;

    if (nounNode?.word?.gender) {
      const caseMap = ARTICLE_MAP[node.caseMode] || ARTICLE_MAP.Nominative;
      el.textContent = caseMap[nounNode.word.gender] + ' ' + nounNode.word.word;
    } else {
      el.textContent = '—';
    }
  }

  // ── Full redraw ─────────────────────────────────────────────────────────────

  function _fullRedraw() {
    _canvas.innerHTML = '';
    _svg.innerHTML    = '<defs><marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="rgba(255,255,255,0.4)"/></marker></defs>';
    _graph.nodes.forEach(n => _spawnNode(n));
    setTimeout(_redrawWires, 50);
  }



  // ── Clear canvas ────────────────────────────────────────────────────────────

  function clearAll() {
    _graph = { nodes: [], connections: [] };
    _nodeId = 0;
    if (_canvas) _canvas.innerHTML = '';
    if (_svg)    _svg.innerHTML = '<defs><marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="rgba(255,255,255,0.4)"/></marker></defs>';
    Audio.play('click');
  }

  return { init, addNode, removeNode, clearAll, _onWordChange, _onCaseChange };
})();
