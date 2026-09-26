import React,{useEffect,useMemo,useRef,useState} from "react";
import {createRoot} from "react-dom/client";
import {Canvas,useThree,useFrame} from "@react-three/fiber";
import {OrbitControls,Bounds,Outlines,RoundedBox,ContactShadows,Environment,Html,Grid,useCursor} from "@react-three/drei";
import * as THREE from "three";
import "./style.css";

const ROOM_TYPES={
  "1 BHK":["Living Room","Bedroom","Kitchen"],
  "2 BHK":["Living Room","Master Bedroom","Bedroom 2","Kitchen","Bathroom"],
  "3 BHK":["Living Room","Master Bedroom","Bedroom 2","Bedroom 3","Kitchen","Bathroom"],
  "4 BHK":["Living Room","Master Bedroom","Bedroom 2","Bedroom 3","Bedroom 4","Kitchen","Bathroom"],
  "5 BHK":["Living Room","Master Bedroom","Bedroom 2","Bedroom 3","Bedroom 4","Bedroom 5","Kitchen","Bathroom"]
};

const CATALOG=[
  {id:"tvunit",name:"Modular Display TV Console",category:"TV Units",price:54999,type:"tvunit"},
  {id:"television",name:"55-inch Smart TV",category:"TV Units",price:39999,type:"television"},
  {id:"sofa",name:"Luna 3-Seater Sofa",category:"Sofas",price:32999,type:"sofa"},
  {id:"bed",name:"Aster Queen Bed",category:"Beds",price:41999,type:"bed"},
  {id:"table",name:"Oak Dining Table",category:"Dining",price:28999,type:"table"},
  {id:"wardrobe",name:"Linea Wardrobe",category:"Storage",price:35999,type:"wardrobe"}
];

const FRAME_FINISHES=[
  {id:"red",name:"Crimson",hex:"#8b1f1b"},
  {id:"olive",name:"Olive",hex:"#7a846a"},
  {id:"black",name:"Graphite",hex:"#292724"}
];

function WoodMaterial({roughness=.34}){
  const texture=useMemo(()=>{
    const c=document.createElement("canvas");c.width=768;c.height=768;
    const ctx=c.getContext("2d");
    const grad=ctx.createLinearGradient(0,0,c.width,0);
    grad.addColorStop(0,"#4a2513");grad.addColorStop(.5,"#754327");grad.addColorStop(1,"#3b1d10");
    ctx.fillStyle=grad;ctx.fillRect(0,0,c.width,c.height);
    for(let i=0;i<420;i++){
      const x=i*2+Math.sin(i*.51)*20;
      ctx.beginPath();ctx.moveTo(x,0);ctx.bezierCurveTo(x+18,190,x-22,470,x+7,768);
      ctx.strokeStyle=i%13===0?"rgba(12,6,3,.30)":"rgba(255,185,110,.09)";
      ctx.lineWidth=i%13===0?1.7:.7;ctx.stroke();
    }
    const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(1.15,1.0);t.anisotropy=8;
    return t;
  },[]);
  return <meshStandardMaterial map={texture} color="#8a512d" roughness={roughness} metalness={0} />;
}

function Panel({position,size,frame=false,frameColor="#8b1f1b",children}){
  return <RoundedBox args={size} radius={.025} smoothness={3} bevelSegments={3} position={position} castShadow receiveShadow>
    {children|| (frame?<meshStandardMaterial color={frameColor} roughness={.31} metalness={.12}/>:<WoodMaterial/>)}
  </RoundedBox>;
}

