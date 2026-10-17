"""Refresh the static source list and README from the attributed lexicon."""
import json, re, html
from pathlib import Path
from urllib.parse import unquote

ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/'dist/data'
lex=json.loads((DATA/'lexicon.json').read_text(encoding='utf-8'))
geo=json.loads((DATA/'geometry-sources.json').read_text(encoding='utf-8'))
catalog=json.loads((DATA/'source-catalog.json').read_text(encoding='utf-8'))
old={unquote(item['url']):item for item in catalog['lexical']}
records={}
literal=set();citations=0
next_id=max(int(x['id'][1:]) for x in old.values())+1
for kind,items in [('rootUses',lex['roots']),('languageUses',lex['languages'])]:
 for item in items:
  for source in item.get('sources',[]):
   url=source['url'];key=unquote(url);literal.add(url);citations+=1
   if key not in records:
    previous=old.get(key)
    record={'id':previous['id'] if previous else f'L{next_id:03}',
      'url':previous['url'] if previous else url,'title':source['title'],
      'titles':[],'urlAliases':[],'rootUses':[],'languageUses':[],'useCount':0}
    if not previous:next_id+=1
    records[key]=record
   record=records[key]
   for field,value in [('titles',source['title']),('urlAliases',url)]:
    if value not in record[field]:record[field].append(value)
   context={'id':item['id'],'name':item.get('name',item.get('label',item['id']))}
   if context not in record[kind]:record[kind].append(context)
   record['useCount']+=1
catalog['lexical']=sorted(records.values(),key=lambda x:int(x['id'][1:]))
catalog['counts'].update(languages=len(lex['languages']),wordOriginSets=len(lex['roots']),
 lexicalLiteralUrls=len(literal),lexicalCanonicalSources=len(records),lexicalCitations=citations,
 languageAreaFeatures=geo['featureCount'],documentedLexicalJoins=geo['lexicalJoinCount'])
