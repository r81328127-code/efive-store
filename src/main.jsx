import React,{useEffect,useMemo,useRef,useState} from "react";
import {createRoot} from "react-dom/client";
import {Canvas,useThree} from "@react-three/fiber";
import {OrbitControls,Bounds,Outlines,RoundedBox,ContactShadows,Environment,Html,Grid,useCursor,useLoader,useGLTF} from "@react-three/drei";
import * as THREE from "three";
import {MACRAME_WEBP_BASE64} from "./assets/macrameData.js";
import "./style.css";

const ROOM_TYPES={
  "1 BHK":["Living Room","Bedroom","Kitchen"],
  "2 BHK":["Living Room","Master Bedroom","Bedroom 2","Kitchen","Bathroom"],
  "3 BHK":["Living Room","Master Bedroom","Bedroom 2","Bedroom 3","Kitchen","Bathroom"],
  "4 BHK":["Living Room","Master Bedroom","Bedroom 2","Bedroom 3","Bedroom 4","Kitchen","Bathroom"],
  "5 BHK":["Living Room","Master Bedroom","Bedroom 2","Bedroom 3","Bedroom 4","Bedroom 5","Kitchen","Bathroom"]
};

const CATALOG=[
  {id:"tvunit",name:"Modular Display TV Console",category:"TV Units",price:34999,type:"tvunit"},
  {id:"television",name:"55-inch Smart TV",category:"TV Units",price:39999,type:"television"},
  {id:"macrame",name:"Handwoven Macrame Sun & Rainbow Wall Decor",category:"Decor",price:1299,type:"macrame"},\n  {id:"car",name:"Ferrari 458 Italia • 3D Demo",category:"Cars",price:0,type:"car"},
  {id:"sofa",name:"Luna 3-Seater Sofa",category:"Sofas",price:32999,type:"sofa"},
  {id:"bed",name:"Aster Queen Bed",category:"Beds",price:41999,type:"bed"},
  {id:"table",name:"Oak Dining Table",category:"Dining",price:28999,type:"table"},
  {id:"wardrobe",name:"Linea Wardrobe",category:"Storage",price:35999,type:"wardrobe"}
];

const CAR_MODEL_URL="https://threejs.org/examples/models/gltf/ferrari.glb";

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
    const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(1.15,1);t.anisotropy=8;
    return t;
  },[]);
  return <meshStandardMaterial map={texture} color="#8a512d" roughness={roughness} />;
}

function Panel({position,size,frame=false,frameColor="#8b1f1b",children}){
  return <RoundedBox args={size} radius={.025} smoothness={3} bevelSegments={3} position={position} castShadow receiveShadow>
    {children||(frame?<meshStandardMaterial color={frameColor} roughness={.31} metalness={.12}/>:<WoodMaterial/>)}
  </RoundedBox>;
}