function TVUnitModel({frameFinish="red"}){
  const frame=FRAME_FINISHES.find(x=>x.id===frameFinish)?.hex||FRAME_FINISHES[0].hex;
  const gap=.035;
  return <group>
    {/* lower console */}
    <Panel position={[0,1.05,0]} size={[3.85,.10,.54]}/>
    <Panel position={[0,.39,0]} size={[3.85,.08,.54]}/>
    <Panel position={[-1.86,.72,0]} size={[.08,.68,.54]}/>
    <Panel position={[1.86,.72,0]} size={[.08,.68,.54]}/>
    {[-1.25,0,1.25].map((x,i)=><Panel key={i} position={[x,.73,-.285]} size={[1.20,.58,.045]}/>)}
    {[-.625,.625].map((x,i)=><Panel key={i} position={[x,.73,-.314]} size={[.025,.61,.035]} frame frameColor="#25160d"/>)}
    <Panel position={[0,.02,.03]} size={[3.55,.075,.12]} frame frameColor={frame}/>
    {[-1.70,1.70].map((x,i)=><group key={i}>
      <Panel position={[x,.20,.03]} size={[.10,.39,.10]} frame frameColor={frame}/>
      <Panel position={[x,.025,.07]} size={[.38,.07,.10]} frame frameColor={frame}/>
    </group>)}

    {/* left hanging/open frame */}
    <Panel position={[-1.50,2.02,.02]} size={[.095,1.62,.10]} frame frameColor={frame}/>
    <Panel position={[-1.08,1.70,.02]} size={[.85,.085,.34]} frame frameColor={frame}/>
    <Panel position={[-1.08,2.60,.02]} size={[.085,.09,.34]} frame frameColor={frame}/>

    {/* upper 2-door cabinet */}
    <Panel position={[-.55,3.10,0]} size={[2.05,.09,.54]}/>
    <Panel position={[-.55,2.00,0]} size={[2.05,.08,.54]}/>
    <Panel position={[-1.56,2.55,0]} size={[.08,1.13,.54]}/>
    <Panel position={[.46,2.55,0]} size={[.08,1.13,.54]}/>
    <Panel position={[-.55,2.55,0]} size={[.025,1.12,.57]} frame frameColor="#24160d"/>
    <Panel position={[-1.045,2.55,-.285]} size={[.94,1.07,.042]}/>
    <Panel position={[-.055,2.55,-.285]} size={[.94,1.07,.042]}/>

    {/* right shelving tower */}
    <Panel position={[1.52,2.55,.02]} size={[.095,3.05,.10]} frame frameColor={frame}/>
    <Panel position={[.80,2.55,.02]} size={[.095,3.05,.10]} frame frameColor={frame}/>
    {[1.35,2.08,2.82,3.52].map((y,i)=><Panel key={i} position={[1.16,y,.02]} size={[1.48,.085,.42]} frame frameColor={frame}/>)}
    <Panel position={[1.16,3.92,.02]} size={[1.58,.09,.42]} frame frameColor={frame}/>
    <Panel position={[1.16,1.14,.02]} size={[1.58,.065,.12]} frame frameColor={frame}/>

    {/* recessed walnut trim / shadows for depth */}
    <Panel position={[0,1.11,-.30]} size={[3.76,.025,.025]} frame frameColor="#22130b"/>
  </group>;
}

function Television({size=55}){
  const scale=size/55;
  return <group scale={scale} position={[0,1.72,-.34]}>
    <RoundedBox args={[1.70,.98,.055]} radius={.035} smoothness={4} bevelSegments={4} castShadow>
      <meshPhysicalMaterial color="#070707" roughness={.18} metalness={.35} clearcoat={.75} clearcoatRoughness={.12}/>
      <Outlines thickness={.012} color="#202020" screenspace/>
    </RoundedBox>
    <mesh position={[0,0,.032]}>
      <planeGeometry args={[1.56,.84]}/>
      <meshPhysicalMaterial color="#020305" roughness={.07} metalness={.05} clearcoat={1} clearcoatRoughness={.08}/>
    </mesh>
    <RoundedBox args={[.085,.075,.02]} radius={.01} position={[0,-.55,.0]}>
      <meshStandardMaterial color="#191919" roughness={.3}/>
    </RoundedBox>
    <RoundedBox args={[.60,.028,.18]} radius={.012} position={[0,-.56,.02]}>
      <meshStandardMaterial color="#141414" roughness={.28} metalness={.2}/>
    </RoundedBox>
  </group>;
}

