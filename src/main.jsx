import React,{useMemo,useRef,useState,useEffect} from "react";
import {createRoot} from "react-dom/client";
import {Canvas,useThree} from "@react-three/fiber";
import {OrbitControls,Environment,ContactShadows,Text,Html} from "@react-three/drei";
import * as THREE from "three";
import "./style.css";

const ROOM_TYPES={
  "1 BHK":["Living Room","Bedroom","Kitchen"],
  "2 BHK":["Living Room","Master Bedroom","Bedroom 2","Kitchen","Bathroom"],
  "3 BHK":["Living Room","Master Bedroom","Bedroom 2","Bedroom 3","Kitchen","Bathroom"],
  "4 BHK":["Living Room","Master Bedroom","Bedroom 2","Bedroom 3","Bedroom 4","Kitchen","Bathroom"]
};

const CATALOG=[
  {id:"tv",name:"Modular Display TV Console",category:"TV Units",price:54999,type:"tv"},
  {id:"sofa",name:"Luna 3-Seater Sofa",category:"Sofas",price:32999,type:"sofa"},
  {id:"bed",name:"Aster Queen Bed",category:"Beds",price:41999,type:"bed"},
  {id:"table",name:"Oak Dining Table",category:"Dining",price:28999,type:"table"},
  {id:"wardrobe",name:"Linea Wardrobe",category:"Storage",price:35999,type:"wardrobe"}
];

function Box({position,scale,color,roughness=.5,metalness=0}) {
  return <mesh position={position} castShadow receiveShadow>
    <boxGeometry args={scale}/>
    <meshStandardMaterial color={color} roughness={roughness} metalness={metalness}/>
  </mesh>;
}

function ProductModel({type}) {
  if(type==="tv") return <group>
    <Box position={[-1.8,.55,0]} scale={[.35,1.1,2.8]} color="#f6f4ee"/>
    <Box position={[1.8,.55,0]} scale={[.35,1.1,2.8]} color="#f6f4ee"/>
    <Box position={[0,.52,0]} scale={[3.25,.65,.8]} color="#f6f4ee"/>
    <Box position={[0,1.45,0]} scale={[3.1,.28,.78]} color="#f6f4ee"/>
    <Box position={[-1.0,2.05,.12]} scale={[1.35,.26,.56]} color="#6b3d1f" roughness=".35"/>
    <Box position={[1.0,2.05,.12]} scale={[1.35,.26,.56]} color="#6b3d1f" roughness=".35"/>
    <Box position={[0,2.72,.08]} scale={[2.75,.22,.52]} color="#6b3d1f" roughness=".35"/>
    <Box position={[0,1.55,.38]} scale={[1.65,.08,.04]} color="#171717"/>
  </group>;
  if(type==="sofa") return <group>
    <Box position={[0,.45,0]} scale={[2.5,.55,1.05]} color="#d8d2c6" roughness=".8"/>
    <Box position={[0,1.0,-.38]} scale={[2.5,.95,.35]} color="#d8d2c6" roughness=".85"/>
    {[-.82,0,.82].map(x=><Box key={x} position={[x,.72,.02]} scale={[.7,.35,.9]} color="#b9b09f" roughness=".9"/>)}
  </group>;
  if(type==="bed") return <group>
    <Box position={[0,.3,0]} scale={[2.2,.35,3]} color="#6b3d1f" roughness=".4"/>
    <Box position={[0,.75,-1.28]} scale={[2.3,1.35,.25]} color="#6b3d1f" roughness=".4"/>
    <Box position={[0,.58,.2]} scale={[2.0,.25,2.2]} color="#f0ece3" roughness="1"/>
  </group>;
  if(type==="table") return <group>
    <Box position={[0,.9,0]} scale={[2.4,.18,1.25]} color="#6b3d1f" roughness=".45"/>
    {[-.9,.9].flatMap(x=>[-.42,.42].map(z=><Box key={x+z} position={[x,.45,z]} scale={[.18,.9,.18]} color="#3b2418" roughness=".5"/>))}
  </group>;
  return <group>
    <Box position={[0,1.15,0]} scale={[1.55,2.3,.58]} color="#f3f0e9" roughness=".6"/>
    <Box position={[0,1.15,.31]} scale={[1.35,2.05,.035]} color="#6b3d1f" roughness=".45"/>
    {[[-.45,.3,.34],[.45,.3,.34],[-.45,1.1,.34],[.45,1.1,.34]].map(([x,y,z],i)=><Box key={i} position={[x,y,z]} scale={[.08,.08,.08]} color="#d3b58a" metalness=".5" roughness=".35"/>)}
  </group>;
}