function TVUnitModel({frameFinish="red"}){
  const frame=FRAME_FINISHES.find(x=>x.id===frameFinish)?.hex||FRAME_FINISHES[0].hex;
  return <group scale={[.95,.95,.95]}>
    <Panel position={[0,.18,0]} size={[4.8,.10,.55]}/>
    <Panel position={[0,.62,0]} size={[4.8,.11,.55]}/>
    <Panel position={[0,1.02,0]} size={[4.8,.12,.55]}/>
    <Panel position={[0,1.42,0]} size={[4.8,.11,.55]}/>
    {[[-2.28,1.75],[-.78,1.75],[.78,1.75],[2.28,1.75]].map(([x,y],i)=><Panel key={i} position={[x,y,0]} size={[.09,3.2,.11]} frame frameColor={frame}/>)}
    {[[-1.55,.80],[0,.80],[1.55,.80]].map(([x,y],i)=><Panel key={i} position={[x,y,-.30]} size={[1.40,.62,.035]}/>)}
    <Panel position={[-1.55,2.40,-.30]} size={[1.40,.06,.04]} frame frameColor="#2c190f"/>
    <Panel position={[0,2.40,-.30]} size={[1.40,.06,.04]} frame frameColor="#2c190f"/>
    <Panel position={[1.55,2.40,-.30]} size={[1.40,.06,.04]} frame frameColor="#2c190f"/>
    <Panel position={[-1.55,3.10,0]} size={[1.40,.10,.55]}/>
    <Panel position={[1.55,3.10,0]} size={[1.40,.10,.55]}/>
    {[[-2.05,2.65],[-.62,2.65],[.62,2.65],[2.05,2.65]].map(([x,y],i)=><Panel key={i} position={[x,y,-.31]} size={[1.15,1.05,.04]}/>)}
    <Panel position={[-2.30,1.75,.08]} size={[.08,3.3,.09]} frame frameColor={frame}/>
    <Panel position={[2.30,1.75,.08]} size={[.08,3.3,.09]} frame frameColor={frame}/>
    <Panel position={[-.75,3.55,.08]} size={[2.95,.10,.40]} frame frameColor={frame}/>
    <Panel position={[1.15,3.90,.08]} size={[2.10,.10,.40]} frame frameColor={frame}/>
  </group>;
}

function Television({size=55}){
  const s=size/55;
  return <group scale={[s,s,s]} position={[0,1.90,-.34]}>
    <RoundedBox args={[1.72,1.00,.06]} radius={.035} smoothness={4} bevelSegments={4} castShadow>
      <meshPhysicalMaterial color="#070707" roughness={.16} metalness={.28} clearcoat={.8}/>
      <Outlines thickness={.012} color="#26221f" screenspace/>
    </RoundedBox>
    <mesh position={[0,0,.035]}>
      <planeGeometry args={[1.57,.85]}/>
      <meshPhysicalMaterial color="#020305" roughness={.08} metalness={.04} clearcoat={1}/>
    </mesh>
    <RoundedBox args={[.65,.035,.18]} radius={.012} position={[0,-.57,.02]}>
      <meshStandardMaterial color="#191919" roughness={.3} metalness={.22}/>
    </RoundedBox>
  </group>;
}


function CarModel(){
  const {scene}=useGLTF(CAR_MODEL_URL);
  const model=useMemo(()=>{
    const clone=scene.clone(true);
    clone.traverse(obj=>{
      if(obj.isMesh){
        obj.castShadow=true;
        obj.receiveShadow=true;
        if(obj.material){
          if(obj.material.roughness!==undefined)obj.material.roughness=Math.min(obj.material.roughness,.28);
          if(obj.material.metalness!==undefined)obj.material.metalness=Math.max(obj.material.metalness,.18);
        }
      }
    });
    const box=new THREE.Box3().setFromObject(clone);
    const size=box.getSize(new THREE.Vector3());
    const center=box.getCenter(new THREE.Vector3());
    const scale=3.35/Math.max(size.x,size.y,size.z);
    clone.scale.setScalar(scale);
    clone.position.set(-center.x*scale,-box.min.y*scale,-center.z*scale);
    return clone;
  },[scene]);
  return <group rotation={[0,Math.PI,0]} position={[0,.01,0]}>{model}</group>;
}
useGLTF.preload(CAR_MODEL_URL);

