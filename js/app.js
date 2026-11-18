const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],page=document.body.dataset.page;
const load=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))||d}catch(e){return d}},save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
let services=load("services",SERVICES),projects=load("projects",PROJECTS),admin=localStorage.getItem("admin")=="1";
const fmt=n=>Number(n).toLocaleString("uk-UA")+" ₴",dur=d=>d>=60?Math.floor(d/60)+" год"+(d%60?" "+d%60+" хв":""):d+" хв";
const NAV=[["index.html","Головна"],["services.html","Послуги"],["portfolio.html","Портфоліо"],["booking.html","Запис"]];
document.body.insertAdjacentHTML("afterbegin",`<header><div class="wrap"><a class="logo" href="index.html">Lumen<span>.</span>studio</a><nav>${NAV.map(n=>`<a href="${n[0]}" class="${n[0]==page?"on":""}">${n[1]}</a>`).join("")}</nav><div class="hr"><button class="btn s ${admin?"on":""}" id="adm">${admin?"🔓 Адмін":"🔒 Адмін"}</button><a class="btn d s" href="booking.html">Записатись</a></div></div></header>`);
document.body.insertAdjacentHTML("beforeend",`<footer><div class="wrap"><div><div class="logo" style="color:#fff">Lumen<span>.</span>studio</div><p style="margin-top:10px">Фотостудія в Києві: портрети, сімейні та предметні зйомки.</p></div><div><h5>СТОРІНКИ</h5>${NAV.map(n=>`<a href="${n[0]}">${n[1]}</a>`).join("")}</div><div><h5>КОНТАКТИ</h5><p>вул. Хрещатик, 22, Київ<br>+380 44 555 12 34<br>hello@lumen.studio</p></div></div></footer><div class="toast" id="toast"></div><div class="modal" id="modal"><div class="mbox" id="mbox"></div></div>`);
$("#adm").onclick=()=>{localStorage.setItem("admin",admin?"0":"1");location.reload()};
const toast=m=>{const t=$("#toast");t.textContent=m;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2600)};
const openM=h=>{$("#mbox").className="mbox";$("#mbox").innerHTML=`<button class="x">×</button>`+h;$("#modal").classList.add("show")},closeM=()=>$("#modal").classList.remove("show");
$("#modal").onclick=e=>{if(e.target.id=="modal"||e.target.classList.contains("x"))closeM()};
document.addEventListener("keydown",e=>{if(e.key=="Escape")closeM()});
// ---- універсальна форма додавання/редагування
function openForm(title,fields,v,onSave){
openM(`<form class="fm" novalidate><h2>${title}</h2>${fields.map(f=>`<label>${f.l}${f.req?" *":""}</label>${f.t=="select"?`<select name="${f.k}">${f.o.map(o=>`<option ${o==v[f.k]?"selected":""}>${o}</option>`).join("")}</select>`:f.t=="area"?`<textarea name="${f.k}" rows="3">${v[f.k]||""}</textarea>`:f.t=="photo"?`<input name="${f.k}" value="${v[f.k]||""}" placeholder="Посилання (images/..., https://...)"><input type="file" accept="image/*" style="margin-top:8px"><img src="${v[f.k]||""}" style="max-height:110px;margin-top:8px;border-radius:6px">`:`<input name="${f.k}" type="${f.t||"text"}" value="${v[f.k]??""}">`}<div class="err"></div>`).join("")}<br><button class="btn d">Зберегти</button></form>`);
const fm=$(".fm"),pi=fm.querySelector('input[type=file]');
if(pi)pi.onchange=()=>{const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const c=document.createElement("canvas"),k=Math.min(1,900/im.width);c.width=im.width*k;c.height=im.height*k;c.getContext("2d").drawImage(im,0,0,c.width,c.height);const u=c.toDataURL("image/jpeg",.8);fm.querySelector('[name=photo]').value=u;fm.querySelector("img").src=u};im.src=r.result};r.readAsDataURL(pi.files[0])};
fm.onsubmit=e=>{e.preventDefault();let ok=true,o={};fields.forEach(f=>{const el=fm.elements[f.k];let val=el.value.trim();const bad=f.req&&!val||f.t=="number"&&(val===""||+val<=0);el.parentNode.querySelectorAll(".err")[0];const er=[...fm.querySelectorAll(".err")][fields.indexOf(f)];er.textContent=bad?"Заповніть коректно":"";if(bad)ok=false;o[f.k]=f.t=="number"?+val:val});if(!ok)return;onSave(o);closeM()}}
// ---- картки
const sCard=s=>`<article class="card"><div class="ph"><img src="${s.photo}" alt="${s.name}" loading="lazy"><span class="tag">${s.cat.split(" ")[0]}</span></div><div class="cb"><h3>${s.name}</h3><p>${s.desc}</p><ul class="meta"><li>⏱ ${dur(s.dur)}</li><li>📷 ${s.count} фото</li><li>📍 ${s.place}</li></ul><div class="row"><b>${fmt(s.price)}</b><span><button class="btn s" data-a="view" data-id="${s.id}">Детальніше</button> <a class="btn d s" href="booking.html?service=${s.id}">Записатись</a></span></div>${admin?`<div class="adm"><button data-a="edit" data-id="${s.id}">✎ Редагувати</button><button data-a="del" data-id="${s.id}">🗑 Видалити</button></div>`:""}</div></article>`;
const pCard=p=>`<div class="pj" data-a="lb" data-id="${p.id}"><img src="${p.photo}" alt="${p.title}" loading="lazy"><div class="cap"><small>${p.cat}</small><br>${p.title}</div>${admin?`<div class="adm"><button data-a="edit" data-id="${p.id}">✎</button><button data-a="del" data-id="${p.id}">🗑</button></div>`:""}</div>`;
const SF=[{k:"name",l:"Назва",req:1},{k:"cat",l:"Категорія",t:"select",o:CATS},{k:"photo",l:"Фото",t:"photo",req:1},{k:"desc",l:"Опис",t:"area",req:1},{k:"dur",l:"Тривалість (хв)",t:"number"},{k:"count",l:"Кількість фото",t:"number"},{k:"place",l:"Місце проведення",req:1},{k:"price",l:"Вартість (₴)",t:"number"}];
const PF=[{k:"title",l:"Назва проєкту",req:1},{k:"cat",l:"Категорія",t:"select",o:CATS},{k:"photo",l:"Фото",t:"photo",req:1},{k:"desc",l:"Опис",t:"area",req:1}];
// CRUD для списку (services / projects)
function crud(name,list,F,title,rerender,extra){return e=>{const b=e.target.closest("[data-a]");if(!b)return;const a=b.dataset.a,id=+b.dataset.id,arr=name=="services"?services:projects,it=arr.find(x=>x.id==id);
if(a=="del"){e.stopPropagation();if(confirm("Видалити «"+(it.name||it.title)+"»?")){const i=arr.indexOf(it);arr.splice(i,1);save(name,arr);rerender();toast("Видалено")}}
else if(a=="edit"){e.stopPropagation();openForm("Редагування",F,it,o=>{Object.assign(it,o);save(name,arr);rerender();toast("Збережено")})}
else extra&&extra(a,it)}}
const addBtn=(name,F,t,rerender,def)=>{const b=$("#add");if(!b)return;b.style.display=admin?"inline-block":"none";b.onclick=()=>{const arr=name=="services"?services:projects;openForm(t,F,def,o=>{o.id=Date.now();arr.push(o);save(name,arr);rerender();toast("Додано")})}};
// ---- головна
if($("#cats")){$("#cats").innerHTML=CATS.map((c,i)=>{const s=services.find(x=>x.cat==c);return `<a class="cat" href="services.html?cat=${i}"><img src="${s?s.photo:""}" alt=""><div><h3>${c}</h3><small>${services.filter(x=>x.cat==c).length} послуг →</small></div></a>`}).join("");
$("#pop").innerHTML=CATS.map(c=>services.find(x=>x.cat==c)).filter(Boolean).map(sCard).join("");$("#pv").innerHTML=projects.slice(0,6).map(pCard).join("");
$("#pop").onclick=e=>{const b=e.target.closest("[data-a=view]");if(b)location.href="services.html"};$("#pv").onclick=()=>location.href="portfolio.html"}
// ---- послуги
if($("#grid")){let cat="Усі",dF="all",pF="all";const p=new URLSearchParams(location.search).get("cat");if(p!==null&&CATS[p])cat=CATS[p];
const R={dur:{s:d=>d<=60,m:d=>d>60&&d<=120,l:d=>d>120},pr:{a:x=>x<=2000,b:x=>x>2000&&x<=4000,c:x=>x>4000}};
function render(){const q=$("#q").value.trim().toLowerCase(),sr=$("#sort").value;
let a=services.filter(s=>(cat=="Усі"||s.cat==cat)&&s.name.toLowerCase().includes(q)&&(dF=="all"||R.dur[dF](s.dur))&&(pF=="all"||R.pr[pF](s.price)));
if(sr=="pa")a.sort((x,y)=>x.price-y.price);if(sr=="pd")a.sort((x,y)=>y.price-x.price);if(sr=="az")a.sort((x,y)=>x.name.localeCompare(y.name,"uk"));
$("#grid").innerHTML=a.map(sCard).join("");$("#empty").style.display=a.length?"none":"block";$("#count").textContent=`Знайдено послуг: ${a.length} з ${services.length}`;
$$("#chips .btn").forEach(c=>c.classList.toggle("on",c.dataset.c==cat))}
$("#chips").innerHTML=["Усі",...CATS].map(c=>`<button class="btn s" data-c="${c}">${c}</button>`).join("");
$("#chips").onclick=e=>{if(e.target.dataset.c){cat=e.target.dataset.c;render()}};
$("#q").oninput=$("#sort").onchange=render;$("#dF").onchange=e=>{dF=e.target.value;render()};$("#pF").onchange=e=>{pF=e.target.value;render()};
$("#reset").onclick=()=>{$("#q").value="";$("#sort").value="def";$("#dF").value=$("#pF").value="all";cat="Усі";dF=pF="all";render()};
$("#grid").onclick=crud("services",services,SF,"",render,(a,s)=>{if(a!="view")return;const ex=projects.filter(x=>x.cat==s.cat).slice(0,4);
openM(`<div class="det"><img src="${s.photo}" alt=""><div class="in"><span class="eye">${s.cat}</span><h2>${s.name}</h2><p style="color:var(--mut)">${s.desc}</p><table><tr><td>Тривалість</td><td>${dur(s.dur)}</td></tr><tr><td>Кількість фото</td><td>${s.count}</td></tr><tr><td>Місце</td><td>${s.place}</td></tr><tr><td>Вартість</td><td>${fmt(s.price)}</td></tr></table><small class="eye">Приклади робіт</small><div class="thumbs">${ex.map(x=>`<img src="${x.photo}" alt="${x.title}">`).join("")}</div><a class="btn a" href="booking.html?service=${s.id}">Записатись на зйомку</a></div></div>`)});
addBtn("services",SF,"Нова послуга",render,{cat:CATS[0],dur:60,count:15,price:1500,photo:"images/photo-1.jpg"});
$("#rst").style.display=admin?"inline-block":"none";$("#rst").onclick=()=>{if(confirm("Скинути всі дані до початкових?")){localStorage.removeItem("services");localStorage.removeItem("projects");location.reload()}};render()}
// ---- портфоліо
if($("#pg")){let cat="Усі",cur=0,list=[];
function render(){list=projects.filter(p=>cat=="Усі"||p.cat==cat);$("#pg").innerHTML=list.map(pCard).join("");$("#empty").style.display=list.length?"none":"block";$$("#chips .btn").forEach(c=>c.classList.toggle("on",c.dataset.c==cat))}
$("#chips").innerHTML=["Усі",...CATS].map(c=>`<button class="btn s" data-c="${c}">${c}</button>`).join("");$("#chips").onclick=e=>{if(e.target.dataset.c){cat=e.target.dataset.c;render()}};
const show=()=>{const p=list[cur];openM(`<div style="text-align:center;color:#fff"><img src="${p.photo}" style="max-height:72vh;margin:auto;border-radius:6px"><h3 style="margin-top:12px">${p.title}</h3><p>${p.desc}</p><button class="btn s" id="pv" style="color:#fff;border-color:#fff">‹</button> <button class="btn s" id="nx" style="color:#fff;border-color:#fff">›</button></div>`);$("#mbox").style.background="none";$("#mbox").querySelector(".x").style.color="#fff";$("#pv").onclick=()=>{cur=(cur+list.length-1)%list.length;show()};$("#nx").onclick=()=>{cur=(cur+1)%list.length;show()}};
$("#pg").onclick=crud("projects",projects,PF,"",render,(a,p)=>{if(a=="lb"){cur=list.indexOf(p);show()}});
document.addEventListener("keydown",e=>{if(!$("#modal").classList.contains("show")||!$("#nx"))return;if(e.key=="ArrowRight")$("#nx").click();if(e.key=="ArrowLeft")$("#pv").click()});
addBtn("projects",PF,"Новий проєкт",render,{cat:CATS[0],photo:"images/photo-1.jpg"});render()}
// ---- запис
if($("#bf")){const sel=$("#svc");sel.innerHTML=`<option value="">— оберіть послугу —</option>`+CATS.map(c=>`<optgroup label="${c}">${services.filter(s=>s.cat==c).map(s=>`<option value="${s.id}">${s.name} — ${fmt(s.price)}</option>`).join("")}</optgroup>`).join("");
const pre=new URLSearchParams(location.search).get("service");if(pre)sel.value=pre;
$("#date").min=new Date().toISOString().slice(0,10);
const sum=()=>{const s=services.find(x=>x.id==sel.value);$("#sum").innerHTML=s?`<h3>${s.name}</h3><p>${s.cat}</p><p>⏱ ${dur(s.dur)} · 📷 ${s.count} фото<br>📍 ${s.place}</p><br><b>${fmt(s.price)}</b>`:`<h3>Ваша зйомка</h3><p>Оберіть послугу, щоб побачити деталі.</p>`};sel.onchange=sum;sum();
const list=()=>{const b=load("bookings",[]);$("#bl").innerHTML=b.length?b.map((x,i)=>`<div class="bk"><span>${x.date} ${x.time} · ${x.service} · ${x.name}</span><button data-i="${i}">Скасувати</button></div>`).join(""):`<p style="color:var(--mut)">Заявок поки немає.</p>`};
$("#bl").onclick=e=>{if(e.target.dataset.i===undefined)return;const b=load("bookings",[]);b.splice(+e.target.dataset.i,1);save("bookings",b);list()};list();
$("#bf").onsubmit=e=>{e.preventDefault();let ok=true;const f=e.target.elements;
const chk=(el,good,t)=>{const er=el.parentNode.querySelector(".err");er.textContent=good?"":t;if(!good)ok=false};
chk(f.name,f.name.value.trim().length>=2,"Введіть ім'я");chk(f.phone,/^[+\d][\d\s()-]{8,}$/.test(f.phone.value.trim()),"Введіть коректний телефон");chk(f.email,/^\S+@\S+\.\S+$/.test(f.email.value),"Введіть коректний email");chk(f.svc,!!f.svc.value,"Оберіть послугу");chk(f.date,!!f.date.value,"Оберіть дату");
if(!ok)return;const s=services.find(x=>x.id==f.svc.value),b=load("bookings",[]);b.push({name:f.name.value,phone:f.phone.value,email:f.email.value,service:s.name,date:f.date.value,time:f.time.value,note:f.note.value});save("bookings",b);e.target.reset();sum();list();toast("Дякуємо! Ми зателефонуємо для підтвердження.")}}
