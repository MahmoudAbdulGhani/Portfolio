import { writeFileSync, mkdirSync } from 'node:fs';
import * as THREE from 'three';
import { buildLaptopModel } from '../../src/lib/laptop-model.ts';
import { laptopPose, LAPTOP, LAPTOP_FRAMES } from '../../src/lib/laptop-motion.ts';
const model=buildLaptopModel();model.root.updateMatrixWorld(true);
const meshes=[];
model.root.traverse(o=>{if(!o.isMesh)return;const g=o.geometry; const pos=g.getAttribute('position'),norm=g.getAttribute('normal'),indices=g.index?Array.from(g.index.array):Array.from({length:pos.count},(_,i)=>i);
 const vertices=[],normals=[]; const v=new THREE.Vector3(),n=new THREE.Vector3(); const nm=new THREE.Matrix3().getNormalMatrix(o.matrixWorld);
 for(let i=0;i<pos.count;i++){v.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);n.fromBufferAttribute(norm,i).applyMatrix3(nm).normalize();vertices.push(v.toArray());normals.push(n.toArray());}
 let h=o.parent, lid=false;while(h){if(h===model.hinge)lid=true;h=h.parent;}
 meshes.push({name:o.name,lid,vertices,normals,indices,color:o.material.color.toArray(),metalness:o.material.metalness??0,roughness:o.material.roughness??.5});
});
mkdirSync('public/projects/cinematic/laptop',{recursive:true});
writeFileSync('scripts/laptop-assets/model-data.json',JSON.stringify({meshes,labels:model.labels,hinge:model.hinge.position.toArray(),screen:LAPTOP,poses:LAPTOP_FRAMES.map(p=>laptopPose(p,false))}));
console.log('Authored model:',meshes.length,'meshes;',meshes.reduce((s,m)=>s+m.indices.length/3,0),'triangles');