function ImageProductModel(){
  const texture=useLoader(THREE.TextureLoader,"data:image/webp;base64,"+MACRAME_WEBP_BASE64);
  useEffect(()=>{
    texture.colorSpace=THREE.SRGBColorSpace;
    texture.anisotropy=8;
    texture.needsUpdate=true;
  },[texture]);
  return <group scale={[.85,.85,.85]}>
    <RoundedBox args={[1.52,2.84,.06]} radius={.04} smoothness={4} position={[0,0,-.035]} castShadow>
      <meshStandardMaterial color="#b8a997" roughness=".62"/>
    </RoundedBox>
    <mesh position={[0,0,.015]} castShadow>
      <planeGeometry args={[1.50,2.82]}/>
      <meshPhysicalMaterial map={texture} transparent alphaTest={.06} depthWrite={false} roughness=".75" side={THREE.DoubleSide}/>
    </mesh>
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
  const floorPlane=useMemo(()=>new THREE.Plane(new THREE.Vector3(0,1,0),0),[]);
  const wallPlane=useMemo(()=>new THREE.Plane(new THREE.Vector3(0,0,1),3.46),[]);
  const wallMounted=item.type==="macrame";\n  const isCar=item.type==="car";
  useCursor(hovered||selected,selected?"grab":"pointer");

  const rayToSurface=(ray)=>{
    const p=new THREE.Vector3();
    return ray.intersectPlane(wallMounted?wallPlane:floorPlane,p)?p:null;
  };

  const down=(e)=>{
    e.stopPropagation();
    const p=rayToSurface(e.ray);if(!p)return;
    drag.current=true;onDragging(true);onSelect(item.id);
    offset.current.copy(group.current.position).sub(p);
    e.target.setPointerCapture?.(e.pointerId);
  };
  const move=(e)=>{
    if(!drag.current)return;
    e.stopPropagation();
    const p=rayToSurface(e.ray);if(!p)return;
    const snap=(v,step=.05)=>Math.round(v/step)*step;
    if(wallMounted){
      const x=THREE.MathUtils.clamp(snap(p.x+offset.current.x),-3.15,3.15);
      const y=THREE.MathUtils.clamp(snap(p.y+offset.current.y),1.45,4.05);
      onMove(item.id,{x,y,z:-3.42});
      return;
    }
    const x=THREE.MathUtils.clamp(snap(p.x+offset.current.x),-3.7,3.7);
    const z=THREE.MathUtils.clamp(snap(p.z+offset.current.z),-2.65,2.65);
    onMove(item.id,{x,z});
  };
  const up=(e)=>{drag.current=false;onDragging(false);e.stopPropagation();};

  const content=item.type==="tvunit"?<TVUnitModel frameFinish={item.frameFinish||"red"}/>:item.type==="television"?<Television size={item.tvSize||55}/>:item.type==="macrame"?<ImageProductModel/>:item.type==="car"?<CarModel/>:<GenericModel type={item.type}/>;

  return <group ref={group} position={[item.x,wallMounted?(item.y||2.65):0,wallMounted?-3.42:item.z]} rotation={[0,item.rotation||0,0]}>
    <group onPointerOver={e=>{e.stopPropagation();setHovered(true)}} onPointerOut={e=>{e.stopPropagation();setHovered(false)}}
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onClick={e=>{e.stopPropagation();onSelect(item.id)}}>
      {content}
      <mesh visible={false} position={[0,wallMounted?0:1.8,0]} onPointerDown={down} onPointerMove={move} onPointerUp={up}>
        <boxGeometry args={wallMounted?[1.9,3.2,.28]:[5.0,3.9,1.0]}/><meshBasicMaterial transparent opacity={0} depthWrite={false}/>
      </mesh>
      {selected&&!wallMounted&&<mesh rotation={[-Math.PI/2,0,0]} position={[0,.006,0]}>
        <ringGeometry args={[1.70,1.76,64]}/><meshBasicMaterial color="#c49a62" transparent opacity={.82}/>
      </mesh>}
      {selected&&wallMounted&&<mesh position={[0,0,.065]}>
        <planeGeometry args={[1.68,3.0]}/><meshBasicMaterial color="#c49a62" transparent opacity={.09} side={THREE.DoubleSide}/>
      </mesh>}
    </group>
  </group>;
}

