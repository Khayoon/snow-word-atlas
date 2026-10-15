/* A print-first, flat linguistic poster. Data and provenance remain editable JSON. */
(() => {
  'use strict';
  const W=1800,H=1100, $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const NS='http://www.w3.org/2000/svg';
  const textMeasure=document.createElement('canvas').getContext('2d');
  function textWidth(text,size,weight=400,family='Georgia'){if(!textMeasure)return [...text].length*size*.57;textMeasure.font=`${weight} ${size}px ${family}`;return textMeasure.measureText(text).width;}
  function reading(l){return [...l.word].some(c=>/\p{L}/u.test(c)&&!/\p{Script=Latin}/u.test(c))?(l.mapRomanization||l.romanization||'').split(' · ')[0]:'';}
  const aliases={turk1304:'tuk',komi1268:'kpv',nene1249:'yrk',avar1256:'ava',darg1241:'dar',lezg1247:'lez',lakk1252:'lbe',ingu1240:'inh',kaba1278:'kbd',adyg1241:'ady',kara1465:'krc',kumy1244:'kum',kalm1243:'xal',east2304:'bal',nort2645:'lrc',sout2647:'luz',bakh1245:'bqi'};
  const anchors={
    eng:[-1.2,52.4],sco:[-2.8,56.4],deu:[10.4,51.2],nld:[5.2,52.1],fry:[5.5,53.25],ltz:[6.1,49.8],dan:[10,56.1],swe:[16,62],nor:[8,63],isl:[-19,65],fao:[-6.9,62.1],
    spa:[-3.7,39.2],por:[-8,39.4],glg:[-7.6,42.8],cat:[1.4,41.6],oci:[2.8,44.3],fra:[2.1,47.7],ita:[12.5,42.4],ron:[25,45.7],scn:[14.2,37.5],srd:[9,40.1],vec:[12.1,45.6],fur:[13.1,46.2],roh:[9.5,46.7],ast:[-5.8,43.3],arg:[-.1,42.6],
    rus:[40,61.6],ukr:[31,49],bel:[28.4,53.4],pol:[19.1,52],ces:[15.3,49.9],slk:[19.5,48.7],slv:[14.7,46.1],hbs:[18.7,44.3],bul:[25.2,42.7],mkd:[22.2,41.6],hsb:[14.4,51.3],dsb:[14.2,51.8],csb:[18,54.2],lit:[24,55.2],lav:[25,57],
    gle:[-8.4,53.5],gla:[-5.6,57.8],cym:[-3.8,52.3],bre:[-3.5,48.2],glv:[-4.53,54.2],cor:[-4.9,50.3],ell:[23.2,38.9],hye:[44.9,40.3],sqi:[19.7,41.2],pes:[55,32.1],kmr:[42,37.7],oss:[44.2,42.9],
    hun:[19.5,47.2],fin:[26,64.6],est:[25.5,58.7],sme:[23.5,69],krl:[32,64.9],vep:[34.9,61.2],mhr:[48.1,56.6],udm:[53,57.4],eus:[-1.8,43.05],
    arb:[8.8,28.9],apc:[37.3,34.7],acm:[44.1,32.6],heb:[35.1,31.7],mlt:[14.4,35.9],aeb:[9.4,34.3],arz:[29.8,27.9],tur:[33.4,39],aze:[48.2,40.3],kaz:[61,48.5],tat:[49.5,55.1],bak:[56.3,54.3],crh:[34.1,45.2],kir:[73,41.5],uzb:[64.5,40.8],
    kat:[43.1,42.1],kab:[4.8,36.4],tzm:[-4.3,32.8],shi:[-8.5,30.1],che:[45.6,43.25],tuk:[59.3,39.2],kpv:[53,64.9],yrk:[59,69],ava:[46.55,42.55],dar:[47.45,42.4],lez:[48.1,41.65],lbe:[47.05,42.05],inh:[45.05,43.15],kbd:[43.7,43.7],ady:[39.7,44.8],krc:[42.1,43.6],kum:[47.4,43.1],xal:[45.6,46.4],bal:[61,27.8],lrc:[48.6,33.5],luz:[51.1,30.9],bqi:[49.8,32.1],ckb:[45.6,35.6],kal:[-24.5,72.3]
  };
  const offsets={eus:[-43,-5],por:[-11,0],glg:[-29,-14],ast:[-8,-32],arg:[5,-23],cat:[9,9],oci:[2,-8],bre:[-18,-3],cym:[-31,2],cor:[-28,18],gla:[-20,-2],glv:[-43,0],fry:[-15,-24],nld:[-17,8],ltz:[-18,14],hsb:[12,-1],dsb:[16,-27],csb:[19,-9],roh:[-21,6],vec:[-2,14],fur:[21,-8],slv:[0,-2],hbs:[0,5],sqi:[-7,10],mkd:[4,11],mlt:[-13,19],heb:[-20,1],kat:[-11,-8],hye:[6,10],aze:[25,5],oss:[-9,-15],che:[18,-15],inh:[-20,-27],kbd:[-17,-34],krc:[-30,-17],ava:[29,-15],dar:[52,0],lbe:[11,26],lez:[42,21],kum:[51,-30],ady:[-31,-8]};
  const important=['eng','spa','fra','deu','ita','rus','ukr','pol','fin','swe','nor','tur','kaz','pes','arb','arz','tuk','kpv','yrk','cat','oci','eus','hun','ron','ell','hye','kat','bal','kmr','kal'];
  const localSizes={sqi:18,mkd:17,kat:20,hye:22,aze:20,oss:16,che:18,ava:16,dar:16,lez:18,lbe:15,inh:16,kbd:16,ady:16,krc:18,kum:17};
  const routeDefs=[
    {id:'snow-germanic',form:'*snaiwaz',label:'Germanic',color:'#96c8d4',example:'snow',gloss:'snow'},
    {id:'snow-latin',form:'nix · nivem',label:'Latin → Romance',color:'#e7b39f',example:'nieve'},
    {id:'snow-slavic',form:'*sně̑gъ',label:'Slavic',color:'#acb6d5',example:'снег',gloss:'snow'},
    {id:'snow-baltic',form:'*snáigas',label:'Baltic',color:'#c0ce95',example:'sniegas',gloss:'snow'},
    {id:'snow-goidelic',form:'snechtae',label:'Old Irish → Goidelic',color:'#9fc9b0',example:'sneachta',gloss:'snow'}
  ];
  const rootColors={'pie-snow':'#96c8d4','pie-winter':'#c9abd5','brythonic-ergh':'#b9cd8f','slavic-fall':'#dfc29b','albanian-fall':'#dcadaf','iranian-wafra':'#d8ad97','uralic-lome':'#e6cf87','uralic-kume':'#d9b66c','sami-muotte':'#a5c9ba','semitic-thalg':'#e8c69a','turkic-kar':'#b2d0ba','kartvelian-tow':'#bea1ca','basque-erur':'#dd9990','berber-adfel':'#e3b17f','nakh-lawa':'#bda8a0','norse-kaf':'#c6d9d8','ossetian-mit':'#c5bec9'};
  const branchColors={Germanic:'#96c8d4',Romance:'#e7b39f',Slavic:'#acb6d5',Baltic:'#c0ce95',Celtic:'#a5c49b',Uralic:'#e6cf87',Semitic:'#e8c69a',Turkic:'#b2d0ba',Kartvelian:'#bea1ca',Berber:'#e3b17f',Basque:'#dd9990',Hellenic:'#c9abd5',Armenian:'#baa8ce',Albanian:'#dcadaf',Iranian:'#d8ad97',Nakh:'#bda8a0',Circassian:'#9eb6bb',Mongolic:'#d9c59e',Eskimo:'#cadcdb'};
  let lex,metadata,coverage,lands,features,legendTitles,languages,byId,byRoot,svg,world,labelsLayer,legendLayer,basePaths,areaPaths,countryLines,projection,path,zoom,transform;
  let mode='routes',opacity=.90,labelScale=1,selected=null,search='',focused=null,exportBusy=false;
  const featureById=new Map(), labelPoints=new Map();
  function branch(l){
    // Prefer an exact, specific branch: "Balto-Slavic · Baltic" belongs to Baltic.
    const names=Object.keys(branchColors),parts=(l.branch||'').split('·').map(s=>s.trim()).reverse();
    const exact=parts.map(p=>names.find(k=>k.toLowerCase()===p.toLowerCase())).find(Boolean);
    const s=`${l.branch||''} ${l.family||''}`.toLowerCase();
    return exact||names.find(k=>s.includes(k.toLowerCase()))||l.branch||l.family;
  }
  function root(l){return byRoot.get(l.root)||{id:l.root,label:l.root,form:'',color:'#c5c6bf',description:'No deeper relationship is asserted.'};}
  function route(l){
    if(l.root!=='pie-snow')return root(l).id;
    const b=branch(l);return b==='Germanic'?'snow-germanic':b==='Romance'?'snow-latin':b==='Slavic'?'snow-slavic':b==='Baltic'?'snow-baltic':'snow-goidelic';
  }
  function key(l){return mode==='root'?root(l).id:mode==='branch'?branch(l):route(l);}
  function color(l){if(!l)return '#c5c6bf';if(mode==='branch')return branchColors[branch(l)]||root(l).color;return mode==='routes'&&l.root==='pie-snow'?routeDefs.find(r=>r.id===route(l)).color:rootColors[l.root]||root(l).color;}
  function idOf(f){return aliases[f.properties.id]||f.properties.id;}
  function normalize(f){const g=f.geometry;if(!g)return f;const ps=g.type==='Polygon'?[g.coordinates]:g.type==='MultiPolygon'?g.coordinates:[];ps.forEach(p=>p.forEach((r,i)=>{const a=d3.polygonArea(r);if((!i&&a<0)||(i&&a>0))r.reverse();}));return f;}
  function node(parent,tag,attrs={},text=''){const el=parent.append(tag);for(const [k,v]of Object.entries(attrs))el.attr(k,v);if(text!==undefined)el.text(text);return el;}
  function inRing([x,y],r){let inside=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const[a,b]=r[i],[c,d]=r[j];if((b>y)!==(d>y)&&x<(c-a)*(y-b)/(d-b)+a)inside=!inside;}return inside;}
  function contains(f,p){const g=f.geometry,ps=g.type==='Polygon'?[g.coordinates]:g.type==='MultiPolygon'?g.coordinates:[];return ps.some(poly=>inRing(p,poly[0])&&!poly.slice(1).some(r=>inRing(p,r)));}
  function anchorsFor(l){if(anchors[l.id])return anchors[l.id];const f=featureById.get(l.id)?.[0];if(f?.properties.label)return f.properties.label;const land=lands.find(f=>idOf(f)===l.id);return land?d3.geoCentroid(land):null;}
  function addText(parent,text,x,y,size=16,attrs={}){return node(parent,'text',{x,y,'font-family':'Georgia, Times New Roman, serif','font-size':size,fill:'#203b40',...attrs},text);}
  function legendShort(r){const names={'pie-winter':'Greek & Armenian','brythonic-ergh':'Brythonic','slavic-fall':'Romanian · Slavic loan','albanian-fall':'Albanian','iranian-wafra':'Iranian','ossetian-mit':'Ossetian','uralic-lome':'Finnic & Volgaic','uralic-kume':'Hungarian','sami-muotte':'Sámi','semitic-thalg':'Semitic','turkic-kar':'Turkic','kartvelian-tow':'Kartvelian','basque-erur':'Basque','berber-adfel':'Berber','nakh-lawa':'Nakh','norse-kaf':'Faroese','samoyedic-sira':'Nenets','avar-ghazu':'Avar','dargwa-dyahi':'Dargwa','lezgian-zhiv':'Lezgian','lak-markhhala':'Lak','circassian-wes':'Circassian','mongolic-casun':'Mongolic','greenlandic-aput':'Greenlandic'};return names[r.id]||r.label.replace(/ · snow.*$/,'');}
  function drawLegend(){
    legendLayer.selectAll('*').remove();
    const rows=mode==='branch'?[...new Set(languages.map(branch))].sort().map(b=>({id:b,form:'',label:b,color:branchColors[b]||'#c5c6bf'})):lex.roots.filter(r=>r.id!=='pie-snow').map(r=>({...r,label:legendShort(r),color:rootColors[r.id]||r.color}));
    const rowHeight=mode==='branch'?29:24;
    const start=mode==='routes'?214:mode==='root'?116:56;
    const panelHeight=start+rows.length*rowHeight+35;
    legendLayer.attr('transform','translate(34,168)');
    node(legendLayer,'rect',{width:306,height:panelHeight,fill:'#fbfaf4','fill-opacity':.97,stroke:'#cfcfc1','stroke-width':.8});
    const heading=legendTitles.titles[mode==='branch'?'branches':'etymology'];
    const headingGroup=node(legendLayer,'g',{'class':'legend-heading','aria-label':heading.text});
    node(headingGroup,'title',{},heading.text);
    // Font outlines keep the blackletter title identical in the browser, PNG and SVG.
    const headingScale=18/legendTitles.unitsPerEm;
    node(headingGroup,'path',{d:heading.path,transform:`translate(17,32) scale(${headingScale},${-headingScale})`,fill:'#203b40'});
    if(mode!=='branch'){
      addText(legendLayer,'*sneygʷʰ-',17,66,29);
      addText(legendLayer,'Shared Proto-Indo-European root · “to snow”',18,87,11,{'font-family':'Arial, sans-serif',fill:'#63706b'});
      if(mode==='routes')routeDefs.forEach((r,i)=>legendRow(r,111+i*20,12.5,true));
      else legendRow({id:'pie-snow',form:'',label:'Shared snow-root descendants',color:rootColors['pie-snow']},106,12.5,true);
    }
    let y=start;
    if(mode!=='branch'){node(legendLayer,'line',{x1:17,x2:289,y1:y-7,y2:y-7,stroke:'#d3d7ca','stroke-width':.7});addText(legendLayer,'OTHER WORD-ORIGIN SETS',17,y+10,9,{'font-family':'Arial, sans-serif','letter-spacing':1.1,'font-weight':700,fill:'#6b786e'});y+=27;}
    rows.forEach((r,i)=>legendRow(r,y+i*rowHeight,12.5,false));
    function legendRow(r,y,font,routeRow){
      const g=node(legendLayer,'g',{'class':'poster-legend-row',transform:`translate(17,${y})`,'data-key':r.id,role:'button',tabindex:0,'aria-label':`Highlight ${r.label}`});
      node(g,'rect',{x:-4,y:-12,width:280,height:20,fill:focused===r.id?'#e8eddf':'transparent'});
      node(g,'rect',{x:0,y:-8,width:11,height:11,fill:r.color,stroke:'#56726d','stroke-width':.2});
      const form=r.form&&r.form.length<27?r.form:r.form?.split(' / ')[0]||'';
      const base=`${r.label}  ${form}`.trim();
      const withGloss=r.gloss?`${base} · “${r.gloss}”`:base;
      // Keep the original panel, row count, line spacing and type size. Never wrap a legend entry.
      const concise=r.id==='pie-winter'?`${base} · “winter”`:base;
      const label=textWidth(withGloss,font)<=253?withGloss:textWidth(concise,font)<=253?concise:base;
      addText(g,label,19,2,font,{'font-family':'Georgia, Times New Roman, serif'});
      node(g,'title',{},r.gloss?`${base}: ${r.gloss}`:base);
      g.on('click',()=>{focused=focused===r.id?null:r.id;drawLegend();paint();}).on('keydown',e=>{if(e.key==='Enter'){focused=focused===r.id?null:r.id;drawLegend();paint();}});
    }
    // Used by collision placement, keeping every word clear of the legend.
    legendLayer.attr('data-height',panelHeight);
  }
  function labelLayout(){
    if(!labelsLayer)return;
    labelsLayer.selectAll('*').remove();labelPoints.clear();
    if(!$('labels-toggle').checked)return;
    const legendHeight=+legendLayer.attr('data-height')||800;
    const occupied=[[22,150,348,168+legendHeight+12],[30,17,470,143],[22,1041,1775,1090]];
    // Reserve the narrow Balkan placements before the automatic collision pass.
    const balkanOrder=['slv','hbs','sqi','mkd'];
    const rank=id=>balkanOrder.includes(id)?balkanOrder.indexOf(id)-10:important.includes(id)?important.indexOf(id):100;
    const list=languages.filter(l=>anchorsFor(l)).sort((a,b)=>rank(a.id)-rank(b.id));
    const candidates=[[0,0],[0,-20],[0,20],[-22,0],[22,0],[-29,-22],[29,-22],[-29,22],[29,22],[0,-40],[0,40],[-48,-15],[48,-15],[-48,20],[48,20],[-65,-30],[65,-30],[-65,30],[65,30],[0,-60],[0,60],[-80,0],[80,0],[-80,-50],[80,-50],[-80,50],[80,50],[0,-90],[0,90],[-105,0],[105,0]];
    for(const l of list){
      const a=anchorsFor(l);if(a[0]<-27||a[0]>68||a[1]<25||a[1]>75)continue;
      const raw=transform.apply(projection(a));
      if(raw[0]<345||raw[0]>1780||raw[1]<28||raw[1]>1022)continue;
      const sz=(localSizes[l.id]||(important.includes(l.id)?25:20))*labelScale;
      const text=l.word,roman=reading(l),romanSize=Math.max(9.5,sz*.51),romanOffset=Math.max(12,sz*.61),weight=important.includes(l.id)?600:400;
      const estimated=Math.max(23,textWidth(text,sz,weight),roman?textWidth(`(${roman})`,romanSize,400,'Arial'):0),height=sz*1.05;
      const base=offsets[l.id]||[0,0];
      let placed=null;
      for(const [dx,dy]of candidates){const x=raw[0]+base[0]+dx,y=raw[1]+base[1]+dy;
        const box=[x-estimated/2-4,y-height*.85-3,x+estimated/2+4,y+(roman?romanOffset+romanSize*.25:height*.25)+3];
        if(box[0]<350||box[2]>1775||box[1]<25||box[3]>1030)continue;
        if(occupied.some(b=>b[0]<box[2]&&b[2]>box[0]&&b[1]<box[3]&&b[3]>box[1]))continue;
        occupied.push(box);placed={x,y,raw,sz};break;
      }
      if(!placed)continue;
      const {x,y,sz:size}=placed;
      labelPoints.set(l.id,{x,y});
      const g=node(labelsLayer,'g',{'class':'word-mark','data-language':l.id,role:'button',tabindex:0,'aria-label':`${l.name}: ${l.word}`});
      const distance=Math.hypot(x-raw[0],y-raw[1]);
      if(distance>15){node(g,'line',{x1:raw[0],y1:raw[1],x2:x,y2:y-5,stroke:'#516b6d','stroke-width':.7,opacity:.65,'class':'label-leader'});node(g,'circle',{cx:raw[0],cy:raw[1],r:1.5,fill:'#536a68'});}
      addText(g,text,x,y,size,{'class':'word-label','text-anchor':'middle',direction:'ltr',style:`font-weight:${important.includes(l.id)?600:400}`,'paint-order':'stroke','stroke':'#faf9f2','stroke-width':2.1,'stroke-linejoin':'round'});
      if(roman)addText(g,`(${roman})`,x,y+romanOffset,romanSize,{'class':'reading-label','font-family':'Arial, sans-serif','text-anchor':'middle',direction:'ltr','font-weight':400,'paint-order':'stroke',stroke:'#faf9f2','stroke-width':1.4,'stroke-linejoin':'round',fill:'#38555b'});
      g.on('click',()=>showWord(l.id)).on('keydown',e=>{if(e.key==='Enter')showWord(l.id);});
      if((focused&&key(l)!==focused)||(search&&!matches(l)))g.attr('opacity',.22);
    }
  }
  function matches(l){return `${l.name} ${l.native||''} ${l.word} ${l.romanization||''} ${l.id}`.toLowerCase().includes(search);}
  function paint(){
    basePaths.attr('fill',f=>color(byId.get(idOf(f)))).attr('stroke',f=>color(byId.get(idOf(f))));
    areaPaths.attr('fill',f=>color(byId.get(idOf(f)))).attr('fill-opacity',f=>{
      const l=byId.get(idOf(f));return (focused&&key(l)!==focused)||(search&&!matches(l))?.12:$('overlap-toggle').checked?opacity:1;
    });
    if(focused||search)basePaths.attr('fill-opacity',f=>{const l=byId.get(idOf(f));return (focused&&key(l)!==focused)||(search&&!matches(l))?.25:1;});else basePaths.attr('fill-opacity',1);
    countryLines.attr('display',$('borders-toggle').checked?null:'none');labelLayout();
  }
  function showWord(id){
    const l=byId.get(id);if(!l)return;selected=id;
    const r=root(l),fs=featureById.get(id)||[],isMapped=fs.length>0,caveats=[...new Set(fs.map(f=>f.properties.caveat).filter(Boolean))];
    $('inspector').innerHTML=`<p class="inspector-kicker">${esc(l.name)}${l.native&&l.native!==l.name?` · ${esc(l.native)}`:''}</p><h2 class="inspector-word" dir="auto">${esc(l.word)}</h2>${l.romanization?`<p class="inspector-roman">${esc(l.romanization)}</p>`:''}<p class="inspector-family">${esc(l.family)} · ${esc(l.branch||'')}</p><p class="inspector-note">${esc(r.description)}</p><div class="etymology-chain">${(l.chain||[]).map(s=>`<div class="chain-step"><span class="chain-label">${esc(s.label)}</span><strong class="chain-form" dir="auto">${esc(s.form)}</strong></div>`).join('')}</div>${l.notes?`<p class="inspector-note">${esc(l.notes)}</p>`:''}<p class="geometry-note">${isMapped?'Published language-area geometry, over a continuous country reference layer.':'Word label at a representative location; no separate language-area polygon is asserted.'} ${caveats.map(esc).join(' ')}</p><div class="source-links">${(l.sources||[]).map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)} ↗</a>`).join('')}</div>`;
    $('language-select').value=id;$('word-dialog').showModal();
  }
  function populateLanguages(){const list=languages.filter(l=>!search||matches(l));$('language-select').innerHTML='<option value="">Inspect a word…</option>'+list.map(l=>`<option value="${esc(l.id)}">${esc(l.name)} · ${esc(l.word)}</option>`).join('');}
  function showSources(){
    $('sources-content').innerHTML=`<h3>A poster map, with continuous land coverage</h3><p>The main image uses a flat cylindrical projection and words-only labels. Its colours follow etymological routes by default: Germanic, Latin, Slavic, Baltic and Goidelic routes are grouped beneath the same Proto-Indo-European snow root in the legend. Shared-roots mode gives them one colour.</p><p>All land is coloured. Published minority-language polygons sit above complete Natural Earth land/country geometry. Gaps between speaker footprints use a selected country reference word; this is an explicit cartographic completion, not a new ethnic-boundary estimate or a claim of uniform language use. Thus northern Russia, Sinai, the Zagros and sparsely populated deserts are not left blank.</p><p>Some small varieties have a word label but no separate polygon. Leader lines connect crowded labels to their anchor. Asterisks mark reconstructed forms. Reconstructions and uncertain deeper histories are explained in individual entries.</p><h3>Geographic sources</h3><p>Asher & Moseley (2007), <em>Atlas of the World's Languages</em>, digitized by <a href="https://github.com/Glottography/asher2007world" target="_blank" rel="noopener">Glottography</a> (CC BY 4.0). Traditional-area supplements: <a href="https://github.com/Glottography/carling2025diacl" target="_blank" rel="noopener">DiACL/TITUS, Carling & Gippert 2025</a>, and <a href="https://github.com/Glottography/rantanen2021uralic" target="_blank" rel="noopener">Rantanen et al., Uralic database 2021</a> (CC BY 4.0). Specific supplements retain their source-epoch notes. Background: <a href="https://www.naturalearthdata.com/about/terms-of-use/" target="_blank" rel="noopener">Natural Earth, public domain</a>.</p><p>${languages.length} selected lexical entries; ${featureById.size} lexical joins to source polygons. Source claims are not a 2026 census. Where a source combines varieties, a representative form is used with notes.</p><h3>Download and edit</h3><p><a href="./data/lexicon.json" download>Lexicon and etymologies</a> · <a href="./data/territories.geojson" download>Language footprints</a> · <a href="./data/land-reference.geojson" download>Continuous land references</a> · <a href="./data/map-coverage.json" target="_blank">Coverage method and checks</a> · <a href="./data/geometry-sources.json" target="_blank">Geometry provenance</a></p><p>Lexical facts are primarily cross-checked against Wiktionary, plus the linked dictionaries named in each entry. Wiktionary is a community-edited resource under CC BY-SA 4.0. Unresolved histories are kept separate. All exports include brief attribution; full source links stay in the editable data.</p><p>PNG exports are ${$('export-size').value} pixels wide; SVG retains editable vector geometry and text. The controls and dialogs are excluded from the artwork.</p>`;
    $('sources-dialog').showModal();
  }
  const exportStyle=`.word-label{font-family:Georgia,'Times New Roman',serif;font-weight:400;fill:#203b40;paint-order:stroke;stroke:#faf9f2;stroke-width:2.1;stroke-linejoin:round;dominant-baseline:alphabetic;letter-spacing:0;stroke-opacity:1}.reading-label{font-family:Arial,sans-serif;font-weight:400;fill:#38555b;paint-order:stroke;stroke:#faf9f2;stroke-width:1.4;stroke-linejoin:round;dominant-baseline:alphabetic}.sea-name{fill:#748e91;font-family:Georgia,serif;font-style:italic;letter-spacing:2px}.poster-legend-row{cursor:default}.graticule{fill:none;stroke:#b5c7c4;stroke-width:.5;opacity:.35}.country-line{fill:none;stroke:#405d61;stroke-width:.55;stroke-opacity:.43;stroke-dasharray:2 2}.source-note{font-family:Arial,sans-serif;fill:#74807a}.language-area{stroke:#fffef8;stroke-width:.65;stroke-linejoin:round}.land-reference{stroke-width:.5;stroke-linejoin:round}`;
  function serializedSvg(){
    const clone=$('map').cloneNode(true);clone.setAttribute('xmlns',NS);clone.setAttribute('width',W);clone.setAttribute('height',H);clone.setAttribute('viewBox',`0 0 ${W} ${H}`);clone.removeAttribute('role');clone.removeAttribute('aria-label');
    const s=document.createElementNS(NS,'style');s.textContent=exportStyle;clone.prepend(s);
    // Search and legend hover/focus are editor aids, never pale gaps in the exported map.
    clone.querySelectorAll('.land-reference,.word-mark').forEach(e=>{e.setAttribute('fill-opacity','1');e.setAttribute('opacity','1');});
    clone.querySelectorAll('.language-area').forEach(e=>e.setAttribute('fill-opacity',$('overlap-toggle').checked?String(opacity):'1'));
    clone.querySelectorAll('.poster-legend-row > rect:first-child').forEach(e=>e.setAttribute('fill','transparent'));
    clone.querySelectorAll('[tabindex],[role]').forEach(e=>{e.removeAttribute('tabindex');e.removeAttribute('role');});
    return new XMLSerializer().serializeToString(clone);
  }
  function saveBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);}
  async function exportPng(){
    if(exportBusy)return;exportBusy=true;$('download-png').disabled=true;
    const original=$('download-png').innerHTML;$('download-png').textContent='Rendering…';
    try{
      await document.fonts.ready;
      const width=Number($('export-size').value),height=Math.round(width*H/W),canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
      const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas export is unavailable.');
      const source=new Blob([serializedSvg()],{type:'image/svg+xml;charset=utf-8'}),url=URL.createObjectURL(source),img=new Image();
      try{await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error('Could not rasterize the map.'));img.src=url;});ctx.fillStyle='#f7f7ee';ctx.fillRect(0,0,width,height);ctx.drawImage(img,0,0,width,height);}finally{URL.revokeObjectURL(url);}
      const png=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!png)throw new Error('PNG export was too large for this browser. Try a smaller size.');
      saveBlob(png,`snow-map-${width}px.png`);$('status').textContent=`Saved PNG · ${width} × ${height} pixels`;
    }catch(e){$('status').textContent=e.message;console.error(e);}finally{exportBusy=false;$('download-png').disabled=false;$('download-png').innerHTML=original;}
  }
  function status(){return `${languages.length} words · flat landscape · continuous land colour · PNG or editable SVG`;}
  async function init(){
    if(!window.d3)throw new Error('Local map library missing.');
    [lex,metadata,coverage,lands,features,legendTitles]=await Promise.all(['data/lexicon.json','data/geometry-sources.json','data/map-coverage.json','data/land-reference.geojson','data/territories.geojson','vendor/legend-titles.json'].map(async name=>{const r=await fetch(`./${name}`);if(!r.ok)throw new Error(`Cannot load ${name}`);return r.json();}));
    languages=lex.languages;byId=new Map(languages.map(l=>[l.id,l]));byRoot=new Map(lex.roots.map(r=>[r.id,r]));
    lands=lands.features.map(normalize);features=features.features.filter(f=>byId.has(idOf(f))).map(normalize);
    features.forEach(f=>{const id=idOf(f);if(!featureById.has(id))featureById.set(id,[]);featureById.get(id).push(f);});
    // Linear meridians and parallels: no curved frame or curved southern edge.
    const raw=(lambda,phi)=>[lambda,phi*1.325];raw.invert=(x,y)=>[x,y/1.325];
    projection=d3.geoProjection(raw).center([20.5,49.5]).scale(882).translate([1037,540]).precision(.15);
    path=d3.geoPath(projection);transform=d3.zoomIdentity;
    svg=d3.select('#map').attr('viewBox',`0 0 ${W} ${H}`);
    svg.selectAll('*').remove();
    svg.append('style').text(exportStyle);
    node(svg,'rect',{width:W,height:H,fill:'#edf3f0'});
    const defs=svg.append('defs');
    const clip=defs.append('clipPath').attr('id','land-clip');clip.selectAll('path').data(lands).join('path').attr('d',path);
    const frame=defs.append('clipPath').attr('id','map-frame');frame.append('rect').attr('x',0).attr('y',17).attr('width',W).attr('height',1022);
    world=svg.append('g').attr('class','geography').attr('clip-path','url(#map-frame)');
    const graticule=d3.geoGraticule().step([10,10]).extent([[-60,10],[90,85]])();
    world.append('path').datum(graticule).attr('class','graticule').attr('d',path).attr('fill','none').attr('stroke','#b5c7c4').attr('stroke-width',.5).attr('opacity',.35);
    basePaths=world.append('g').selectAll('path').data(lands).join('path').attr('class','land-reference').attr('data-language',idOf).attr('d',path).attr('stroke-width',.5).on('click',(e,f)=>showWord(idOf(f)));
    features.sort((a,b)=>path.area(b)-path.area(a));
    areaPaths=world.append('g').attr('clip-path','url(#land-clip)').selectAll('path').data(features).join('path').attr('class','language-area').attr('data-language',idOf).attr('d',path).attr('stroke','#fffef8').attr('stroke-width',.65).attr('vector-effect','non-scaling-stroke')
      .on('pointerenter',(e,f)=>{const l=byId.get(idOf(f));$('tooltip').textContent=`${l.word} · ${l.name}`;$('tooltip').hidden=false;})
      .on('pointermove',e=>{const b=$('map-stage').getBoundingClientRect();$('tooltip').style.left=Math.min(e.clientX-b.left+12,b.width-190)+'px';$('tooltip').style.top=Math.max(8,e.clientY-b.top-40)+'px';})
      .on('pointerleave',()=>{$('tooltip').hidden=true;}).on('click',(e,f)=>{e.stopPropagation();$('tooltip').hidden=true;showWord(idOf(f));});
    countryLines=world.append('g').attr('pointer-events','none');countryLines.selectAll('path').data(lands).join('path').attr('class','country-line').attr('d',path).attr('fill','none').attr('stroke','#405d61').attr('stroke-width',.55).attr('stroke-opacity',.43).attr('stroke-dasharray','2 2').attr('vector-effect','non-scaling-stroke');
    const seas=[{p:[-16,45.6],text:'ATLANTIC OCEAN'},{p:[19,34.8],text:'MEDITERRANEAN SEA'}];
    seas.forEach(s=>{const p=projection(s.p);addText(world,s.text,p[0],p[1],12.5,{'class':'sea-name','text-anchor':'middle',fill:'#748e91','font-style':'italic','letter-spacing':2});});
    labelsLayer=svg.append('g').attr('class','word-layer');
    legendLayer=svg.append('g').attr('class','poster-legend');
    const title=svg.append('g').attr('class','poster-title');
    addText(title,'SNOW',36,75,64,{'letter-spacing':2,'font-weight':400});
    addText(title,'EUROPE & ITS NEIGHBOURS',41,108,9.5,{'font-family':'Arial, sans-serif','letter-spacing':2,fill:'#77877d'});
    const footer=svg.append('g');node(footer,'rect',{x:0,y:1042,width:W,height:58,fill:'#f8f8f0'});
    addText(footer,'Parentheses: romanized readings. * Reconstructed form. Related colours trace branches of a shared root. Words name selected varieties; areas are generalized.',31,1064,11,{'class':'source-note','font-family':'Arial, sans-serif',fill:'#74807a'});
    addText(footer,'Areas: Asher & Moseley / DiACL / Rantanen via Glottography (CC BY 4.0). Land: Natural Earth. Gaps use country reference words. Lexical sources: linked atlas data.',31,1084,9.5,{'class':'source-note','font-family':'Arial, sans-serif',fill:'#74807a'});
    zoom=d3.zoom().scaleExtent([1,7]).extent([[0,0],[W,H]]).on('zoom',e=>{transform=e.transform;world.attr('transform',transform);labelLayout();$('tooltip').hidden=true;});svg.call(zoom).on('dblclick.zoom',null);
    $('zoom-in').addEventListener('click',()=>svg.transition().duration(200).call(zoom.scaleBy,1.3));$('zoom-out').addEventListener('click',()=>svg.transition().duration(200).call(zoom.scaleBy,1/1.3));$('zoom-reset').addEventListener('click',()=>{search='';focused=null;$('search').value='';populateLanguages();drawLegend();paint();svg.transition().duration(300).call(zoom.transform,d3.zoomIdentity);});
    $('color-mode').addEventListener('change',e=>{mode=e.target.value;focused=null;drawLegend();paint();});
    ['labels-toggle','borders-toggle','overlap-toggle'].forEach(id=>$(id).addEventListener('change',paint));
    $('opacity').addEventListener('input',e=>{opacity=+e.target.value;paint();});$('label-size').addEventListener('input',e=>{labelScale=+e.target.value;labelLayout();});
    $('search').addEventListener('input',e=>{search=e.target.value.trim().toLowerCase();populateLanguages();paint();});$('search').addEventListener('keydown',e=>{if(e.key==='Enter'){const l=languages.find(matches);if(l)showWord(l.id);}});
    $('language-select').addEventListener('change',e=>{if(e.target.value)showWord(e.target.value);});
    $('close-word').addEventListener('click',()=>$('word-dialog').close());$('sources-button').addEventListener('click',showSources);$('close-sources').addEventListener('click',()=>$('sources-dialog').close());
    ['word-dialog','sources-dialog'].forEach(id=>$(id).addEventListener('click',e=>{if(e.target===$(id))$(id).close();}));
    $('download-svg').addEventListener('click',()=>saveBlob(new Blob([serializedSvg()],{type:'image/svg+xml;charset=utf-8'}),'snow-map-landscape.svg'));
    $('download-png').addEventListener('click',exportPng);$('export-size').addEventListener('change',()=>{const s=$('download-png').querySelector('span');if(s)s.textContent=`PNG · ${Number($('export-size').value).toLocaleString()} px`;});
    populateLanguages();drawLegend();paint();$('status').textContent=status();
  }
  init().catch(e=>{console.error(e);$('status').textContent=`Map could not load: ${e.message}. Use the local launcher or hosted page.`;});
})();
