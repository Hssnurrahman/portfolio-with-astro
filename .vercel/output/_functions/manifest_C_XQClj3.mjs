import 'piccolore';
import { q as decodeKey } from './chunks/astro/server_BzEW0nd2.mjs';
import 'clsx';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/astro-designed-error-pages_Cs5gChQV.mjs';
import 'es-module-lexer';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///home/hassan/Documents/portfolio-with-astro/","cacheDir":"file:///home/hassan/Documents/portfolio-with-astro/node_modules/.astro/","outDir":"file:///home/hassan/Documents/portfolio-with-astro/dist/","srcDir":"file:///home/hassan/Documents/portfolio-with-astro/src/","publicDir":"file:///home/hassan/Documents/portfolio-with-astro/public/","buildClientDir":"file:///home/hassan/Documents/portfolio-with-astro/dist/client/","buildServerDir":"file:///home/hassan/Documents/portfolio-with-astro/dist/server/","adapterName":"@astrojs/vercel","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image\\/?$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/send-email","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/send-email\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"send-email","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/send-email.ts","pathname":"/api/send-email","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/index.DVs_vCAD.css"}],"routeData":{"route":"/ledgerflow","isIndex":true,"type":"page","pattern":"^\\/ledgerflow\\/?$","segments":[[{"content":"ledgerflow","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/ledgerflow/index.astro","pathname":"/ledgerflow","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/index.B0BogV2O.css"},{"type":"external","src":"/_astro/index.DVs_vCAD.css"}],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"site":"https://hssan.dev","base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["/home/hassan/Documents/portfolio-with-astro/src/pages/ledgerflow/index.astro",{"propagation":"none","containsHead":true}],["/home/hassan/Documents/portfolio-with-astro/src/pages/index.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000noop-middleware":"_noop-middleware.mjs","\u0000virtual:astro:actions/noop-entrypoint":"noop-entrypoint.mjs","\u0000@astro-page:src/pages/api/send-email@_@ts":"pages/api/send-email.astro.mjs","\u0000@astro-page:src/pages/ledgerflow/index@_@astro":"pages/ledgerflow.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"pages/_image.astro.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_C_XQClj3.mjs","/home/hassan/Documents/portfolio-with-astro/node_modules/astro/dist/assets/services/sharp.js":"chunks/sharp_sDjaQZji.mjs","/home/hassan/Documents/portfolio-with-astro/src/components/About.astro?astro&type=script&index=0&lang.ts":"_astro/About.astro_astro_type_script_index_0_lang.BBmg1W8u.js","/home/hassan/Documents/portfolio-with-astro/src/components/Contact.astro?astro&type=script&index=0&lang.ts":"_astro/Contact.astro_astro_type_script_index_0_lang.DjTFcFTZ.js","/home/hassan/Documents/portfolio-with-astro/src/components/Landing.astro?astro&type=script&index=0&lang.ts":"_astro/Landing.astro_astro_type_script_index_0_lang.DRX5Bm5B.js","/home/hassan/Documents/portfolio-with-astro/src/components/Projects.astro?astro&type=script&index=0&lang.ts":"_astro/Projects.astro_astro_type_script_index_0_lang.B_FJ_BmH.js","/home/hassan/Documents/portfolio-with-astro/src/components/Skills.astro?astro&type=script&index=0&lang.ts":"_astro/Skills.astro_astro_type_script_index_0_lang.DTsAC-69.js","/home/hassan/Documents/portfolio-with-astro/src/components/Header.astro?astro&type=script&index=0&lang.ts":"_astro/Header.astro_astro_type_script_index_0_lang.C1y-SPUR.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[["/home/hassan/Documents/portfolio-with-astro/src/components/About.astro?astro&type=script&index=0&lang.ts","const o=document.querySelectorAll(\"[data-about-reveal]\");if(\"IntersectionObserver\"in window&&o.length){const e=new IntersectionObserver(t=>{t.forEach(r=>{r.isIntersecting&&(r.target.dataset.visible=\"true\",e.unobserve(r.target))})},{threshold:.15,rootMargin:\"0px 0px -10% 0px\"});o.forEach(t=>e.observe(t))}else o.forEach(e=>e.dataset.visible=\"true\");"],["/home/hassan/Documents/portfolio-with-astro/src/components/Contact.astro?astro&type=script&index=0&lang.ts","const c=document.querySelectorAll(\"[data-contact-reveal]\");if(\"IntersectionObserver\"in window&&c.length){const t=new IntersectionObserver(e=>{e.forEach(n=>{n.isIntersecting&&(n.target.dataset.visible=\"true\",t.unobserve(n.target))})},{threshold:.15,rootMargin:\"0px 0px -10% 0px\"});c.forEach(e=>t.observe(e))}else c.forEach(t=>t.dataset.visible=\"true\");const i=document.getElementById(\"contact-form\"),m=document.getElementById(\"submit-button\"),u=document.getElementById(\"button-text\"),f=document.getElementById(\"button-loading\"),r=document.getElementById(\"form-error\"),o=document.getElementById(\"form-success\"),h=document.getElementById(\"reset-form\"),g=document.getElementById(\"message\"),d=document.getElementById(\"message-counter\");g&&d&&g.addEventListener(\"input\",()=>{d.textContent=`${g.value.length} / 2000`});function v(t){return i?.querySelector(`[name=\"${t}\"]`)}function s(t,e){const a=v(t)?.closest(\".field\"),l=a?.querySelector(\".field-error\");!a||!l||(e?(a.dataset.invalid=\"true\",l.textContent=e):(a.dataset.invalid=\"false\",l.textContent=\"\"))}function b(t){let e=!0;t.name.trim()?s(\"name\",null):(s(\"name\",\"Please enter your name\"),e=!1);const n=/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(t.email);return t.email.trim()?n?s(\"email\",null):(s(\"email\",\"That doesn't look like a valid email\"),e=!1):(s(\"email\",\"Please enter your email\"),e=!1),t.subject.trim()?s(\"subject\",null):(s(\"subject\",\"Please add a subject\"),e=!1),t.message.trim()?t.message.trim().length<10?(s(\"message\",\"A bit more detail, please (10+ chars)\"),e=!1):s(\"message\",null):(s(\"message\",\"Please write a short message\"),e=!1),e}i?.addEventListener(\"submit\",async t=>{if(t.preventDefault(),!m||!u||!f||!r||!o)return;const e=new FormData(i);if(e.get(\"website\")?.length){o.classList.remove(\"hidden\");return}const n={name:(e.get(\"name\")??\"\").trim(),email:(e.get(\"email\")??\"\").trim(),subject:(e.get(\"subject\")??\"\").trim(),message:(e.get(\"message\")??\"\").trim()};if(b(n)){m.disabled=!0,u.classList.add(\"hidden\"),f.classList.remove(\"hidden\"),r.classList.add(\"hidden\");try{const a=await fetch(\"/api/send-email\",{method:\"POST\",headers:{\"Content-Type\":\"application/json\"},body:JSON.stringify(n)}),l=await a.json().catch(()=>({}));a.ok?(i.reset(),d&&(d.textContent=\"0 / 2000\"),o.classList.remove(\"hidden\")):(r.textContent=l.error||\"Failed to send message. Please try again.\",r.classList.remove(\"hidden\"))}catch(a){console.error(\"Error:\",a),r&&(r.textContent=\"Couldn't reach the server. Please try again or email me directly.\",r.classList.remove(\"hidden\"))}finally{m.disabled=!1,u.classList.remove(\"hidden\"),f.classList.add(\"hidden\")}}});h?.addEventListener(\"click\",()=>{o?.classList.add(\"hidden\"),i?.querySelectorAll(\".field\").forEach(t=>{t.dataset.invalid=\"false\"})});i?.querySelectorAll(\"input[name], textarea[name]\").forEach(t=>{t.addEventListener(\"input\",()=>{const e=t.closest(\".field\");e?.dataset.invalid===\"true\"&&(e.dataset.invalid=\"false\")})});"],["/home/hassan/Documents/portfolio-with-astro/src/components/Landing.astro?astro&type=script&index=0&lang.ts","const i=document.getElementById(\"role-rotator\");if(i){const s=JSON.parse(i.dataset.roles??\"[]\"),l=window.matchMedia(\"(prefers-reduced-motion: reduce)\").matches,c=s[0];if(s.length>1&&!l&&c){let r=0,e=c.length,n=\"pause\";const t=()=>{const o=s[r];if(o){if(n===\"pause\"){n=\"deleting\",setTimeout(t,1600);return}if(n===\"deleting\"){e=Math.max(0,e-1),i.textContent=o.slice(0,e),e===0?(r=(r+1)%s.length,n=\"typing\",setTimeout(t,180)):setTimeout(t,35);return}e+=1,i.textContent=o.slice(0,e),e===o.length?(n=\"pause\",setTimeout(t,60)):setTimeout(t,70)}};setTimeout(t,1800)}}"],["/home/hassan/Documents/portfolio-with-astro/src/components/Projects.astro?astro&type=script&index=0&lang.ts","const o=document.querySelectorAll(\".filter-btn\"),a=document.querySelectorAll(\".project-card\"),l=document.getElementById(\"projects-empty\");function n(e){let s=0;a.forEach(t=>{const i=e===\"All\"||t.dataset.category===e;t.dataset.hidden=i?\"false\":\"true\",i&&(s+=1)}),l&&l.classList.toggle(\"hidden\",s>0);let r=0;a.forEach(t=>{if(t.dataset.hidden===\"true\"){t.dataset.visible=\"false\";return}t.dataset.visible=\"false\";const i=r*60;r+=1,requestAnimationFrame(()=>{setTimeout(()=>{t.dataset.visible=\"true\"},i)})})}o.forEach(e=>{e.addEventListener(\"click\",()=>{const s=e.dataset.filter??\"All\";o.forEach(r=>r.setAttribute(\"aria-selected\",r===e?\"true\":\"false\")),n(s)})});if(\"IntersectionObserver\"in window&&a.length){const e=new IntersectionObserver(s=>{s.forEach(r=>{if(r.isIntersecting){const t=r.target,i=Array.from(a).indexOf(t);setTimeout(()=>{t.dataset.visible=\"true\"},i*60),e.unobserve(t)}})},{threshold:.1});a.forEach(s=>e.observe(s))}else a.forEach(e=>e.dataset.visible=\"true\");"],["/home/hassan/Documents/portfolio-with-astro/src/components/Skills.astro?astro&type=script&index=0&lang.ts","const s=document.querySelectorAll(\"[data-skill-card]\");if(\"IntersectionObserver\"in window&&s.length){const e=new IntersectionObserver(r=>{r.forEach(t=>{t.isIntersecting&&(t.target.dataset.visible=\"true\",e.unobserve(t.target))})},{threshold:.15,rootMargin:\"0px 0px -10% 0px\"});s.forEach(r=>e.observe(r))}else s.forEach(e=>e.dataset.visible=\"true\");"],["/home/hassan/Documents/portfolio-with-astro/src/components/Header.astro?astro&type=script&index=0&lang.ts","const y=document.getElementById(\"site-header\"),v=y?.querySelector(\"[data-shell]\"),r=document.getElementById(\"mobile-menu-button\"),i=document.getElementById(\"mobile-menu\"),g=document.querySelectorAll(\"[data-nav-link]\"),w=document.querySelectorAll(\"[data-mobile-link]\"),d=y?.querySelector('nav[aria-label=\"Primary\"]'),n=document.getElementById(\"nav-pill\"),s=Array.from(new Set(Array.from(g).map(e=>e.getAttribute(\"href\")).filter(e=>!!e)));function u(e){g.forEach(t=>{t.dataset.active=t.getAttribute(\"href\")===e?\"true\":\"false\"}),a()}function a(){if(!n||!d)return;const e=d.querySelector('[data-nav-link][data-active=\"true\"]');if(!e){n.style.opacity=\"0\";return}const t=d.getBoundingClientRect(),o=e.getBoundingClientRect();n.style.opacity=\"1\",n.style.left=`${o.left-t.left}px`,n.style.top=`${o.top-t.top}px`,n.style.width=`${o.width}px`,n.style.height=`${o.height}px`}function m(){if(!v)return;if(v.dataset.scrolled=window.scrollY>8?\"true\":\"false\",window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-4){const t=s[s.length-1];t&&u(t)}}function l(e){!i||!r||(i.dataset.open=e?\"true\":\"false\",r.setAttribute(\"aria-expanded\",e?\"true\":\"false\"))}r?.addEventListener(\"click\",()=>{const e=i?.dataset.open===\"true\";l(!e)});w.forEach(e=>{e.addEventListener(\"click\",()=>l(!1))});document.addEventListener(\"click\",e=>{if(i?.dataset.open!==\"true\")return;const t=e.target;!i.contains(t)&&!r?.contains(t)&&l(!1)});document.addEventListener(\"keydown\",e=>{e.key===\"Escape\"&&l(!1)});const h=document.querySelectorAll(\"section[id]\");if(h.length&&\"IntersectionObserver\"in window){const e=new IntersectionObserver(t=>{if(window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-4)return;const f=t.filter(c=>c.isIntersecting).sort((c,p)=>p.intersectionRatio-c.intersectionRatio)[0];f&&u(`#${f.target.id}`)},{rootMargin:\"-40% 0px -55% 0px\",threshold:[0,.25,.5,.75,1]});h.forEach(t=>e.observe(t))}s[0]&&window.scrollY<200&&u(s[0]);requestAnimationFrame(()=>a());m();window.addEventListener(\"scroll\",m,{passive:!0});window.addEventListener(\"resize\",()=>{a(),m()},{passive:!0});\"fonts\"in document&&document.fonts.ready?.then(()=>a());"]],"assets":["/_astro/index.DVs_vCAD.css","/_astro/index.B0BogV2O.css","/android-chrome-192x192.png","/android-chrome-512x512.png","/apple-touch-icon.png","/favicon-16x16.png","/favicon-32x32.png","/favicon.ico","/ledgerflow-icon.png","/site.webmanifest"],"buildFormat":"directory","checkOrigin":true,"allowedDomains":[],"actionBodySizeLimit":1048576,"serverIslandNameMap":[],"key":"avb44C15QHBpc5YV+qKuo18xg0tSkJct9O4TWJdaH3c="});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = null;

export { manifest };