function CameraDirector({view,wallMounted}){
  const {camera,controls}=useThree();
  useEffect(()=>{
    if(!controls)return;
    const p=wallMounted?{
      "3d":[5.8,3.45,5.4,[0,2.4,-2.9]],
      "front":[0,2.65,5.5,[0,2.5,-3.42]],
      "top":[0,7.2,-2.5,[0,2.4,-3.0]]
    }:{
      "3d":[7.2,4.8,8.2,[0,1.6,0]],
      "front":[0,2.3,8.4,[0,1.4,0]],
      "top":[0,8.2,.1,[0,0,0]]
    }[view]||null;
    if(!p)return;
    camera.position.set(p[0],p[1],p[2]);
    controls.target.set(...p[3]);
    controls.minDistance=wallMounted?2.6:4;
    controls.maxDistance=wallMounted?10:14;
    controls.update();
  },[view,wallMounted,controls,camera]);
  return null;
}

function RoomScene({room,furniture,selectedId,setSelectedId,moveFurniture,view,onDragging}){
  const wallMounted=furniture.some(x=>x.type==="macrame");
  const content=<>{furniture.map(item=><ProductObject key={item.id} item={item} selected={item.id===selectedId} onSelect={setSelectedId} onMove={moveFurniture} onDragging={onDragging}/>)}</>;
  return <Canvas shadows dpr={[1,1.75]} camera={{position:[7.2,4.8,8.2],fov:40}}
    gl={{antialias:true,powerPreference:"high-performance",toneMapping:THREE.ACESFilmicToneMapping,toneMappingExposure:1.05}}
    onPointerMissed={()=>setSelectedId(null)}>
    <color attach="background" args={["#e9e4dc"]}/>
    <ambientLight intensity={1.25}/>
    <hemisphereLight intensity={.9} groundColor="#a79d90" color="#fffaf1"/>
    <spotLight position={[-4,7,4]} angle={.45} penumbra={.8} intensity={1.7} castShadow/>
    <directionalLight position={[4,8,5]} intensity={2.5} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048}/>
    <Environment preset="studio"/>
    <mesh receiveShadow rotation={[-Math.PI/2,0,0]} position={[0,0,0]}><planeGeometry args={[9,7]}/><meshStandardMaterial color="#8b8278" roughness={.88}/></mesh>
    <mesh position={[0,2.8,-3.5]} receiveShadow><boxGeometry args={[9,5.6,.10]}/><meshStandardMaterial color="#f2eee7" roughness={.96}/></mesh>
    <mesh position={[-4.5,2.8,0]} receiveShadow rotation={[0,Math.PI/2,0]}><boxGeometry args={[7,5.6,.10]}/><meshStandardMaterial color="#eeeae2" roughness={.96}/></mesh>
    <Grid args={[9,7]} position={[0,.006,0]} cellSize={.5} cellThickness={.25} sectionSize={1} sectionThickness={.5} fadeDistance={10} fadeStrength={1.2} infiniteGrid={false}/>
    <Html position={[-4.2,5,-3.4]} transform occlude><div className="scene-label">EFIVE • {room}</div></Html>
    <ContactShadows position={[0,0,0]} opacity={.26} scale={9} blur={2.4} far={7}/>
    {furniture.length?<Bounds fit clip observe margin={wallMounted?1.35:1.10} maxDuration={.6}>{content}</Bounds>:null}
    <OrbitControls makeDefault enableDamping dampingFactor={.075} minDistance={wallMounted?2.6:4} maxDistance={wallMounted?10:14} maxPolarAngle={Math.PI/2.03} minPolarAngle={.25}/>
    <CameraDirector view={view} wallMounted={wallMounted}/>
  </Canvas>;
}