function Furniture({item,selected,onSelect,onMove}) {
  const group=useRef();
  const dragging=useRef(false);
  const offset=useRef(new THREE.Vector3());
  const plane=useMemo(()=>new THREE.Plane(new THREE.Vector3(0,1,0),0),[]);
  

  const pointerOnFloor=(ray)=>{
    const p=new THREE.Vector3();
    ray.intersectPlane(plane,p);
    return p;
  };

  const down=(e)=>{
    e.stopPropagation();
    const hit=pointerOnFloor(e.ray);
    if(!hit) return;
    dragging.current=true;
    offset.current.copy(group.current.position).sub(hit);
    e.target.setPointerCapture?.(e.pointerId);
    onSelect(item.id);
  };

  const move=(e)=>{
    if(!dragging.current) return;
    e.stopPropagation();
    const hit=pointerOnFloor(e.ray);
    if(!hit) return;
    const x=THREE.MathUtils.clamp(hit.x+offset.current.x,-3.8,3.8);
    const z=THREE.MathUtils.clamp(hit.z+offset.current.z,-2.9,2.9);
    onMove(item.id,{x,z});
  };

  const up=(e)=>{
    dragging.current=false;
    e.stopPropagation();
  };

  return <group ref={group} position={[item.x,0,item.z]} rotation={[0,item.rotation,0]}
    onPointerDown={down} onPointerMove={move} onPointerUp={up} onClick={e=>{e.stopPropagation();onSelect(item.id)}} >
    <ProductModel type={item.type}/>
    {selected && <mesh position={[0,1.55,0]} scale={[2.2,.05,2.2]}>
      <ringGeometry args={[.92,1,48]}/><meshBasicMaterial color="#caa66a" transparent opacity={.8} side={THREE.DoubleSide}/>
    </mesh>}
  </group>;
}

function RoomScene({room,furniture,selectedId,setSelectedId,moveFurniture,rotateFurniture}) {
  return <Canvas shadows camera={{position:[8,6,9],fov:42}} dpr={[1,1.8]}>
    <color attach="background" args={["#ece9e2"]}/>
    <ambientLight intensity={1.25}/>
    <directionalLight position={[5,9,4]} intensity={2.4} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048}/>
    <Environment preset="apartment"/>
    <Box position={[0,-.08,0]} scale={[9,.15,7]} color="#8c8176" roughness=".9"/>
    <mesh position={[0,2.9,-3.5]} receiveShadow><boxGeometry args={[9,5.8,.12]}/><meshStandardMaterial color="#fbfaf7" roughness="1"/></mesh>
    <mesh position={[-4.5,2.9,0]} receiveShadow rotation={[0,Math.PI/2,0]}><boxGeometry args={[7,5.8,.12]}/><meshStandardMaterial color="#f3f1ec" roughness="1"/></mesh>
    <Text position={[-4.25,5.1,-3.4]} rotation={[0,0,0]} fontSize={.26} color="#514c44" anchorX="left">EFIVE • {room}</Text>
    {furniture.map(item=><Furniture key={item.id} item={item} selected={item.id===selectedId}
      onSelect={setSelectedId} onMove={moveFurniture}/>)}
    <ContactShadows position={[0,0,0]} opacity={.28} scale={10} blur={2.5} far={7}/>
    <OrbitControls makeDefault enableDamping dampingFactor={.08} minDistance={6} maxDistance={16} maxPolarAngle={Math.PI/2.08} />
  </Canvas>;
}

