/* Snow word atlas. Geometry, lexemes and sources are kept in editable data files. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const anchors = {
    eng:[-1.6,52.2],sco:[-3,56.4],deu:[10.4,51],nld:[5.1,52.1],fry:[5.7,53.15],ltz:[6.1,49.8],
    dan:[10,56],swe:[15.4,61.5],nor:[7.6,61.5],isl:[-18.8,65],fao:[-6.9,62.1],
    spa:[-4,39.3],por:[-8.1,39.6],glg:[-7.8,42.7],cat:[1.3,41.5],oci:[2.3,44.1],fra:[2.2,47.4],
    ita:[12.7,42.6],ron:[25.1,45.8],scn:[14.2,37.6],srd:[9,40],vec:[12.2,45.6],fur:[13.1,46.2],roh:[9.6,46.7],ast:[-5.8,43.2],arg:[-.2,42.6],
    rus:[43,57.5],ukr:[31,49.2],bel:[28.4,53.5],pol:[19.2,52.2],ces:[15.5,49.9],slk:[19.5,48.8],
    slv:[14.6,46.1],hrv:[16,45.3],srp:[21,43.9],bos:[17.8,44],bul:[25.2,42.7],mkd:[21.7,41.6],hsb:[14.4,51.3],csb:[18,54.1],
    lit:[24,55.2],lav:[25,57],gle:[-8.7,53.2],gla:[-5.7,57.1],cym:[-3.8,52.3],bre:[-3.5,48.1],glv:[-4.53,54.2],cor:[-4.9,50.3],
    ell:[23.1,39],hye:[44.9,40.3],sqi:[20,41.4],pes:[53.7,32.5],kmr:[42.5,37.7],oss:[44.2,42.9],
    hun:[19.3,47.3],fin:[26,64.6],est:[25.5,58.7],sme:[23.4,69.1],krl:[32,64],vep:[34.9,61.2],mhr:[48.1,56.6],udm:[53,57.2],
    eus:[-1.8,43.05],arb:[2,32.8],heb:[35.1,31.7],mlt:[14.4,35.9],ary:[-6.7,32.9],arz:[30.8,30.4],
    tur:[33.7,39],aze:[48.1,40.2],kaz:[62,48],tat:[49.5,55.2],bak:[56.3,54.3],crh:[34.1,45.2],kir:[73,41.5],uzb:[64.5,40.8],
    kat:[43.2,42.1],kab:[4.7,36.4],zgh:[-5.3,31.6],che:[45.6,43.2],hbs:[18.6,44],dsb:[14.2,51.8],aeb:[9.5,34.5],tzm:[-4.4,32.5],shi:[-8,30.5]
  };
  const priority = ['eng','oci','eus','cat','spa','fra','deu','ita','pol','rus','ukr','swe','fin','nor','hun','ron','tur','kaz','ary','arz','arb','ell','hye','kat','heb','aze','por','glg','gle','gla','cym','bre','isl','dan','nld','bel','lit','lav','est','bul','sqi','srp','ces','slk','sme','kmr','kab','zgh'];
  const labelOffsets={eus:[-62,-2],oci:[8,-5],cat:[0,6]};
  const branchPalette = {'Germanic':'#629bb5','Romance':'#d49a72','Slavic':'#9d9ac4','Baltic':'#82a798','Celtic':'#b2b875','Uralic':'#d9bc60','Semitic':'#c492a8','Turkic':'#77acaa','Kartvelian':'#a28aab','Berber':'#c8a175','Basque':'#b57b80','Hellenic':'#abaf78','Armenian':'#b4a476','Albanian':'#c9ae6a','Iranian':'#9bafa4'};
  let data, geoMeta, languages, roots, features, countries, byId, byRoot, areas, labels, projection, path, svg, world, borderLayer;
  let selected='eng', activeRoot=null, searchTerm='', transform, opacity=.68, mode='root', storyIndex=-1, storyTimer=null, lastOverlaps=[];
  const missing = new Set();
  const stories = [
    {id:'eng',caption:'One ancient root, many relatives. English snow, Spanish nieve and Russian снег belong to the same Indo-European snow cognate set.'},
    {id:'eng',caption:'The Germanic route: follow reconstructed Proto-Germanic forms through Old English to snow. Asterisks mark reconstructed forms.'},
    {id:'spa',caption:'The Latin route: Latin nix, with the stem niv-, leads to Spanish nieve. Catalan neu, Occitan nèu and French neige are relatives.'},
    {id:'rus',caption:'The Slavic route: Russian снег, Polish śnieg and Czech sníh continue the same ancient snow root, despite different spellings and scripts.'},
    {id:'ell',caption:'Different roots inside one family: Greek χιόνι follows the Indo-European winter/snow set, rather than the root behind English snow.'},
    {id:'hun',caption:'Different roots inside Uralic too: Hungarian hó and Finnish lumi belong to different inherited word sets. Family membership alone does not determine colour.'},
    {id:'arb',caption:'Beyond Indo-European: Arabic ثلج and Hebrew שלג belong to a Semitic snow set. Open each entry for its form, transcription and source.'},
    {id:'eus',caption:'A language crosses a state boundary: Basque elur has its own mapped area on both sides of the Pyrenees. Its deeper origin is not asserted here.'}
  ];
  function rootOf(l) {return byRoot.get(l.root) || byRoot.get(l.group) || {id:l.root,label:l.root || 'Unresolved',form:'',color:'#a4a9ab',description:'Deeper origin is not asserted.'};}
  function branch(l) {
    const value = l.branch || l.family || '';
    return Object.keys(branchPalette).find(b=>value.toLowerCase().includes(b.toLowerCase())) || Object.keys(branchPalette).find(b=>l.family.toLowerCase().includes(b.toLowerCase())) || value;
  }
  function originKey(l) {return mode==='root'?rootOf(l).id:branch(l);}
  function color(l) {return mode==='root' ? rootOf(l).color : branchPalette[branch(l)] || '#a4a9ab';}
  function link(s) {return `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title || 'Lexical source')} ↗</a>`;}
  function inRing(point, ring) {
    let hit=false; const [x,y]=point;
    for(let i=0,j=ring.length-1;i<ring.length;j=i++) {
      const [xi,yi]=ring[i], [xj,yj]=ring[j];
      if(((yi>y)!==(yj>y)) && x < (xj-xi)*(y-yi)/(yj-yi)+xi) hit=!hit;
    }
    return hit;
  }
  function contains(feature, point) {
    const g=feature.geometry; if(!g) return false;
    const polys=g.type==='MultiPolygon'?g.coordinates:g.type==='Polygon'?[g.coordinates]:[];
    return polys.some(p=>inRing(point,p[0]) && !p.slice(1).some(h=>inRing(point,h)));
  }
  function normalizeGeometry(feature) {
    // GeoJSON uses right-hand winding; D3's spherical paths need small exteriors clockwise.
    const geo=feature.geometry;
    if(!geo) return feature;
    const polys=geo.type==='Polygon'?[geo.coordinates]:geo.type==='MultiPolygon'?geo.coordinates:[];
    polys.forEach(p=>p.forEach((ring,i)=>{
      const a=d3.polygonArea(ring);
      if((i===0 && a<0)||(i>0 && a>0)) ring.reverse();
    }));
    return feature;
  }
  function territoryId(f) {return f.properties.id || f.properties.iso || f.properties.iso6393;}
  function labelAnchor(l) {
    if(anchors[l.id]) return projection(anchors[l.id]);
    const f=features.filter(f=>territoryId(f)===l.id).sort((a,b)=>path.area(b)-path.area(a))[0];
    return f?.properties.label ? projection(f.properties.label) : f?path.centroid(f):null;
  }
  function labelPosition(l) {const p=labelAnchor(l),o=labelOffsets[l.id]||[0,0];return p?[p[0]+o[0]/transform.k,p[1]+o[1]/transform.k]:null;}
  function updateLabels() {
    if(!labels) return;
    const k=transform.k, occupied=[];
    const candidates=languages.filter(l=>!missing.has(l.id)).map(l=>({l,p:labelPosition(l)})).filter(d=>d.p && d.p.every(Number.isFinite));
    candidates.sort((a,b)=>(a.l.id===selected?-1000:priority.indexOf(a.l.id)<0?500:priority.indexOf(a.l.id))-(b.l.id===selected?-1000:priority.indexOf(b.l.id)<0?500:priority.indexOf(b.l.id)));
    const visible=new Set();
    for(const {l,p} of candidates) {
      if(activeRoot && originKey(l)!==activeRoot && l.id!==selected) continue;
      if(searchTerm && !`${l.name} ${l.word} ${l.romanization||''} ${l.id}`.toLowerCase().includes(searchTerm) && l.id!==selected) continue;
      const [x,y]=transform.apply(p), size=l.id===selected?26:priority.includes(l.id)?22:18;
      if(x<18||x>1182||y<30||y>880) continue;
      const width=Math.max(l.word.length*size*.55,l.name.length*7.5)*.94, h=34;
      const box=[x-width/2-4,y-h/2-4,x+width/2+4,y+h/2+4];
      if(l.id!==selected && occupied.some(b=>b[0]<box[2]&&b[2]>box[0]&&b[1]<box[3]&&b[3]>box[1])) continue;
      occupied.push(box);visible.add(l.id);
    }
    labels.attr('display',l=>visible.has(l.id)?null:'none').attr('transform',l=>{
      const p=labelPosition(l)||[0,0]; return `translate(${p}) scale(${1/k})`;
    }).classed('selected',l=>l.id===selected);
    labels.select('.word-label').attr('font-size',l=>l.id===selected?26:priority.includes(l.id)?22:18);
  }
  function updateMap() {
    areas.attr('fill',f=>color(byId.get(territoryId(f))))
      .attr('fill-opacity',f=>{
        const l=byId.get(territoryId(f));
        if(activeRoot && originKey(l)!==activeRoot) return .1;
        if(searchTerm && !`${l.name} ${l.word} ${l.romanization||''} ${l.id}`.toLowerCase().includes(searchTerm)) return .12;
        return $('overlap-toggle')?.checked?opacity:.96;
      }).classed('selected',f=>territoryId(f)===selected)
      .attr('stroke',f=>territoryId(f)===selected?'#193e48':'#ffffff')
      .attr('stroke-width',f=>territoryId(f)===selected?1.6:.65);
    if(borderLayer) borderLayer.attr('display',$('borders-toggle')?.checked?null:'none');
    if(labels) labels.attr('visibility',$('labels-toggle')?.checked?'visible':'hidden');
    updateLabels();
  }
  function renderLegend() {
    document.querySelector('.legend-heading h2').textContent=mode==='root'?'Word-origin sets':'Language branches';
    document.querySelector('.legend-heading > span').textContent=mode==='root'?'Same colour, shared word history':'Family relationships, independent of this word';
    const present=mode==='root'?roots.filter(r=>languages.some(l=>rootOf(l).id===r.id)):[...new Set(languages.map(branch))].sort().map(b=>({id:b,label:b,form:'',color:branchPalette[b]||'#a4a9ab',description:'Language branch. This view groups languages, rather than word origins.'}));
    $('legend').innerHTML=present.map(r=>{
      const count=languages.filter(l=>mode==='root'?rootOf(l).id===r.id:branch(l)===r.id).length;
      return `<button class="root-item${activeRoot===r.id?' active':''}" data-root="${esc(r.id)}" aria-pressed="${activeRoot===r.id}" title="${esc(r.description)}"><span class="root-swatch" style="--swatch:${esc(r.color)};background:${esc(r.color)}"></span><span class="root-copy"><strong>${esc(r.form||r.label)}</strong>${r.form?`<small>${esc(r.label)}</small>`:''}</span><span class="root-count">${count}</span></button>`;
    }).join('');
    $('legend').querySelectorAll('[data-root]').forEach(b=>b.addEventListener('click',()=>{
      stopStory();const id=b.dataset.root;
      activeRoot=activeRoot===id?null:id;renderLegend();updateMap();$('story-caption').textContent=activeRoot?`${mode==='root'?byRoot.get(activeRoot)?.label:activeRoot}. Click this legend item again to show all areas.`:'Explore a word, or play the guided journey.';
    }));
    $('root-filters').innerHTML=mode==='root'?'<span class="section-label">THREE ROUTES FROM THE PIE SNOW ROOT</span><button data-route="eng">Germanic · *snaiwaz → snow</button><button data-route="spa">Latin · nix / nivem → nieve</button><button data-route="rus">Slavic · *sněgъ → снег</button>':'';
    $('root-filters').querySelectorAll('[data-route]').forEach(b=>b.addEventListener('click',()=>select(b.dataset.route)));
  }
  function renderOptions() {
    const list=languages.filter(l=>!searchTerm || `${l.name} ${l.native||''} ${l.word} ${l.romanization||''} ${l.id}`.toLowerCase().includes(searchTerm));
    $('language-select').innerHTML=list.length?list.map(l=>`<option value="${esc(l.id)}"${l.id===selected?' selected':''}>${esc(l.name)} · ${esc(l.word)}${missing.has(l.id)?' (no footprint)':''}</option>`).join(''):'<option value="">No matching language</option>';
  }
  function select(id,{fly=false,overlaps=null,story=false}={}) {
    if(!byId.has(id)) return;
    if(!story)stopStory();
    selected=id;const l=byId.get(id),r=rootOf(l);
    if(activeRoot && activeRoot!==originKey(l))activeRoot=null;
    lastOverlaps=overlaps||[];
    const chain=l.chain||[];
    const peers=languages.filter(p=>p.id!==id && rootOf(p).id===r.id);
    const selectedFeatures=features.filter(f=>territoryId(f)===id);
    const areaNotes=[...new Set(selectedFeatures.map(f=>f.properties.caveat).filter(Boolean))];
    const coverage=[...new Set(selectedFeatures.map(f=>f.properties.coverageType).filter(Boolean))];
    $('inspector').innerHTML=`<div class="inspector-kicker"><span style="background:${esc(r.color)}" class="tiny-swatch"></span>${esc(l.name)}${l.native && l.native!==l.name?` <span class="native-name">/ ${esc(l.native)}</span>`:''}</div>
      <h2 class="inspector-word" dir="auto">${esc(l.word)}</h2>
      ${l.romanization?`<p class="inspector-roman">${esc(l.romanization)}</p>`:''}
      <p class="inspector-family">${esc(l.family)}${l.branch && l.branch!==l.family?` · ${esc(l.branch)}`:''}</p>
      <div class="origin-summary"><span class="section-label">WORD ORIGIN</span><strong>${esc(r.form||r.label)}</strong><p>${esc(r.description||'')}</p></div>
      <div class="etymology-chain"><span class="section-label">THE ROUTE TO ${esc(l.word.toUpperCase())}</span>${chain.map((s,i)=>`<div class="chain-step"><i class="chain-dot" style="--root-color:${esc(r.color)}"></i><div><span class="chain-label">${esc(s.label||s.language||'')}</span><strong class="chain-form" dir="auto">${esc(s.form)}</strong>${s.note?`<small>${esc(s.note)}</small>`:''}</div></div>${i<chain.length-1?'<div class="chain-arrow">↓</div>':''}`).join('')}</div>
      ${l.notes?`<p class="inspector-note">${esc(Array.isArray(l.notes)?l.notes.join(' '):l.notes)}</p>`:''}
      ${missing.has(id)?'<p class="notice">This word is included in the lexicon, but no matching language footprint is available in this map extract.</p>':`<div class="geometry-note"><span class="section-label">ABOUT THIS MAPPED AREA</span>${coverage.length?`<strong>${esc(coverage.join(' · '))}</strong><br>`:''}Digitized source footprint; not a claim of exclusive use.${areaNotes.map(n=>`<p>${esc(n)}</p>`).join('')}</div>`}
      ${lastOverlaps.filter(p=>p!==id).length?`<div class="overlap-languages"><span class="section-label">ALSO MAPPED AT THIS POINT</span><div>${lastOverlaps.filter(p=>p!==id).map(p=>`<button class="chip" data-language="${esc(p)}">${esc(byId.get(p)?.name||p)}</button>`).join('')}</div></div>`:''}
      ${peers.length?`<div class="cognates"><span class="section-label">SAME WORD-ORIGIN SET · ${peers.length} MORE</span><div>${peers.slice(0,7).map(p=>`<button class="chip" data-language="${esc(p.id)}">${esc(p.word)} <small>${esc(p.name)}</small></button>`).join('')}</div></div>`:''}
      <div class="source-links"><span class="section-label">CHECK THE ENTRY</span>${(l.sources||[]).map(link).join('')}</div>`;
    $('inspector').querySelectorAll('[data-language]').forEach(b=>b.addEventListener('click',()=>select(b.dataset.language,{fly:true,overlaps:lastOverlaps})));
    $('language-select').value=id;
    renderLegend();updateMap();
    if(fly && !missing.has(id)) {
      const p=labelAnchor(l),k=priority.includes(id)?2:4;
      if(p)svg.transition().duration(matchMedia('(prefers-reduced-motion: reduce)').matches?0:700).call(zoom.transform,d3.zoomIdentity.translate(600-p[0]*k,450-p[1]*k).scale(k));
    }
    const url=new URL(location.href);url.hash=id;history.replaceState(null,'',url);
  }
  function stopStory() {
    clearTimeout(storyTimer);storyTimer=null;
    if($('play')){$('play').textContent='▶ Play the story';$('play').setAttribute('aria-pressed','false');}
  }
  function storyStep() {
    const s=stories[storyIndex];
    if(!s){stopStory();storyIndex=-1;return;}
    searchTerm='';$('search').value='';activeRoot=rootOf(byId.get(s.id)).id;
    select(s.id,{story:true});
    $('story-caption').textContent=s.caption;
    $('story-progress').firstElementChild.style.width=`${(storyIndex+1)/stories.length*100}%`;
    $('story-progress').setAttribute('aria-valuenow',String(Math.round((storyIndex+1)/stories.length*100)));
    $('play').textContent='Ⅱ Pause story';$('play').setAttribute('aria-pressed','true');
    storyTimer=setTimeout(()=>{storyIndex++;storyStep();},6500);
  }
  function sourceModal() {
    const meta=data.methodology;
    $('sources-content').innerHTML=`<p>This map compares selected words for snow and their histories. It is not an exhaustive census of languages, dialects or synonyms.</p>
      <h3>Mapped language areas</h3><p>Asher, R. E. & Christopher J. Moseley (eds.). 2007. <em>Atlas of the World's Languages</em>, second edition. Routledge. Speaker-area polygons digitized and published by <a href="https://github.com/glottography/asher2007world" target="_blank" rel="noopener">Glottography</a>, contemporary dataset, CC BY 4.0. Cropped and simplified for this atlas; attribution and extraction details are in <a href="./data/geometry-sources.json" target="_blank">geometry-sources.json</a>.</p>
      <p>Specific omissions are supplemented by the DiACL/TITUS Polygon Archive (Carling & Gippert 2025; traditional footprints, often a 1750 reference) and Rantanen et al. (2021 dataset, 2022 methods paper; early twentieth-century traditional Uralic areas), through Glottography under CC BY 4.0. Such areas are explicitly identified in each language's detail panel. They are not contemporary language-use estimates.</p>
      <p>Additional published language-area datasets fill specific omissions in the main atlas. The full source list and transformations are recorded in <a href="./data/geometry-sources.json" target="_blank">geometry-sources.json</a>. ${esc(geoMeta?.summary||'')}</p>
      <p>These are generalized source-era footprints, not measured 2026 prevalence. They can overlap, omit urban communities and miss small enclaves. A filled area does not imply everyone there uses that language. Standardized words are attached to matching mapped varieties; a macrolanguage label is identified in the data. Unmatched areas remain neutral. The Arabic standard-reference word is shown over mapped Arabic varieties where no separate vernacular entry is supplied.</p>
      <p>Natural Earth 1:50m administrative geometry supplies geographic context under its <a href="https://www.naturalearthdata.com/about/terms-of-use/" target="_blank" rel="noopener">public-domain terms</a>. Country lines and names do not define the language areas.</p>
      <h3>What the colours mean</h3><p>In word-origin mode, matching colours identify an asserted shared etymological set, not similar spelling or a shared language family. Related branches can be compared in the separate branch view. Where deeper origin is uncertain, the grouping stops at the defensible level.</p>
      <p>An asterisk (*) marks a reconstructed form. PIE forms have several conventional spellings and inflected variants; the map uses *sneygʷʰ- for the shared snow root. Intermediate steps are selected milestones, not every sound change. The story is an explanation of word relationships, not a dated migration animation.</p>
      <h3>Lexical sources and scope</h3><p>Entries link to the dictionaries or lexical resources used for each word and etymology. Wiktionary is a community-edited reference, not a substitute for a specialist historical dictionary. Uncertain analyses are marked in the entry notes. ${typeof meta==='string'?esc(meta):esc(meta?.description||'')}</p>
      <p>${languages.length} lexical entries; ${languages.length-missing.size} have matching footprints in this extract. ${missing.size?`Entries without footprints: ${languages.filter(l=>missing.has(l.id)).map(l=>esc(l.name)).join(', ')}.`:''}</p>
      <p><a href="./data/lexicon.json" download>Download editable lexical data</a> · <a href="./data/territories.geojson" download>Download language polygons</a> · <a href="./data/geometry-sources.json" download>Geometry provenance</a></p>
      <details><summary>All lexical entries and references</summary><div class="source-index">${languages.map(l=>`<p><strong>${esc(l.name)}: ${esc(l.word)}</strong><br>${(l.sources||[]).map(link).join(' · ')}</p>`).join('')}</div></details>`;
    $('sources-dialog').showModal();
  }
  function exportSvg() {
    const NS='http://www.w3.org/2000/svg',out=document.createElementNS(NS,'svg');
    out.setAttribute('xmlns',NS);out.setAttribute('width','1800');out.setAttribute('height','1880');out.setAttribute('viewBox','0 0 1500 1567');
    const add=(tag,attrs,text)=>{const e=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));if(text)e.textContent=text;out.append(e);return e;};
    add('rect',{width:1500,height:1567,fill:'#f5f4ee'});
    add('text',{x:40,y:65,fill:'#173e49','font-family':'Georgia,serif','font-size':44},'SNOW · A word across Europe');
    add('text',{x:42,y:104,fill:'#46616b','font-family':'Arial,sans-serif','font-size':17},'Language areas and selected word histories · Europe and its neighbours');
    const clone=$('map').cloneNode(true);clone.setAttribute('x','20');clone.setAttribute('y','130');clone.setAttribute('width','1460');clone.setAttribute('height','1095');clone.removeAttribute('role');
    const style=document.createElementNS(NS,'style');style.textContent='.graticule{fill:none;stroke:#b7ced1;stroke-width:.5;opacity:.5}.country-line{fill:none;stroke:#768e93;stroke-width:.6;stroke-dasharray:3 3;pointer-events:none}.word-label{fill:#153d47;paint-order:stroke;stroke:#f8f7f0;stroke-width:3;stroke-linejoin:round;font-family:Georgia,serif;font-weight:600}.language-label{fill:#395962;font:9px Arial,sans-serif;paint-order:stroke;stroke:#f8f7f0;stroke-width:2}.sea-label{fill:#6e969e;font:italic 15px Georgia,serif;letter-spacing:3px}.coastline{fill:#e8e8df;stroke:#b7c6c4;stroke-width:.65}.map-pin{fill:#173e49;stroke:white;stroke-width:1.5}';clone.prepend(style);out.append(clone);
    add('text',{x:42,y:1260,fill:'#173e49','font-family':'Arial,sans-serif','font-size':17,'font-weight':'bold'},mode==='root'?'WORD ORIGIN SETS':'LANGUAGE BRANCHES');
    const items=mode==='root'?roots.filter(r=>languages.some(l=>rootOf(l).id===r.id)):[...new Set(languages.map(branch))].sort().map(b=>({label:b,color:branchPalette[b]||'#a4a9ab'}));
    items.forEach((r,i)=>{const x=42+(i%4)*360,y=1290+Math.floor(i/4)*38;add('rect',{x,y:y-13,width:13,height:13,rx:3,fill:r.color});add('text',{x:x+22,y,fill:'#173e49','font-family':'Arial,sans-serif','font-size':13},`${r.form||''} ${r.label}`);});
    add('text',{x:42,y:1500,fill:'#53676c','font-family':'Arial,sans-serif','font-size':12},'Areas: Asher & Moseley 2007, Carling & Gippert 2025, Rantanen et al. / Glottography (CC BY 4.0). Geography: Natural Earth.');
    add('text',{x:42,y:1523,fill:'#53676c','font-family':'Arial,sans-serif','font-size':13},'Lexical sources: source-linked lexicon.json. * marks reconstruction. Overlaps and selected varieties; not a census of present-day language use.');
    add('text',{x:42,y:1546,fill:'#53676c','font-family':'Arial,sans-serif','font-size':12},'glottography.org · github.com/glottography/asher2007world · en.wiktionary.org · Snow Word Atlas');
    const blob=new Blob([new XMLSerializer().serializeToString(out)],{type:'image/svg+xml;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='snow-word-atlas.svg';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  let zoom;
  async function init() {
    if(!window.d3)throw new Error('The local map library did not load.');
    [data,features,countries,geoMeta]=await Promise.all(['lexicon.json','territories.geojson','countries.geojson','geometry-sources.json'].map(async f=>{const r=await fetch(`./data/${f}`);if(!r.ok)throw new Error(`Cannot load ${f} (${r.status})`);return r.json();}));
    languages=data.languages;roots=data.roots;byId=new Map(languages.map(l=>[l.id,l]));byRoot=new Map(roots.map(r=>[r.id,r]));
    features=features.features.filter(f=>byId.has(territoryId(f))).map(normalizeGeometry);
    countries.features.forEach(normalizeGeometry);
    languages.forEach(l=>{if(!features.some(f=>territoryId(f)===l.id))missing.add(l.id);});
    svg=d3.select('#map');transform=d3.zoomIdentity;
    projection=d3.geoConicConformal().parallels([35,65]).rotate([-18,0]).center([0,48]).scale(860).translate([545,480]).clipExtent([[-1500,-1500],[2700,2400]]).precision(.2);
    path=d3.geoPath(projection);
    const defs=svg.append('defs');defs.append('clipPath').attr('id','map-clip').append('rect').attr('width',1200).attr('height',900);
    svg.append('rect').attr('width',1200).attr('height',900).attr('fill','#e7eff0');
    world=svg.append('g').attr('class','map-world');
    world.append('path').datum(d3.geoGraticule().step([10,10]).extent([[-40,20],[90,82]])()).attr('class','graticule').attr('d',path);
    world.append('g').selectAll('path').data(countries.features).join('path').attr('class','coastline').attr('d',path).attr('fill','#e8e8df').attr('stroke','#b7c6c4').attr('stroke-width',.65);
    // Small footprints are painted last so enclaves stay selectable.
    features.sort((a,b)=>path.area(b)-path.area(a));
    areas=world.append('g').attr('class','territory-layer').selectAll('path').data(features).join('path')
      .attr('class','language-area').attr('d',path).attr('vector-effect','non-scaling-stroke').attr('data-language',territoryId)
      .on('pointerenter',(event,f)=>{
        const l=byId.get(territoryId(f));$('tooltip').innerHTML=`<strong dir="auto">${esc(l.word)}</strong><span>${esc(l.name)} · ${esc(rootOf(l).form||rootOf(l).label)}</span>`;$('tooltip').hidden=false;
      }).on('pointermove',event=>{const box=$('map-stage').getBoundingClientRect();$('tooltip').style.left=Math.min(event.clientX-box.left+12,box.width-220)+'px';$('tooltip').style.top=Math.max(8,event.clientY-box.top-65)+'px';})
      .on('pointerleave',()=>{$('tooltip').hidden=true;})
      .on('click',(event,f)=>{
        event.stopPropagation();$('tooltip').hidden=true;const p=projection.invert(transform.invert(d3.pointer(event,$('map'))));
        const overlaps=[...new Set(features.filter(t=>contains(t,p)).map(territoryId))];select(territoryId(f),{overlaps});
      });
    borderLayer=world.append('g').attr('class','country-borders').attr('pointer-events','none');
    borderLayer.selectAll('path').data(countries.features).join('path').attr('class','country-line').attr('d',path).attr('fill','none').attr('stroke','#718d92').attr('stroke-width',.6).attr('stroke-dasharray','3 3').attr('vector-effect','non-scaling-stroke');
    const seas=[{p:[-20,46],name:'ATLANTIC OCEAN'},{p:[15,34.6],name:'MEDITERRANEAN SEA'},{p:[34.8,43],name:'BLACK SEA'},{p:[51.2,42],name:'CASPIAN SEA'}];
    world.append('g').attr('pointer-events','none').selectAll('text').data(seas).join('text').attr('class','sea-label').attr('text-anchor','middle').attr('transform',d=>`translate(${projection(d.p)})`).text(d=>d.name);
    labels=world.append('g').attr('class','label-layer').selectAll('g').data(languages.filter(l=>!missing.has(l.id))).join('g').attr('class','map-label').attr('data-language',l=>l.id).attr('role','button').attr('tabindex',0).attr('aria-label',l=>`${l.name}: ${l.word}. Show word history.`).style('cursor','pointer')
      .on('click',(e,l)=>{e.stopPropagation();select(l.id);}).on('keydown',(e,l)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select(l.id);}});
    labels.filter(l=>labelOffsets[l.id]).append('line').attr('class','label-leader').attr('x1',0).attr('y1',5).attr('x2',l=>-labelOffsets[l.id][0]).attr('y2',l=>-labelOffsets[l.id][1]).attr('stroke','#536f75').attr('stroke-width',.7);
    labels.append('text').attr('class','word-label').attr('text-anchor','middle').attr('y',0).attr('dir','auto').text(l=>l.word);
    labels.append('text').attr('class','language-label').attr('text-anchor','middle').attr('y',16).text(l=>l.id==='arb'?'Arabic · standard reference':l.name);
    zoom=d3.zoom().scaleExtent([1,12]).translateExtent([[-1200,-900],[2400,1800]]).extent([[0,0],[1200,900]]).on('zoom',event=>{transform=event.transform;world.attr('transform',transform);updateLabels();$('tooltip').hidden=true;});
    svg.call(zoom).on('dblclick.zoom',null);
    $('zoom-in').addEventListener('click',()=>svg.transition().duration(250).call(zoom.scaleBy,1.6));
    $('zoom-out').addEventListener('click',()=>svg.transition().duration(250).call(zoom.scaleBy,1/1.6));
    $('zoom-reset').addEventListener('click',()=>svg.transition().duration(500).call(zoom.transform,d3.zoomIdentity));
    ['labels-toggle','borders-toggle','overlap-toggle'].forEach(id=>$(id).addEventListener('change',updateMap));
    $('opacity').addEventListener('input',event=>{opacity=Number(event.target.value);updateMap();});
    $('color-mode').addEventListener('change',event=>{stopStory();mode=event.target.value;activeRoot=null;renderLegend();updateMap();});
    $('search').addEventListener('input',event=>{stopStory();activeRoot=null;searchTerm=event.target.value.trim().toLowerCase();renderOptions();renderLegend();updateMap();});
    $('search').addEventListener('keydown',event=>{if(event.key==='Enter' && $('language-select').value)select($('language-select').value,{fly:true});if(event.key==='Escape'){searchTerm='';$('search').value='';renderOptions();updateMap();}});
    $('language-select').addEventListener('change',event=>{if(event.target.value)select(event.target.value,{fly:true});});
    $('play').addEventListener('click',()=>{if(storyTimer){stopStory();return;}mode='root';$('color-mode').value='root';svg.transition().duration(450).call(zoom.transform,d3.zoomIdentity);storyIndex=storyIndex<0||storyIndex>=stories.length?0:storyIndex;storyStep();});
    $('reset-story').addEventListener('click',()=>{stopStory();storyIndex=-1;activeRoot=null;searchTerm='';$('search').value='';$('story-progress').firstElementChild.style.width='0%';$('story-progress').setAttribute('aria-valuenow','0');$('story-caption').textContent='Explore a word, or play the guided journey.';renderOptions();select('eng');svg.transition().duration(450).call(zoom.transform,d3.zoomIdentity);});
    $('sources-button').addEventListener('click',sourceModal);$('close-sources').addEventListener('click',()=>$('sources-dialog').close());
    $('sources-dialog').addEventListener('click',e=>{if(e.target===$('sources-dialog'))$('sources-dialog').close();});
    $('download-svg').addEventListener('click',exportSvg);
    renderOptions();select(byId.has(location.hash.slice(1))?location.hash.slice(1):'eng');
    $('status').textContent=`${languages.length} words · ${languages.length-missing.size} mapped languages · ${roots.length} origin sets`;
    document.querySelectorAll('.map-loading').forEach(el=>el.remove());
    window.snowAtlas={languages,roots,features,missing:[...missing],select,exportSvg,projection,get selected(){return selected;},get transform(){return transform;}};
  }
  init().catch(error=>{console.error(error);$('status').textContent='Map could not load';$('inspector').innerHTML=`<p class="notice">${esc(error.message)}. Open the atlas through its local launcher or hosted website so the data files can load.</p>`;});
})();