function GenericModel({type}){
  if(type==="sofa") return <group>
    <RoundedBox args={[2.45,.55,1.02]} radius={.11} smoothness={4} position={[0,.50,0]}><meshStandardMaterial color="#d8d1c6" roughness={.82}/></RoundedBox>
    <RoundedBox args={[2.45,.95,.34]} radius={.10} smoothness={4} position={[0,1.05,-.35]}><meshStandardMaterial color="#d8d1c6" roughness={.86}/></RoundedBox>
    {[-.78,0,.78].map(x=><RoundedBox key={x} args={[.68,.34,.82]} radius={.08} position={[x,.72,.02]}><meshStandardMaterial color="#b9afa0" roughness={.9}/></RoundedBox>)}
  </group>;
  if(type==="bed") return <group>
    <RoundedBox args={[2.25,.34,3.0]} radius={.04} position={[0,.33,0]}><meshStandardMaterial color="#6d4024" roughness={.38}/></RoundedBox>
    <RoundedBox args={[2.30,1.30,.20]} radius={.03} position={[0,.75,-1.37]}><meshStandardMaterial color="#6d4024" roughness={.38}/></RoundedBox>
    <RoundedBox args={[2.02,.25,2.25]} radius={.04} position={[0,.57,.18]}><meshStandardMaterial color="#eee8de" roughness={.96}/></RoundedBox>
  </group>;
  if(type==="table") return <group>
    <RoundedBox args={[2.42,.18,1.30]} radius={.04} position={[0,.92,0]}><meshStandardMaterial color="#704126" roughness={.43}/></RoundedBox>
    {[-.95,.95].flatMap(x=>[-.45,.45].map(z=><RoundedBox key={x+z} args={[.16,.92,.16]} radius={.03} position={[x,.46,z]}><meshStandardMaterial color="#3c2517" roughness={.5}/></RoundedBox>))}
  </group>;
  return <group>
    <RoundedBox args={[1.55,2.35,.60]} radius={.045} position={[0,1.18,0]}><meshStandardMaterial color="#e6e1d8" roughness={.58}/></RoundedBox>
    <RoundedBox args={[1.34,2.07,.035]} radius={.01} position={[0,1.18,.32]}><meshStandardMaterial color="#6d4024" roughness={.45}/></RoundedBox>
  </group>;
}

function ProductObject({item,selected,onSelect,onMove,onDragging}){
  const group=useRef();
  const [hovered,setHovered]=useState(false);
  const drag=useRef(false);
  const offset=useRef(new THREE.Vector3());
  const plane=useMemo(()=>new THREE.Plane(new THREE.Vector3(0,1,0),0),[]);
  useCursor(hovered||selected,selected?"grab":"pointer");

  const rayToFloor=(ray)=>{
    const p=new THREE.Vector3();
    return ray.intersectPlane(plane,p)?p:null;
  };

  const down=(e)=>{
    e.stopPropagation();
    const p=rayToFloor(e.ray); if(!p)return;
    drag.current=true;onDragging(true);onSelect(item.id);
    offset.current.copy(group.current.position).sub(p);
    e.target.setPointerCapture?.(e.pointerId);
  };
  const move=(e)=>{
    if(!drag.current)return;
    e.stopPropagation();
    const p=rayToFloor(e.ray); if(!p)return;
    const snap=(v,step=.05)=>Math.round(v/step)*step;
    const x=THREE.MathUtils.clamp(snap(p.x+offset.current.x),-3.75,3.75);
    const z=THREE.MathUtils.clamp(snap(p.z+offset.current.z),-2.75,2.75);
    onMove(item.id,{x,z});
  };
  const up=(e)=>{drag.current=false;onDragging(false);e.stopPropagation();};

  const content=item.type==="tvunit"?<TVUnitModel frameFinish={item.frameFinish||"red"}/>:item.type==="television"?<Television size={item.tvSize||55}/>:<GenericModel type={item.type}/>;

  return <group ref={group} position={[item.x,0,item.z]} rotation={[0,item.rotation,0]}>
    <group onPointerOver={e=>{e.stopPropagation();setHovered(true)}} onPointerOut={e=>{e.stopPropagation();setHovered(false)}}
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onClick={e=>{e.stopPropagation();onSelect(item.id)}}>
      {content}
      {/* generous invisible pickup volume so dragging does not require grabbing a tiny mesh */}
      <mesh visible={false} position={[0,1.8,0]} onPointerDown={down} onPointerMove={move} onPointerUp={up}>
        <boxGeometry args={[4.05,3.7,.85]}/><meshBasicMaterial transparent opacity={0} depthWrite={false}/>
      </mesh>
      {selected&&<mesh rotation={[-Math.PI/2,0,0]} position={[0,.006,0]}>
        <ringGeometry args={[1.70,1.76,64]}/><meshBasicMaterial color="#c49a62" transparent opacity={.82}/>
      </mesh>}
    </group>
  </group>;
}

