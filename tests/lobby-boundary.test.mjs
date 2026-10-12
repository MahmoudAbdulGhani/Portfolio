import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {transpileModule} from 'typescript';
import vm from 'node:vm';
import {evaluateLobbyCall,initialLobby,lobbyCallPermission,lobbyReducer as reduce} from '../src/components/landscape/lobby-boundary-state.ts';

test('teaching gate agrees with the original inspected call method under isolated database stubs',async()=>{
  const fixture=JSON.parse(await readFile(new URL('./fixtures/lobby-call-authorization.json',import.meta.url),'utf8'));
  const js=transpileModule(`class ObservedService { ${fixture.method} }; ObservedService`,{compilerOptions:{target:99}}).outputText;
  class Denied extends Error {}
  const Service=vm.runInNewContext(js,{NotFoundException:Denied,ForbiddenException:Denied,GoneException:Denied,Date});
  for(const row of [
    {roomExists:true,activeMember:true,roomActive:true,roomExpired:false},
    {roomExists:false,activeMember:false,roomActive:false,roomExpired:true},
    {roomExists:true,activeMember:false,roomActive:true,roomExpired:false},
    {roomExists:true,activeMember:false,roomActive:false,roomExpired:true},
    {roomExists:true,activeMember:true,roomActive:false,roomExpired:false},
    {roomExists:true,activeMember:true,roomActive:true,roomExpired:true},
  ]){
    const service=new Service(),queries=[];
    service.supabase={client:{schema(name){assert.equal(name,'guest');return{from(table){const chain={select(){return chain;},eq(...args){queries.push(args);return chain;},is(...args){queries.push(args);return chain;},async maybeSingle(){return{error:null,data:table==='channels'?row.roomExists?{status:row.roomActive?'active':'closed',expires_at:new Date(Date.now()+(row.roomExpired?-60000:60000)).toISOString()}:null:row.activeMember?{id:'sample-member'}:null};}};return chain;}};}}};
    let allowed=true;try{await service.authorizeMembership('sample-user','sample-room');}catch(e){assert.ok(e instanceof Denied);allowed=false;}
    assert.equal(evaluateLobbyCall(row).allowed,allowed);
    assert.ok(queries.some(q=>q[0]==='left_at'&&q[1]===null));assert.ok(queries.some(q=>q[0]==='removed_at'&&q[1]===null));
  }
});

test('guest call gate follows the inspected rule and rejection order',()=>{
  const valid={roomExists:true,activeMember:true,roomActive:true,roomExpired:false};
  assert.equal(evaluateLobbyCall(valid).allowed,true);
  assert.match(evaluateLobbyCall({...valid,roomExists:false,activeMember:false}).reason,/not found/);
  assert.match(evaluateLobbyCall({...valid,activeMember:false,roomExpired:true}).reason,/membership/);
  for(const patch of [{roomActive:false},{roomExpired:true}])assert.match(evaluateLobbyCall({...valid,...patch}).reason,/no longer active/);
});
test('an invitation alone gives no call access; denied attempts never create membership',()=>{
  const initial=initialLobby(),denied=reduce(initial,{type:'attempt'});
  assert.equal(denied.phase,'denied');assert.equal(denied.members,initial.members);
  assert.equal(lobbyCallPermission(denied).allowed,false);
  assert.match(denied.announcement,/contents are unchanged/);
});
test('joining changes membership, not the result of an earlier call attempt; explicit retry permits access',()=>{
  const denied=reduce(initialLobby(),{type:'attempt'}),joined=reduce(denied,{type:'join'});
  assert.deepEqual(joined.members,['mira']);assert.equal(joined.phase,'joined');
  assert.equal(lobbyCallPermission(joined).allowed,true);
  assert.equal(reduce(joined,{type:'attempt'}).phase,'allowed');
  assert.deepEqual(reduce(joined,{type:'join'}).members,['mira']);
});
test('a room block rejects joining before membership changes, even with a valid code',()=>{
  let state=reduce(reduce(initialLobby(),{type:'join'}),{type:'participant',participant:'rowan'});
  const members=state.members;
  state=reduce(state,{type:'join'});assert.equal(state.phase,'rejected');assert.equal(state.members,members);
  assert.match(state.announcement,/blocked/);assert.deepEqual(state.members,['mira']);
  state=reduce(state,{type:'attempt'});assert.equal(state.phase,'denied');assert.equal(state.members,members);
  state=reduce(state,{type:'participant',participant:'mira'});assert.equal(state.phase,'inspect');assert.equal(lobbyCallPermission(state).allowed,true);
});
test('Reset clears every local transition; no asynchronous state can restore an obsolete result',()=>{
  let state=initialLobby();
  for(const action of [{type:'attempt'},{type:'join'},{type:'attempt'},{type:'participant',participant:'rowan'},{type:'join'},{type:'attempt'}]){
    state=reduce(state,action);const reset=reduce(state,{type:'reset'});
    assert.deepEqual(reset.members,[]);assert.equal(reset.participant,'mira');assert.equal(reset.phase,'inspect');assert.equal(lobbyCallPermission(reset).allowed,false);
  }
});