function App(){
  const [bhk,setBhk]=useState("2 BHK");
  const [room,setRoom]=useState(ROOM_TYPES["2 BHK"][0]);
  const [furniture,setFurniture]=useState([{id:"f1",type:"tv",name:CATALOG[0].name,x:0,z:-1.4,rotation:0,price:54999}]);
  const [selectedId,setSelectedId]=useState("f1");
  const [category,setCategory]=useState("All");

  useEffect(()=>{setRoom(ROOM_TYPES[bhk][0]);setFurniture([]);setSelectedId(null)},[bhk]);

  const visibleRooms=ROOM_TYPES[bhk];
  const categories=["All",...new Set(CATALOG.map(x=>x.category))];
  const shown=category==="All"?CATALOG:CATALOG.filter(x=>x.category===category);
  const selected=furniture.find(x=>x.id===selectedId)||null;
  const total=furniture.reduce((s,x)=>s+x.price,0);

  const add=(p)=>{
    const id="f"+Date.now();
    setFurniture(f=>[...f,{id,type:p.type,name:p.name,x:(Math.random()-.5)*4,z:(Math.random()-.5)*3,rotation:0,price:p.price}]);
    setSelectedId(id);
  };
  const moveFurniture=(id,{x,z})=>setFurniture(f=>f.map(x=>x.id===id?{...x,x,z}:x));
  const rotate=(delta)=>selected&&setFurniture(f=>f.map(x=>x.id===selected.id?{...x,rotation:x.rotation+delta}:x));
  const remove=()=>selected&&setFurniture(f=>f.filter(x=>x.id!==selected.id));

  useEffect(()=>{
    const key=(e)=>{
      if(!selected) return;
      const step=e.shiftKey?.25:.08;
      if(e.key==="ArrowLeft") moveFurniture(selected.id,{x:selected.x-step,z:selected.z});
      if(e.key==="ArrowRight") moveFurniture(selected.id,{x:selected.x+step,z:selected.z});
      if(e.key==="ArrowUp") moveFurniture(selected.id,{x:selected.x,z:selected.z-step});
      if(e.key==="ArrowDown") moveFurniture(selected.id,{x:selected.x,z:selected.z+step});
      if(e.key.toLowerCase()==="r") rotate(e.shiftKey?-.2618:.2618);
      if(e.key==="Delete"||e.key==="Backspace") remove();
    };
    window.addEventListener("keydown",key);return()=>window.removeEventListener("keydown",key);
  },[selected]);

  return <div className="app">
    <header className="topbar">
      <div className="brand"><span className="dot"/>EFIVE <small>STUDIO</small></div>
      <div className="headline">3D Room Designer</div>
      <div className="top-actions"><button className="ghost">Save</button><button className="primary">Share Design</button></div>
    </header>

    <main className="workspace">
      <aside className="sidebar">
        <section><div className="eyebrow">HOME TYPE</div><div className="seg">{Object.keys(ROOM_TYPES).map(x=><button key={x} className={bhk===x?"active":""} onClick={()=>setBhk(x)}>{x}</button>)}</div></section>
        <section><div className="eyebrow">ROOMS</div><div className="rooms">{visibleRooms.map(x=><button key={x} className={room===x?"room-active":""} onClick={()=>setRoom(x)}><span>{x}</span><span>›</span></button>)}</div></section>
        <section><div className="eyebrow">FURNITURE</div><div className="chips">{categories.map(x=><button key={x} className={category===x?"chip-active":""} onClick={()=>setCategory(x)}>{x}</button>)}</div>
          <div className="catalog">{shown.map(p=><button className="product" key={p.id} onClick={()=>add(p)}><div className={"thumb "+p.type}><div className="thumb-art">{p.type==="tv"?"TV":p.type==="sofa"?"SOFA":p.type==="bed"?"BED":p.type==="table"?"TABLE":"WARDROBE"}</div></div><div><b>{p.name}</b><span>₹{p.price.toLocaleString("en-IN")}</span></div><strong>＋</strong></button>)}</div>
        </section>
      </aside>

      <section className="viewport">
        <div className="viewport-head"><div><b>{room}</b><span>Drag furniture directly • Scroll to zoom • R to rotate</span></div><div className="view-pill">LIVE 3D</div></div>
        <div className="canvas-wrap"><RoomScene room={room} furniture={furniture} selectedId={selectedId} setSelectedId={setSelectedId} moveFurniture={moveFurniture} rotateFurniture={rotate}/></div>
        <div className="hint"><span className="kbd">Drag</span> Move <span className="kbd">R</span> Rotate <span className="kbd">Delete</span> Remove</div>
      </section>

      <aside className="inspector">
        <div className="inspector-head"><div className="eyebrow">SELECTED PRODUCT</div>{selected&&<button className="x" onClick={()=>setSelectedId(null)}>×</button>}</div>
        {selected?<><div className="selected-card"><div className={"big-thumb "+selected.type}><div className="thumb-art">{selected.type==="tv"?"TV":selected.type==="sofa"?"SOFA":selected.type==="bed"?"BED":selected.type==="table"?"TABLE":"WARDROBE"}</div></div><div><h3>{selected.name}</h3><p>Placed in {room}</p><strong>₹{selected.price.toLocaleString("en-IN")}</strong></div></div>
          <div className="control-group"><label>POSITION</label><div className="control-row"><span>X</span><input type="number" value={selected.x.toFixed(2)} step=".05" onChange={e=>moveFurniture(selected.id,{x:Number(e.target.value),z:selected.z})}/><span>Z</span><input type="number" value={selected.z.toFixed(2)} step=".05" onChange={e=>moveFurniture(selected.id,{x:selected.x,z:Number(e.target.value)})}/></div></div>
          <div className="control-group"><label>ROTATION</label><div className="rotate-row"><button onClick={()=>rotate(-Math.PI/4)}>−45°</button><div>{Math.round(selected.rotation*180/Math.PI)}°</div><button onClick={()=>rotate(Math.PI/4)}>＋45°</button></div></div>
          <button className="danger" onClick={remove}>Remove from room</button></>
          :<div className="empty"><div className="empty-icon">✦</div><h3>Select a product</h3><p>Add furniture from the catalog or click any item in the room.</p></div>}
        <div className="summary"><div><span>Items</span><b>{furniture.length}</b></div><div><span>Room</span><b>{room}</b></div><div className="total"><span>Estimated total</span><strong>₹{total.toLocaleString("en-IN")}</strong></div></div>
      </aside>
    </main>
  </div>;
}
createRoot(document.getElementById("root")).render(<App/>);