(DATA/'source-catalog.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

def e(text):return html.escape(str(text),quote=True)
def a(url,title):return f'<a href="{e(url)}" target="_blank" rel="noopener">{e(title)}</a>'
def md(url,title):return f'[{title}]({url})'
def contexts(item):return '; '.join(sorted({x['name'] for x in item['languageUses']}|{x['name']+' (root set)' for x in item['rootUses']}))
geolist=[];georeadme=[]
for item in catalog['geography']:
 refs=' · '.join(a(x['url'],x['label']) for x in item['urls'])
 title=item.get('citation',item['title'])
 geolist.append(f'<li><strong>{e(title)}</strong><p>{e(item["usedFor"])} <span class="source-license">{e(item.get("license",""))}</span></p><p class="reference-links">{refs}</p></li>')
 georeadme.append(f'- **{title}** — {item["usedFor"]} {item.get("license","")}. '+' · '.join(md(x['url'],x['label']) for x in item['urls']))
lexlist=[f'<li id="source-{item["id"].lower()}">{a(item["url"],item["title"])}<small>{e(contexts(item))}</small></li>' for item in catalog['lexical']]
tools=[x for x in catalog['typographySoftwareLicense'] if x.get('category')!='license']
toolhtml=''.join(f'<li>{a(x["url"],x["title"])} — {e(x.get("license",x.get("usedFor","")))}</li>' for x in tools)
note='Aramaic labels distinguish Maaloula Western Neo-Aramaic, Assyrian Neo-Aramaic and Turoyo. Mandaic is a literary/liturgical reference near Basra. Where no suitable language-area polygon is documented, a location label is used.'
canary='Canarian tener? is a disputed historical report attributed to La Palma. The question mark is essential: this is not a secure reconstruction, and no relation to mainland Amazigh adfel is asserted. The island fill is a historical reference rather than a surviving speech area.'
section=f'''<section id="sources" class="source-section" aria-labelledby="source-list-title">
<div class="source-section-heading"><div><h2 id="source-list-title">Sources</h2><p>Geography, dictionaries and the references behind the map.</p></div><button class="secondary-button" id="sources-button" type="button">Map notes</button></div>
<p class="source-intro">The atlas contains {len(lex['languages'])} selected language and variety entries. Language-area polygons are generalized and can overlap. A country reference layer fills the land beneath them; it does not describe ethnicity or uniform language use.</p>
<p class="source-intro">The Kurdish ranges include published Kurmanji and Sorani traditional-area supplements with a 1750 reference epoch. They show generalized historical ranges, not a current speaker census.</p>
<p class="source-intro">{e(note)}</p><p class="source-intro">{e(canary)}</p>
<div class="source-columns"><div><h3>Geography</h3><ol class="geographic-references">{''.join(geolist)}</ol></div>
<div><h3>Words and etymologies</h3><p>Each word and root links to its references. Most comparisons use Wiktionary alongside the dictionaries and institutional resources listed below. Asterisks mark reconstructed forms; uncertain histories are identified in the entry notes.</p>
<p>The Syrian Arabic reading <em>telj</em> and Mesopotamian Arabic <em>thelij</em> were supplied by the map author. Their dictionary link supports the broader Arabic etymology rather than independently verifying those exact regional readings.</p>
<details class="lexical-references"><summary>All {len(records)} dictionary, reconstruction and historical references</summary><ol>{''.join(lexlist)}</ol></details>
<h3>Typography and software</h3><ul class="tool-references">{toolhtml}</ul>
<p>Wiktionary content is attributed under <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener">CC BY-SA 4.0</a>; other dictionaries retain their own terms. Geometry, font and software licences are recorded separately.</p>
<p class="reference-links"><a href="./data/source-catalog.json">Source catalog (JSON)</a> · <a href="./data/geometry-sources.json">Geographic provenance</a> · <a href="./data/lexicon.json">Lexicon</a> · <a href="https://github.com/Khayoon/snow-word-atlas#sources" target="_blank" rel="noopener">README</a></p></div></div>
<p class="poster-downloads">Poster downloads: <a href="./downloads/snow-map-landscape-6000px.png" download>6,000px PNG</a> · <a href="./downloads/snow-map-landscape.svg" download>SVG</a>. Use the map controls above to export a different view.</p></section>'''
f=ROOT/'dist/index.html';page=f.read_text(encoding='utf-8')
page,n=re.subn(r'<section id="sources".*?</section>',lambda _:section,page,flags=re.S);assert n==1
f.write_text(page,encoding='utf-8')

f=ROOT/'README.md';readme=f.read_text(encoding='utf-8').split('## Sources')[0]
readme=re.sub(r'\*\*\d+ selected language/variety entries\*\*',f'**{len(lex["languages"])} selected language/variety entries**',readme)
readme=re.sub(r'\*\*\d+ word-origin sets\*\*',f'**{len(lex["roots"])} word-origin sets**',readme)
readme=re.sub(r'\| \d+ entries; \d+ root sets;',f'| {len(lex["languages"])} entries; {len(lex["roots"])} root sets;',readme)
readme+='## Sources\n\nThe source catalog records the links attached to every entry and root. Wiktionary is a community-edited secondary resource; primary dictionaries, field grammars and historical accounts are identified in their entry notes.\n\n'
readme+='### Geography\n\n'+'\n'.join(georeadme)+'\n\n'+note+'\n\n'+canary+'\n\n'
readme+='### Lexical, etymological, historical and romanization references\n\n<details>\n<summary>Complete list of '+str(len(records))+' references</summary>\n\n'
readme+='\n'.join(f'- {md(x["url"],x["title"])} — {contexts(x)}.' for x in catalog['lexical'])+'\n\n</details>\n\n'
readme+='### Typography, software and licences\n\n'+'\n'.join(f'- {md(x["url"],x["title"])} — {x.get("license",x.get("usedFor",""))}.' for x in tools)+'\n\n'
readme+='Geometry attributed by Glottography is CC BY 4.0; Natural Earth geography is public domain. Wiktionary content is identified as CC BY-SA 4.0; other dictionaries retain their own terms. D3 retains its ISC notice; Gentium Plus and Noto retain their SIL OFL notices in `dist/vendor/`. No blanket project licence is imposed on the original code or mixed third-party data.\n\n'
readme+='The machine-readable [source catalog](dist/data/source-catalog.json) preserves original URL spellings and root/language citation contexts. Run `python scripts/update-references.py` after updating the attributed lexicon to refresh these lists.\n'
f.write_text(readme,encoding='utf-8')
print(f'References refreshed: {len(lex["languages"])} entries, {len(lex["roots"])} origin sets, {len(records)} lexical references.')
