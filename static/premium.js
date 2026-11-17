
/* MemberShip AI V1.6: two actual working views, shared recommendation state. */
(function(){
'use strict';
const photos={
 hotel:'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=85&fit=crop&auto=format',
 hotel2:'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&q=85&fit=crop&auto=format',
 cinema:'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&q=85&fit=crop&auto=format',
 popcorn:'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=900&q=85&fit=crop&auto=format'
};
let view='consumer';
const pillState=x=>x&&x.saving>0&&['use','claim','potential'].includes(x.state);
function fmtPrice(n){return '¥'+Number(n||0).toFixed(2).replace(/\.00$/,'');}
function sceneObject(k){return last?.items?.find(x=>x.scene===k);}
function picture(k,cls=''){return '<img class="'+cls+'" src="'+photos[k]+'" alt="'+(k.startsWith('hotel')?'酒店客房实景氛围参考图':'影院环境实景氛围参考图')+'" loading="lazy" referrerpolicy="no-referrer">';}
function addBadge(text){return '<span class="goldpill">'+esc(text)+'</span>';}
const previousSceneCard=sceneCard;
sceneCard=function(k){
 const x=sceneObject(k),o=data[k],s=selectionValid(k)?selections[k]:null;
 const caption=s?s.name:({hotel:'查看酒店与可选房型',movie:'挑选电影场次与座位',food:'查看外卖消费方案',refund:'查看退票费用与权益'})[k];
 const pictureMarkup=k==='hotel'?picture('hotel'):k==='movie'?picture('cinema'):'<span>'+({food:'🍜',refund:'✈'}[k])+'</span>';
 const price=o.price-(pillState(x)?x.saving:0);
 return '<div class="scene-card"><div class="scene-art '+k+'">'+pictureMarkup+'</div><div class="scene-copy"><b>'+sceneNames[k]+(s?'<span class="state use">已选择</span>':'')+'</b><small>'+esc(caption)+'</small><span class="scene-price">'+fmtPrice(price)+'</span></div><button type="button" data-go="book_'+k+'">'+(s?'更换':'去选择')+' ›</button></div>';
};
const previousHotel=hotelPage;
hotelPage=function(){
 return previousHotel().replace(hotelArt,picture('hotel','real-cover'));
};
const previousMovie=moviePage;
moviePage=function(){
 return previousMovie().replace(movieArt,picture('cinema','real-cover'));
};
function journeyStep(num,name,action,active){
 return '<button type="button" data-show-action="'+action+'" class="'+(active?'active':'')+'"><b>'+num+'</b>'+name+'</button>';
}
function journeyCurrent(){
 if(screen==='book_hotel')return 2;
 if(screen==='book_movie'||screen==='movie_seats')return 3;
 if(screen==='review'||screen==='done')return 4;
 return 1;
}
function currentName(k){return selectionValid(k)?selections[k].name:k==='hotel'?'湖畔精品酒店 · 豪华大床房':k==='movie'?'周末光影 · 选择场次':'查看本次消费';}
function renderShowcase(){
 const showcase=document.getElementById('showcase');if(!showcase)return;
 if(!last){
  showcase.innerHTML='<h2>你的周末消费计划</h2><p class="summarysub">输入消费需求，开始匹配会员权益</p>';
  return;
 }
 const scenesFound=last.intent.scenes||[];
 const hotelFound=scenesFound.includes('hotel'),movieFound=scenesFound.includes('movie');
 const hx=sceneObject('hotel'),mx=sceneObject('movie');
 const hotelSavings=hotelFound&&pillState(hx)?hx.saving:0;
 const movieSavings=movieFound&&pillState(mx)?mx.saving:0;
 const budget=last.intent.budget;
 const budgetLabel=budget===null?'未设置预算':last.after<=budget?'✓ 预算内':'超预算 '+fmtPrice(last.after-budget);
 const hotelSelected=selectionValid('hotel'),movieSelected=selectionValid('movie');
 showcase.innerHTML=
 '<div class="preview-tag">MEMBERSHIP AI / CONSUMER JOURNEY · 可交互概念产品</div>'+
 '<h2>杭州周末消费全流程</h2>'+
 '<p class="summarysub">先满足用户真实需求，再匹配可用的88VIP权益；点击任一卡片进入对应页面。</p>'+
 '<div class="journey">'+journeyStep(1,'AI理解需求','result',journeyCurrent()===1)+journeyStep(2,'酒店选择','book_hotel',journeyCurrent()===2)+journeyStep(3,'电影购票','book_movie',journeyCurrent()===3)+journeyStep(4,'确认方案','review',journeyCurrent()===4)+'</div>'+
 '<div class="showcase-grid">'+
 '<article class="show-card"><span class="num">01</span><h3>AI理解需求</h3>'+
 '<div style="background:#fff4e9;border-radius:12px;padding:14px;margin:12px 0 10px;min-height:145px"><div class="hint">你提出的消费需求</div><p style="font-size:15px;font-weight:650;line-height:1.65;margin:6px 0">'+esc(document.getElementById('query').value)+'</p></div>'+
 '<div class="hint">本次识别：'+(scenesFound.map(k=>sceneNames[k]).join('、')||'待识别')+' · '+last.intent.people+'人</div>'+
 '<button type="button" class="show-btn" data-show-action="result">修改消费需求 ›</button></article>'+
 '<article class="show-card"><span class="num">02</span><h3>酒店选择</h3>'+picture('hotel','show-image')+
 '<b style="font-size:14px">'+(hotelFound?esc(currentName('hotel')):'本次未识别住宿需求')+'</b>'+
 '<div class="show-kv"><span class="hint">'+(hotelSelected?'房型已选 · 可取消':'查看酒店与真实质感房型展示')+'</span><span class="price">'+(hotelFound?fmtPrice(data.hotel.price):'—')+'</span></div>'+
 (hotelFound?addBadge('88VIP 早餐权益 · '+(hotelSavings?'预计省 '+fmtPrice(hotelSavings):'资格待确认')):'')+
 '<button type="button" class="show-btn" data-show-action="'+(hotelFound?'book_hotel':'result')+'">'+(hotelFound?'选择 / 更换房型':'返回修改需求')+' ›</button></article>'+
 '<article class="show-card"><span class="num">03</span><h3>电影购票</h3>'+picture('cinema','show-image')+
 '<b style="font-size:14px">'+(movieFound?esc(currentName('movie')):'本次未识别观影需求')+'</b>'+
 '<div class="show-kv"><span class="hint">'+(movieSelected?'场次及座位已选':'选择场次与座位')+'</span><span class="price">'+(movieFound?fmtPrice(data.movie.price):'—')+'</span></div>'+
 (movieFound?addBadge('88VIP 观影券 · '+(movieSavings?'预计省 '+fmtPrice(movieSavings):'资格待确认')):'')+
 '<button type="button" class="show-btn" data-show-action="'+(movieFound?'book_movie':'result')+'">'+(movieFound?'选座购票':'返回修改需求')+' ›</button></article>'+
 '<article class="show-card"><span class="num">04</span><h3>确认消费方案</h3>'+
 '<div style="background:#fffbf5;border-radius:12px;padding:14px;margin:12px 0"><div class="show-kv"><span class="hint">消费方案原价</span><b>'+fmtPrice(last.before)+'</b></div>'+
 '<div class="show-kv"><span class="hint">会员权益预估</span><b style="color:#188559">−'+fmtPrice(last.saving)+'</b></div>'+
 (!last.member?'<div class="show-kv"><span class="hint">模拟会员年费</span><b>+'+fmtPrice(last.fee)+'</b></div>':'')+
 '<div class="show-kv" style="border-top:1px solid #ebdecf;padding-top:10px"><b>预计合计</b><span class="big">'+fmtPrice(last.after)+'</span></div>'+
 '<div class="hint" style="color:'+(budget!==null&&last.after>budget?'#bd5738':'#188559')+'">'+budgetLabel+'</div></div>'+
 '<div class="hint">订单仅为演示，不产生实际交易。</div><button type="button" class="show-btn" data-show-action="review">进入方案确认 ›</button></article>'+
 '</div>'+
 '<div class="summary-panel"><h3>会员权益真正改变了什么？</h3><div class="show-kv"><span>用户当前方案</span><span>'+fmtPrice(last.before)+'</span></div>'+
 '<div class="show-kv"><span>本次可获得的权益价值（模拟）</span><span>'+fmtPrice(last.saving)+'</span></div>'+
 '<div class="show-kv"><span>优化后的预计支出</span><strong>'+fmtPrice(last.after)+'</strong></div>'+
 '<div class="quiet-note">展示金额由后台规则计算，权益资格和合作商家供给尚未接入真实平台。</div></div>';
}
function updateAdmin(){
 const el=document.getElementById('adminStats');if(!el)return;
 const v=last,eligible=v?.items?.filter(x=>pillState(x)).length||0,unknown=v?.items?.filter(x=>x.state==='unknown').length||0;
 const metrics=[
  ['本次场景数量',String(v?.intent?.scenes?.length??0),'仅当前模拟任务'],
  ['可匹配权益',eligible+' 项','按当前演示资格计算'],
  ['本次权益价值',fmtPrice(v?.saving??0),'模拟金额，非经营收入'],
  ['待核验权益',unknown+' 项','需人工或真实接口核验']
 ];
 el.innerHTML=metrics.map(x=>'<div class="admin-stat"><small>'+x[0]+'</small><strong>'+x[1]+'</strong><span>'+x[2]+'</span></div>').join('');
}
function syncView(){
 document.body.dataset.view=view;
 document.querySelectorAll('.view-switch button').forEach(btn=>{const active=btn.dataset.view===view;btn.setAttribute('aria-selected',String(active));btn.tabIndex=active?0:-1;});
 if(view==='admin')updateAdmin();else renderShowcase();
}
const previousRender=render;
render=function(){previousRender();renderShowcase();updateAdmin();};
document.querySelectorAll('.view-switch button').forEach(b=>b.addEventListener('click',()=>{view=b.dataset.view;syncView();}));
document.getElementById('showcase')?.addEventListener('click',e=>{
 const b=e.target.closest('[data-show-action]');if(!b)return;
 const action=b.dataset.showAction;
 if(action==='book_hotel'&&!last?.intent?.scenes.includes('hotel'))return go('result');
 if(action==='book_movie'&&!last?.intent?.scenes.includes('movie'))return go('result');
 go(action);
});
syncView();
})();