function initialItem(type,price){
  const base={id:"f"+Date.now()+Math.random().toString(16).slice(2),type,name:CATALOG.find(x=>x.type===type)?.name||type,x:0,z:-.6,y:2.65,rotation:0,price};
  if(type==="tvunit")base.frameFinish="red";
  if(type==="television")base.tvSize=55;
  if(type==="macrame"){base.wallMounted=true;base.z=-3.42;}
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

  useEffect(()=>{try{const s=JSON.parse(localStorage.getItem("efive-studio-layouts")||"{}");if(s&&typeof s==="object")setLayouts(s)}catch{}},[]);
  useEffect(()=>{if(!ROOM_TYPES[bhk].includes(room))setRoom(ROOM_TYPES[bhk][0]);setSelectedId(null)},[bhk,room]);

  const updateRoom=(next)=>{setLayouts(x=>({...x,[key]:next}));setSelectedId(next.some(x=>x.id===selectedId)?selectedId:null)};
  const add=(p)=>{
    const item=initialItem(p.type,p.price);item.name=p.name;
    if(item.type!=="macrame"){item.x=(furniture.length%3-1)*1.05;item.z=(Math.floor(furniture.length/3)*.85)-.9}
    else {item.x=0;item.y=2.65;item.z=-3.42}
    updateRoom([...furniture,item]);setSelectedId(item.id);
  };
  const moveFurniture=(id,patch)=>updateRoom(furniture.map(x=>x.id===id?{...x,...patch}:x));
  const remove=()=>{if(selected)updateRoom(furniture.filter(x=>x.id!==selected.id))};
  const rotate=(delta)=>selected&&moveFurniture(selected.id,{rotation:(selected.rotation||0)+delta});
  const changeFinish=(finish)=>selected?.type==="tvunit"&&moveFurniture(selected.id,{frameFinish:finish});
  const changeTvSize=(size)=>selected?.type==="television"&&moveFurniture(selected.id,{tvSize:size});

  useEffect(()=>{
    const keyDown=(e)=>{
      if(!selected)return;
      if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Delete","Backspace","r","R"].includes(e.key))e.preventDefault();
      const step=e.shiftKey?.25:.05;
      if(selected.type==="macrame"){
        if(e.key==="ArrowLeft")moveFurniture(selected.id,{x:selected.x-step});
        if(e.key==="ArrowRight")moveFurniture(selected.id,{x:selected.x+step});
        if(e.key==="ArrowUp")moveFurniture(selected.id,{y:(selected.y||2.65)+step});
        if(e.key==="ArrowDown")moveFurniture(selected.id,{y:(selected.y||2.65)-step});
      }else{
        if(e.key==="ArrowLeft")moveFurniture(selected.id,{x:selected.x-step});
        if(e.key==="ArrowRight")moveFurniture(selected.id,{x:selected.x+step});
        if(e.key==="ArrowUp")moveFurniture(selected.id,{z:selected.z-step});
        if(e.key==="ArrowDown")moveFurniture(selected.id,{z:selected.z+step});
      }
      if(e.key.toLowerCase()==="r")rotate(e.shiftKey?-.2618:.2618);
      if(e.key==="Delete"||e.key==="Backspace")remove();
    };
    window.addEventListener("keydown",keyDown);return()=>window.removeEventListener("keydown",keyDown);
  },[selected,furniture]);

  const save=()=>{localStorage.setItem("efive-studio-layouts",JSON.stringify(layouts));setSaved(true);setTimeout(()=>setSaved(false),1400)};
  const share=async()=>{try{await navigator.clipboard.writeText(window.location.href);alert("Design link copied!")}catch{alert("Copy this page URL to share the design.")}};

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
        <section><div className="eyebrow">FURNITURE CATALOG</div><div className="chips">{categories.map(x=><button key={x} className={category===x?"chip-active":""} onClick={()=>setCategory(x)}>{x}</button>)}</div>
          <div className="catalog">{shown.map(p=><button className="product" key={p.id} onClick={()=>add(p)}>
            <div className={"thumb "+p.type}>{p.type==="tvunit"?<span className="thumb-unit"/>:p.type==="television"?<span className="thumb-tv"/>:p.type==="macrame"?<span className="thumb-macrame"/>:<span className={"thumb-generic "+p.type}/>}</div>
            <div><b>{p.name}</b><span>₹{p.price.toLocaleString("en-IN")}</span></div><strong>＋</strong>
          </button>)}</div>
        </section>
      </aside>
      <section className="viewport">
        <div className="viewport-head"><div><div className="eyebrow">LIVE CANVAS</div><h2>{room}</h2><p>{dragging?"Release to place furniture":"Drag any product directly • Scroll to zoom • R to rotate"}</p></div><div className="view-switch">{["3d","front","top"].map(v=><button key={v} onClick={()=>setView(v)} className={view===v?"active":""}>{v==="3d"?"3D":v==="front"?"Front":"Top"}</button>)}</div></div>
        <div className="canvas-wrap"><RoomScene room={room} furniture={furniture} selectedId={selectedId} setSelectedId={setSelectedId} moveFurniture={moveFurniture} view={view} onDragging={setDragging}/></div>
        <div className="canvas-tools"><span><i/> Direct drag</span><span><i/> 5 cm snapping</span><span><i/> Wall placement</span></div>
      </section>
      <aside className="inspector">
        <div className="inspector-head"><div><div className="eyebrow">PROPERTIES</div><h2>{selected?"Selected product":"Your room"}</h2></div>{selected&&<button className="x" onClick={()=>setSelectedId(null)}>×</button>}</div>
        {selected?<div>
          <div className="selected-card"><div className={"big-thumb "+selected.type}><span className={selected.type==="tvunit"?"thumb-unit":selected.type==="television"?"thumb-tv":selected.type==="macrame"?"thumb-macrame":"thumb-generic "+selected.type}/></div><div><h3>{selected.name}</h3><p>{room}</p><strong>₹{selected.price.toLocaleString("en-IN")}</strong></div></div>
          {selected.type==="tvunit"&&<div className="control-group"><label>FRAME FINISH</label><div className="finish-row">{FRAME_FINISHES.map(f=><button key={f.id} title={f.name} style={{"--finish":f.hex}} className={selected.frameFinish===f.id?"finish-active":""} onClick={()=>changeFinish(f.id)}/>)}</div></div>}
          {selected.type==="television"&&<div className="control-group"><label>TV SIZE</label><div className="size-row">{[55,65,75].map(s=><button key={s} className={selected.tvSize===s?"active":""} onClick={()=>changeTvSize(s)}>{s}"</button>)}</div></div>}
          <div className="control-group"><label>{selected.type==="macrame"?"WALL POSITION":"POSITION"}</label><div className="control-row">{selected.type==="macrame"?<><span>X</span><input type="number" step=".05" value={selected.x.toFixed(2)} onChange={e=>moveFurniture(selected.id,{x:Number(e.target.value)})}/><span>Y</span><input type="number" step=".05" value={(selected.y||2.65).toFixed(2)} onChange={e=>moveFurniture(selected.id,{y:Number(e.target.value)})}/></>:<><span>X</span><input type="number" step=".05" value={selected.x.toFixed(2)} onChange={e=>moveFurniture(selected.id,{x:Number(e.target.value)})}/><span>Z</span><input type="number" step=".05" value={selected.z.toFixed(2)} onChange={e=>moveFurniture(selected.id,{z:Number(e.target.value)})}/></>}</div></div>
          <div className="control-group"><label>ROTATION</label><div className="rotate-row"><button onClick={()=>rotate(-Math.PI/4)}>−45°</button><div>{Math.round((selected.rotation||0)*180/Math.PI)}°</div><button onClick={()=>rotate(Math.PI/4)}>＋45°</button></div></div>
          <button className="danger" onClick={remove}>Remove from room</button>
        </div>:<div className="empty"><div className="empty-icon">✦</div><h3>Build your room</h3><p>Add a real store product, then drag it directly in the 3D room. Wall decor stays on the wall.</p></div>}
        <div className="summary"><div><span>Current room items</span><b>{furniture.length}</b></div><div><span>Home type</span><b>{bhk}</b></div><div className="total"><span>Design value</span><strong>₹{total.toLocaleString("en-IN")}</strong></div></div>
      </aside>
    </main>
  </div>;
}

createRoot(document.getElementById("root")).render(<App/>);