function CameraDirector({view,autoFitToken}){
  const {camera,controls}=useThree();
  const done=useRef(0);
  useEffect(()=>{
    if(!controls)return;
    const poses={
      "3d":[7.5,5.0,8.5,[0,1.65,0]],
      "front":[0,2.15,8.2,[0,1.65,0]],
      "top":[0,8.5,0.1,[0,0,0]]
    };
    const p=poses[view]||poses["3d"];
    camera.position.set(p[0],p[1],p[2]);
    controls.target.set(...p[3]);
    controls.update();
  },[view,controls,camera]);
  useEffect(()=>{
    if(!controls||!autoFitToken)return;
    const t=setTimeout(()=>{controls.target.set(0,1.55,0);controls.update();},30);
    done.current=autoFitToken;return()=>clearTimeout(t);
  },[autoFitToken,controls]);
  return null;
}

function RoomScene({room,furniture,selectedId,setSelectedId,moveFurniture,view,onDragging}){
  const content=(
    <>
      {furniture.map(item=><ProductObject key={item.id} item={item} selected={item.id===selectedId}
        onSelect={setSelectedId} onMove={moveFurniture} onDragging={onDragging}/>)}
    </>
  );
  return <Canvas shadows dpr={[1,1.75]} camera={{position:[7.5,5,8.5],fov:40}}
    gl={{antialias:true,powerPreference:"high-performance",toneMapping:THREE.ACESFilmicToneMapping,toneMappingExposure:1.05}}
    onPointerMissed={()=>setSelectedId(null)}>
    <color attach="background" args={["#e9e4dc"]}/>
    <ambientLight intensity={1.35}/>
    <hemisphereLight intensity={.8} groundColor="#b5aa99" color="#fff9ef"/>
    <directionalLight position={[4,8,5]} intensity={2.7} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048}/>
    <Environment preset="studio"/>
    <mesh receiveShadow rotation={[-Math.PI/2,0,0]} position={[0,0,0]}>
      <planeGeometry args={[9,7]}/><meshStandardMaterial color="#8b8278" roughness={.88}/>
    </mesh>
    <mesh position={[0,2.8,-3.5]} receiveShadow><boxGeometry args={[9,5.6,.10]}/><meshStandardMaterial color="#f2eee7" roughness={.96}/></mesh>
    <mesh position={[-4.5,2.8,0]} receiveShadow rotation={[0,Math.PI/2,0]}><boxGeometry args={[7,5.6,.10]}/><meshStandardMaterial color="#eeeae2" roughness={.96}/></mesh>
    <Grid args={[9,7]} position={[0,.006,0]} cellSize={.5} cellThickness={.25} sectionSize={1} sectionThickness={.5} fadeDistance={10} fadeStrength={1.2} infiniteGrid={false} />
    <Html position={[-4.2,5.0,-3.4]} transform occlude><div className="scene-label">EFIVE • {room}</div></Html>
    <ContactShadows position={[0,0,0]} opacity={.28} scale={9} blur={2.4} far={7}/>
    <Bounds fit clip observe margin={1.15} maxDuration={.6}>{content}</Bounds>
    <OrbitControls makeDefault enableDamping dampingFactor={.075} minDistance={4.2} maxDistance={15} maxPolarAngle={Math.PI/2.03} minPolarAngle={.25} />
    <CameraDirector view={view} autoFitToken={furniture.length}/>
  </Canvas>;
}

function initialItem(type,price){
  const base={id:"f"+Date.now()+Math.random().toString(16).slice(2),type,name:CATALOG.find(x=>x.type===type)?.name||type,x:0,z:-.6,rotation:0,price};
  if(type==="tvunit")base.frameFinish="red";
  if(type==="television")base.tvSize=55;
  return base;
}

