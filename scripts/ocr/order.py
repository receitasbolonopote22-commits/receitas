import json,sys,os,glob,re
def page_text(p, split=0.5):
    d=json.load(open(p)); L=d['lines']
    full=[];left=[];right=[]
    for l in L:
        x0=l['x'];x1=l['x']+l['w']
        if x0<split-0.02 and x1>split+0.02: full.append(l)
        elif x1<=split+0.02: left.append(l)
        else: right.append(l)
    full.sort(key=lambda l:l['y'])
    out=[];bounds=[l['y'] for l in full]+[9]
    prev=-1
    segs=[]
    for i,b in enumerate(bounds):
        seg_l=sorted([l for l in left if prev<=l['y']<b],key=lambda l:(l['y']))
        seg_r=sorted([l for l in right if prev<=l['y']<b],key=lambda l:(l['y']))
        for l in seg_l: out.append(('L',l))
        for l in seg_r: out.append(('R',l))
        if i<len(full): out.append(('F',full[i]))
        prev=b
    return '\n'.join(f"{t}| {l['t']}" for t,l in out)
if __name__=='__main__':
    # uso: python3 order.py PREFIXO [divisao_colunas] [--dir PASTA_JSON]
    prefix=sys.argv[1]; split=float(sys.argv[2]) if len(sys.argv)>2 else 0.5
    d=sys.argv[sys.argv.index('--dir')+1] if '--dir' in sys.argv else 'o2'
    for p in sorted(glob.glob(f'{d}/{prefix}*.json')):
        print(f"\n######## {os.path.basename(p)[:-5]}")
        print(page_text(p,split))
