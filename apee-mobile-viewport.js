/* APEE · Evitar ampliação acidental no Safari móvel, sem alterar o layout desktop. */
(()=>{'use strict';
const mobile=()=>matchMedia('(max-width:760px), (hover:none) and (pointer:coarse)').matches;
const block=(e)=>{if(mobile())e.preventDefault()};
for(const type of ['gesturestart','gesturechange'])document.addEventListener(type,block,{passive:false,capture:true});
document.addEventListener('touchmove',e=>{if(mobile()&&e.touches.length>1)e.preventDefault()},{passive:false,capture:true});
document.addEventListener('touchstart',e=>{if(mobile()&&e.touches.length>1)e.preventDefault()},{passive:false,capture:true});
document.addEventListener('dblclick',e=>{if(mobile()&&!e.target.closest('input,textarea,select'))e.preventDefault()},{passive:false,capture:true});
const style=document.createElement('style');
style.textContent='@media(max-width:760px){html,body,.mobile-bottom-nav,.apee-assistente{touch-action:pan-x pan-y!important}html,body{overscroll-behavior-x:none!important}.apee-assistente[data-open="true"]{overscroll-behavior:contain!important}}@media(hover:none) and (pointer:coarse){html,body,.mobile-bottom-nav,.apee-assistente{touch-action:pan-x pan-y!important}html,body{overscroll-behavior-x:none!important}}';
document.head.appendChild(style);
})();