function App(){
  const [bhk,setBhk]=useState("2 BHK");
  const [room,setRoom]=useState("Living Room");
  const [layouts,setLayouts]=useState({});
  const [selectedId,setSelectedId]=useState(null);
  const [category,setCategory]=useState("All");
  const [view,setView]=useState("3d");
  const [dragging,setDragging]=useState(false);
  const [saved,setSaved]=useState(false);

  const key=bhk+"::"+room;
  const furniture=layouts[key]||[];
  const visibleRooms=ROOM_TYPES[bhk];
  const categories=["All",...new Set(CATALOG.map(x=>x.category))];
  const shown=category==="All"?CATALOG:CATALOG.filter(x=>x.category===category);
  const selected=furniture.find(x=>x.id===selectedId)||null;
  const total=Object.values(layouts).flat().reduce((s,x)=>s+x.price,0);

  useEffect(()=>{
    try{const s=JSON.parse(localStorage.getItem("efive-studio-layouts")||"{}");if(s&&typeof s==="object")setLayouts(s)}catch{}
  },[]);

  useEffect(()=>{
    if(!ROOM_TYPES[bhk].includes(room))setRoom(ROOM_TYPES[bhk][0]);
    setSelectedId(null);
  },[bhk,room]);

  const updateRoom=(next)=>{
    setLayouts(x=>({...x,[key]:next}));
    setSelectedId(next.some(x=>x.id===selectedId)?selectedId:null);
  };
  const add=(p)=>{
    const item=initialItem(p.type,p.price);
    item.name=p.name;
    item.x=(furniture.length%3-1)*1.05;
    item.z=(Math.floor(furniture.length/3)*.85)-.9;
    updateRoom([...furniture,item]);setSelectedId(item.id);
  };
  const moveFurniture=(id,patch)=>updateRoom(furniture.map(x=>x.id===id?{...x,...patch}:x));
  const remove=()=>{if(selected)updateRoom(furniture.filter(x=>x.id!==selected.id));};
  const rotate=(delta)=>selected&&moveFurniture(selected.id,{rotation:selected.rotation+delta});
  const changeFinish=(finish)=>selected?.type==="tvunit"&&moveFurniture(selected.id,{frameFinish:finish});
  const changeTvSize=(size)=>selected?.type==="television"&&moveFurniture(selected.id,{tvSize:size});

  useEffect(()=>{
    const keyDown=(e)=>{
      if(!selected)return;
      if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Delete","Backspace","r","R"].includes(e.key))e.preventDefault();
      const step=e.shiftKey?.25:.05;
      if(e.key==="ArrowLeft")moveFurniture(selected.id,{x:selected.x-step});
      if(e.key==="ArrowRight")moveFurniture(selected.id,{x:selected.x+step});
      if(e.key==="ArrowUp")moveFurniture(selected.id,{z:selected.z-step});
      if(e.key==="ArrowDown")moveFurniture(selected.id,{z:selected.z+step});
      if(e.key.toLowerCase()==="r")rotate(e.shiftKey?-.2618:.2618);
      if(e.key==="Delete"||e.key==="Backspace")remove();
    };
    window.addEventListener("keydown",keyDown);return()=>window.removeEventListener("keydown",keyDown);
  },[selected,furniture]);

  const save=()=>{
    localStorage.setItem("efive-studio-layouts",JSON.stringify(layouts));
    setSaved(true);setTimeout(()=>setSaved(false),1400);
  };
  const share=async()=>{
    const url=window.location.href;
    try{await navigator.clipboard.writeText(url);alert("Design link copied!")}
    catch{alert("Copy this page URL to share the design.")}
  };

  return <div className="app">
    <header className="topbar">
      <div className="brand"><span className="brand-mark">E</span><div><strong>EFIVE</strong><small>STUDIO</small></div></div>
      <div className="headline"><span className="eyebrow">INTERIOR PLANNER</span><h1>3D Room Designer</h1></div>
      <div className="top-actions"><button className="ghost" onClick={save}>{saved?"Saved ✓":"Save"}</button><button className="primary" onClick={share}>Share design</button></div>
    </header>

    <main className="workspace">
      <aside className="sidebar">
        <section><div className="eyebrow">HOME TYPE</div><div className="seg">{Object.keys(ROOM_TYPES).map(x=><button key={x} className={bhk===x?"active":""} onClick={()=>{setBhk(x);setRoom(ROOM_TYPES[x][0])}}>{x}</button>)}</div></section>
        <section><div className="eyebrow">ROOMS</div><div className="rooms">{visibleRooms.map(x=><button key={x} className={room===x?"room-active":""} onClick={()=>setRoom(x)}><span>{x}</span><span>›</span></button>)}</div></section>
        <section>
          <div className="eyebrow">FURNITURE CATALOG</div>
          <div className="chips">{categories.map(x=><button key={x} className={category===x?"chip-active":""} onClick={()=>setCategory(x)}>{x}</button>)}</div>
          <div className="catalog">{shown.map(p=><button className="product" key={p.id} onClick={()=>add(p)}>
            <div className={"thumb "+p.type}>{p.type==="tvunit"?<span className="thumb-unit"/>:p.type==="television"?<span className="thumb-tv"/>:<span className={"thumb-generic "+p.type}/>}</div>
            <div><b>{p.name}</b><span>₹{p.price.toLocaleString("en-IN")}</span></div><strong>＋</strong>
          </button>)}</div>
        </section>
      </aside>

      <section className="viewport">
        <div className="viewport-head">
          <div><div className="eyebrow">LIVE CANVAS</div><h2>{room}</h2><p>{dragging?"Release to place furniture":"Drag any furniture directly • Scroll to zoom • R to rotate"}</p></div>
          <div className="view-switch">{["3d","front","top"].map(v=><button key={v} onClick={()=>setView(v)} className={view===v?"active":""}>{v==="3d"?"3D":v==="front"?"Front":"Top"}</button>)}</div>
        </div>
        <div className="canvas-wrap"><RoomScene room={room} furniture={furniture} selectedId={selectedId} setSelectedId={setSelectedId} moveFurniture={moveFurniture} view={view} onDragging={setDragging}/></div>
        <div className="canvas-tools">
          <span><i/> Direct drag</span><span><i/> 5 cm snapping</span><span><i/> Arrow keys</span>
        </div>
      </section>

      <aside className="inspector">
        <div className="inspector-head"><div><div className="eyebrow">PROPERTIES</div><h2>{selected?"Selected product":"Your room"}</h2></div>{selected&&<button className="x" onClick={()=>setSelectedId(null)}>×</button>}</div>
        {selected?<div>
          <div className="selected-card"><div className={"big-thumb "+selected.type}><span className={selected.type==="tvunit"?"thumb-unit":selected.type==="television"?"thumb-tv":"thumb-generic "+selected.type}/></div><div><h3>{selected.name}</h3><p>{room}</p><strong>₹{selected.price.toLocaleString("en-IN")}</strong></div></div>
          {selected.type==="tvunit"&&<div className="control-group"><label>FRAME FINISH</label><div className="finish-row">{FRAME_FINISHES.map(f=><button key={f.id} title={f.name} style={{"--finish":f.hex}} className={selected.frameFinish===f.id?"finish-active":""} onClick={()=>changeFinish(f.id)}/>)}</div></div>}
          {selected.type==="television"&&<div className="control-group"><label>TV SIZE</label><div className="size-row">{[55,65,75].map(s=><button key={s} className={selected.tvSize===s?"active":""} onClick={()=>changeTvSize(s)}>{s}"</button>)}</div></div>}
          <div className="control-group"><label>POSITION</label><div className="control-row"><span>X</span><input type="number" step=".05" value={selected.x.toFixed(2)} onChange={e=>moveFurniture(selected.id,{x:Number(e.target.value)})}/><span>Z</span><input type="number" step=".05" value={selected.z.toFixed(2)} onChange={e=>moveFurniture(selected.id,{z:Number(e.target.value)})}/></div></div>
          <div className="control-group"><label>ROTATION</label><div className="rotate-row"><button onClick={()=>rotate(-Math.PI/4)}>−45°</button><div>{Math.round(selected.rotation*180/Math.PI)}°</div><button onClick={()=>rotate(Math.PI/4)}>＋45°</button></div></div>
          <button className="danger" onClick={remove}>Remove from room</button>
        </div>:<div className="empty"><div className="empty-icon">✦</div><h3>Build your room</h3><p>Add a product from the catalog, then drag it anywhere in the room. Every room keeps its own layout.</p></div>}
        <div className="summary"><div><span>Current room items</span><b>{furniture.length}</b></div><div><span>Home type</span><b>{bhk}</b></div><div className="total"><span>Design value</span><strong>₹{total.toLocaleString("en-IN")}</strong></div></div>
      </aside>
    </main>
  </div>;
}

createRoot(document.getElementById("root")).render(<App/>);