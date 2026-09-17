/** Small typed command registry. All state changes live behind game-system APIs. */
export type Argument = {name:string;description:string;optional?:boolean} & ({kind:'id';options:()=>readonly string[]}|{kind:'integer';min:number;max:number});
type Values<A extends readonly Argument[]> = {[K in keyof A]: A[K] extends {kind:'integer'} ? number : string};
export interface Command {name:string;description:string;arguments:readonly Argument[];run:(args:(string|number)[])=>string}
export function command<const A extends readonly Argument[]>(name:string,description:string,args:A,execute:(...values:Values<A>)=>string):Command{
 return {name,description,arguments:args,run:values=>execute(...values as Values<A>)};
}
export const id=(name:string,options:()=>readonly string[],optional=false):Argument & {kind:'id'}=>({name,description:name,kind:'id',options,optional});
export const integer=(name:string,min:number,max:number,optional=false):Argument & {kind:'integer'}=>({name,description:name,kind:'integer',min,max,optional});
export class Registry {
 readonly commands=new Map<string,Command>();
 add(c:Command){if(this.commands.has(c.name))throw new Error(`Duplicate command ${c.name}`);this.commands.set(c.name,c);return this;}
 usage(c:Command){return '/'+c.name+c.arguments.map(a=>` ${a.optional?'[':'<'}${a.name}${a.optional?']':'>'}`).join('');}
 execute(line:string):{ok:boolean;text:string}{
  const [name,...tokens]=line.trim().replace(/^\//,'').toLowerCase().split(/\s+/);
  const c=this.commands.get(name);
  if(!c){const match=[...this.commands.keys()].sort((a,b)=>distance(name,a)-distance(name,b))[0];return {ok:false,text:`Unknown command: /${name}.${match&&distance(name,match)<=4?` Did you mean: /${match}?`:' Try /help.'}`};}
  try{
   if(tokens.length>c.arguments.length)throw new Error(`Usage: ${this.usage(c)}`);
   const values=c.arguments.map((arg,i)=>{
    const value=tokens[i];if(value===undefined){if(arg.optional)return undefined;throw new Error(`Usage: ${this.usage(c)}`);}
    if(arg.kind==='id'){if(!arg.options().includes(value))throw new Error(`Invalid ${arg.name}: ${value}. Available: ${arg.options().join(', ')}`);return value;}
    const n=Number(value);if(!/^\d+$/.test(value)||!Number.isSafeInteger(n)||n<arg.min||n>arg.max)throw new Error(`${arg.name} must be an integer ${arg.min}–${arg.max}.`);return n;
   });
   return {ok:true,text:c.run(values as (string|number)[])};
  }catch(error){return {ok:false,text:error instanceof Error?error.message:String(error)};}
 }
 suggestions(line:string):string[]{
  const text=line.replace(/^\//,'').toLowerCase(),parts=text.split(/\s+/);
  if(parts.length===1)return [...this.commands.keys()].filter(n=>n.startsWith(text)).map(n=>'/'+n);
  const arg=this.commands.get(parts[0])?.arguments[parts.length-2];
  if(arg?.kind!=='id')return [];
  return arg.options().filter(n=>n.startsWith(parts.at(-1)!)).map(n=>'/'+[...parts.slice(0,-1),n].join(' '));
 }
}
function distance(a:string,b:string){let row=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){const next=[i];for(let j=1;j<=b.length;j++)next[j]=Math.min(next[j-1]+1,row[j]+1,row[j-1]+Number(a[i-1]!==b[j-1]));row=next;}return row[b.length];}
export class History {
 entries:string[]=[];private cursor=0;private draft='';
 add(line:string){if(line!==this.entries.at(-1))this.entries.push(line);this.entries=this.entries.slice(-100);this.cursor=this.entries.length;this.draft='';}
 move(step:number,current:string){if(this.cursor===this.entries.length)this.draft=current;this.cursor=Math.max(0,Math.min(this.entries.length,this.cursor+step));return this.entries[this.cursor]??this.draft;}
}
