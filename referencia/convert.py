import docx,re,json,sys
from PIL import ImageFont
R=ImageFont.truetype('/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf',100)
B=ImageFont.truetype('/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf',100)
CH=re.compile(r'^\(?[A-G][#b]?(m|maj|min|sus|add|dim|aug|M)?\d*(sus\d*|add\d*|maj\d*|b\d+|#\d+)*(/[A-G][#b]?)?\)?[,.]?$')
LAB=re.compile(r'^\s*((?:\[[^\]]+\]:?\s*(?:[xX×]\d+)?\s*)+)')
def text(p): return p.text.replace('\t','    ')
def xs(p):
    o=[];x=0
    for r in p.runs:
        f=B if r.bold else R
        for ch in r.text.replace('\t','    '): o.append(x); x+=f.getlength(ch)*(0.94 if ch==' ' else 1)
    o.append(x); return o
def chordy(t):
    toks=[x for x in re.split(r'[\s\-–|]+',t.replace('(','').replace(')','').replace('//','')) if x]
    return bool(toks) and all(CH.match(x) for x in toks)
V='aeiouáéíóúü'
def starts(w):
    S={0}
    for k in range(1,len(w)):
        a,b=w[k-1].lower(),w[k].lower()
        if a in ' ,¿¡(' and b not in ' ': S.add(k)
        elif a in V and b.isalpha() and b not in V and k+1<len(w) and w[k+1].lower() in V+'rl': S.add(k)
    S.add(len(w)); return sorted(S)
def snap(w,j):
    S=starts(w); return min(S,key=lambda k:(abs(k-j),k))
def labels(s):
    return [(a+(' '+b if b else '')).strip() for a,b in re.findall(r'\[([^\]]+)\]\s*(x\d+)?',s)]
def convert(path,id,title,artist):
    ps=docx.Document(path).paragraphs
    key=re.search(r'\[([^\]]+)\]',ps[0].text).group(1)
    L=[];i=1
    while i<len(ps):
        p=ps[i];t=text(p).rstrip();s=t.strip()
        if not s: L.append({'t':'blank'}); i+=1; continue
        m=LAB.match(t); lab=m.group(1) if m else ''
        rest=t[len(lab):] if m else t
        if m and not rest.strip():
            L+= [{'t':'sec','v':v} for v in labels(lab)]; i+=1; continue
        if re.match(r'^(Verso|Coro|Puente|Estrofa|Pre ?[Cc]oro|Intro|Final|Parte)\b[\w ]*$',s):
            L.append({'t':'sec','v':s}); i+=1; continue
        if chordy(rest):
            nxt=ps[i+1] if i+1<len(ps) else None
            nt=text(nxt).rstrip() if nxt else ''
            nm=LAB.match(nt); nlab=nm.group(1) if nm else ''
            if nxt is not None and nt.strip() and not chordy(nt[len(nlab):]) and nt[len(nlab):].strip():
                if lab: L+=[{'t':'sec','v':v} for v in labels(lab)]
                if nlab: L+=[{'t':'sec','v':v} for v in labels(nlab)]
                cx=xs(p); lx=xs(nxt)
                lyr=nt[len(nlab):]
                off=len(nlab)+(len(lyr)-len(lyr.lstrip())); lyr=lyr.strip()
                pos=[]
                for mm in re.finditer(r'\S+',t):
                    if mm.start()<len(lab): continue
                    x=cx[mm.start()]
                    j=min(range(len(lx)),key=lambda k:abs(lx[k]-x))
                    j=max(0,min(len(lyr),j-off))
                    j=snap(lyr,j)
                    for c in mm.group().split('-') if '-' in mm.group() and all(CH.match(z) for z in mm.group().split('-')) else [mm.group()]:
                        pos.append((j,c))
                # build segments, then drop underscores
                pos.sort(key=lambda z:z[0]); segs=[]
                if not pos or pos[0][0]>0: segs.append(['',lyr[:pos[0][0]] if pos else lyr])
                for k,(a,c) in enumerate(pos):
                    e=pos[k+1][0] if k+1<len(pos) else len(lyr)
                    segs.append([c,lyr[a:e]])
                segs=[[c,re.sub(r'_+','',w)] for c,w in segs]
                L.append({'t':'pair','segs':segs}); i+=2; continue
            if lab: L+=[{'t':'sec','v':v} for v in labels(lab)]
            L.append({'t':'ch','v':rest.strip()}); i+=1; continue
        if lab: L+=[{'t':'sec','v':v} for v in labels(lab)]
        if re.search(r'\(?[A-G][#b]?\d',rest) and re.search(r'\b[A-G][#b]?(m|\d|/)',rest):
            L.append({'t':'mix','v':rest.strip()})
        else: L.append({'t':'ly','v':rest.strip()})
        i+=1
    while L and L[-1]['t']=='blank': L.pop()
    return {'id':id,'titulo':title,'interprete':artist,'tono':key,'lineas':L}
