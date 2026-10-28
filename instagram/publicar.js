// Publica los posts de instagram/2026-11 en Instagram con la Content Publishing API.
// Acepta tokens de inicio de sesión con Facebook (EAA…, graph.facebook.com, cuenta vinculada a la página)
// o de inicio de sesión con Instagram (IG…, graph.instagram.com).
//
//   node instagram/publicar.js token                canjea el token de .env por uno que no caduca y guarda IG_USER_ID
//   node instagram/publicar.js verificar            token, cuenta y cupo diario
//   node instagram/publicar.js calendario           qué se publica cada día (según captions.md)
//   node instagram/publicar.js preparar <id>        crea los contenedores SIN publicar (prueba segura; caducan en 24 h)
//   node instagram/publicar.js publicar <id> --si   publica ese post ahora
//   node instagram/publicar.js pendientes --si      publica lo que tenga fecha <= hoy y no esté en publicados.json
//
// Variables (.env): IG_ACCESS_TOKEN, IG_USER_ID (id de la cuenta de Instagram; `token` lo completa),
// FB_APP_ID y FB_APP_SECRET (solo para `token`), IG_MEDIA_BASE (URL pública de las imágenes;
// por defecto https://mercurial.cl/instagram/2026-11/). La API descarga cada imagen desde esa URL.

const path = require('path');
const ENV = path.join(__dirname, '..', '.env');
require('dotenv').config({ path: ENV, quiet: true });
const fs = require('fs');

const TOKEN = process.env.IG_ACCESS_TOKEN;
const API = TOKEN?.startsWith('IG') ? 'https://graph.instagram.com/v23.0' : 'https://graph.facebook.com/v25.0';
const MEDIA_BASE = (process.env.IG_MEDIA_BASE || 'https://mercurial.cl/instagram/2026-11/').replace(/\/?$/, '/');
const DIR_POSTS = path.join(__dirname, '2026-11');
const REGISTRO = path.join(__dirname, 'publicados.json');
const AÑO = 2026;
const MESES = { ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5, jul: 6, ago: 7, sep: 8, oct: 9, nov: 10, dic: 11 };

async function graph(metodo, ruta, params = {}, token = TOKEN) {
  if (!token) throw new Error('Falta IG_ACCESS_TOKEN en .env');
  const url = new URL(API + ruta);
  const opciones = { method: metodo, headers: { Authorization: `Bearer ${token}` } };
  if (metodo === 'GET') Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  else opciones.body = new URLSearchParams(params);
  const r = await fetch(url, opciones);
  const datos = await r.json();
  if (!r.ok || datos.error) throw new Error(`${metodo} ${ruta}: ${datos.error?.message || r.status}`);
  return datos;
}

const espera = ms => new Promise(res => setTimeout(res, ms));

// Calendario y captions salen de captions.md: secciones "## <id> · <día> <n> <mes>" con el caption en blockquote
function leerCalendario() {
  const md = fs.readFileSync(path.join(__dirname, 'captions.md'), 'utf8').replace(/\r\n/g, '\n');
  const posts = [];
  for (const [, id, fecha, cuerpo] of md.matchAll(/^## (\d\d-[a-z0-9-]+) · \S+ (\d+ \w+)\n([\s\S]*?)(?=^## |^---)/gm)) {
    const caption = cuerpo.split('\n').filter(l => l.startsWith('>')).map(l => l.replace(/^> ?/, '')).join('\n').trim();
    const [dia, mes] = fecha.split(' ');
    posts.push({ id, fecha: new Date(AÑO, MESES[mes.slice(0, 3)], Number(dia)), caption });
  }
  return posts.sort((a, b) => a.fecha - b.fecha);
}

function imagenesDe(id) {
  const archivos = fs.readdirSync(DIR_POSTS).filter(f => f.endsWith('.jpg'));
  if (archivos.includes(`${id}.jpg`)) return [`${id}.jpg`];
  const laminas = archivos.filter(f => new RegExp(`^${id}-\\d+\\.jpg$`).test(f))
    .sort((a, b) => Number(a.match(/-(\d+)\.jpg$/)[1]) - Number(b.match(/-(\d+)\.jpg$/)[1]));
  if (!laminas.length) throw new Error(`No hay imágenes para ${id} en ${DIR_POSTS}`);
  if (laminas.length > 10) throw new Error(`${id}: un carrusel admite máximo 10 imágenes`);
  return laminas;
}

async function usuario() {
  if (process.env.IG_USER_ID) return process.env.IG_USER_ID;
  if (API.includes('instagram')) return (await graph('GET', '/me', { fields: 'user_id' })).user_id;
  throw new Error('Falta IG_USER_ID en .env (corre `node instagram/publicar.js token`)');
}

// Reemplaza o agrega VARIABLE=valor en .env sin tocar el resto del archivo
function guardarEnv(variables) {
  let texto = fs.existsSync(ENV) ? fs.readFileSync(ENV, 'utf8') : '';
  for (const [k, v] of Object.entries(variables)) {
    const linea = `${k}=${v}`;
    texto = new RegExp(`^${k}=.*$`, 'm').test(texto) ? texto.replace(new RegExp(`^${k}=.*$`, 'm'), linea) : `${texto.replace(/\n?$/, '\n')}${linea}\n`;
  }
  fs.writeFileSync(ENV, texto);
}

// Token de usuario (Explorador de la API Graph) → token de larga duración → token de la página, que no caduca.
// La cuenta de Instagram es la vinculada a esa página.
async function configurarToken() {
  if (!TOKEN?.startsWith('EAA')) throw new Error('`token` es para tokens de inicio de sesión con Facebook (EAA…)');
  const { FB_APP_ID, FB_APP_SECRET } = process.env;
  let usuarioLargo = TOKEN;
  if (FB_APP_ID && FB_APP_SECRET) {
    usuarioLargo = (await graph('GET', '/oauth/access_token', {
      grant_type: 'fb_exchange_token', client_id: FB_APP_ID, client_secret: FB_APP_SECRET, fb_exchange_token: TOKEN,
    })).access_token;
  } else {
    console.log('Sin FB_APP_ID/FB_APP_SECRET: se usa el token tal cual (el de la página caducará con él).');
  }
  const { data } = await graph('GET', '/me/accounts', { fields: 'name,access_token,instagram_business_account{id,username}' }, usuarioLargo);
  const pagina = data.find(p => p.instagram_business_account);
  if (!pagina) throw new Error('Ninguna página del token tiene una cuenta de Instagram vinculada');
  guardarEnv({ IG_ACCESS_TOKEN: pagina.access_token, IG_USER_ID: pagina.instagram_business_account.id });
  console.log(`Listo: página "${pagina.name}", Instagram @${pagina.instagram_business_account.username}. Token e IG_USER_ID guardados en .env.`);
}

async function esperarContenedor(id) {
  for (let i = 0; i < 30; i++) {
    const { status_code } = await graph('GET', `/${id}`, { fields: 'status_code' });
    if (status_code === 'FINISHED') return;
    if (status_code === 'ERROR' || status_code === 'EXPIRED') throw new Error(`Contenedor ${id}: ${status_code}`);
    await espera(3000);
  }
  throw new Error(`Contenedor ${id} no terminó de procesarse`);
}

// Crea el contenedor listo para publicar (imagen simple o carrusel) y devuelve su id
async function preparar(post) {
  const ig = await usuario();
  const imagenes = imagenesDe(post.id);
  if (imagenes.length === 1) {
    const { id } = await graph('POST', `/${ig}/media`, { image_url: MEDIA_BASE + imagenes[0], caption: post.caption });
    await esperarContenedor(id);
    return id;
  }
  const hijos = [];
  for (const img of imagenes) {
    const { id } = await graph('POST', `/${ig}/media`, { image_url: MEDIA_BASE + img, is_carousel_item: 'true' });
    hijos.push(id);
  }
  for (const h of hijos) await esperarContenedor(h);
  const { id } = await graph('POST', `/${ig}/media`, { media_type: 'CAROUSEL', children: hijos.join(','), caption: post.caption });
  await esperarContenedor(id);
  return id;
}

async function publicar(post) {
  const contenedor = await preparar(post);
  const ig = await usuario();
  const { id } = await graph('POST', `/${ig}/media_publish`, { creation_id: contenedor });
  const { permalink } = await graph('GET', `/${id}`, { fields: 'permalink' });
  const registro = fs.existsSync(REGISTRO) ? JSON.parse(fs.readFileSync(REGISTRO, 'utf8')) : {};
  registro[post.id] = { media_id: id, permalink, publicado: new Date().toISOString() };
  fs.writeFileSync(REGISTRO, JSON.stringify(registro, null, 2) + '\n');
  return { id, permalink };
}

(async () => {
  const [comando, arg] = process.argv.slice(2);
  const confirmado = process.argv.includes('--si');
  const calendario = leerCalendario();
  const buscar = id => calendario.find(p => p.id === id) || (() => { throw new Error(`No existe el post "${id}" en captions.md`); })();

  if (comando === 'token') {
    await configurarToken();
  } else if (comando === 'verificar') {
    const ig = await usuario();
    const yo = await graph('GET', `/${ig}`, { fields: 'username' });
    const cupo = await graph('GET', `/${ig}/content_publishing_limit`, { fields: 'quota_usage,config' });
    console.log(`Cuenta: @${yo.username}, id ${ig}`);
    console.log(`Publicaciones por API en las últimas 24 h: ${cupo.data?.[0]?.quota_usage ?? '?'} de ${cupo.data?.[0]?.config?.quota_total ?? '?'}`);
  } else if (comando === 'calendario') {
    for (const p of calendario) console.log(`${p.fecha.toISOString().slice(0, 10)}  ${p.id}  (${imagenesDe(p.id).length} img)`);
  } else if (comando === 'preparar') {
    console.log(`Contenedor listo (no publicado): ${await preparar(buscar(arg))}`);
  } else if (comando === 'publicar') {
    if (!confirmado) throw new Error('Publicar es público e irreversible: agrega --si para confirmar');
    const r = await publicar(buscar(arg));
    console.log(`Publicado ${arg}: ${r.permalink}`);
  } else if (comando === 'pendientes') {
    const hecho = fs.existsSync(REGISTRO) ? JSON.parse(fs.readFileSync(REGISTRO, 'utf8')) : {};
    const hoy = new Date();
    const toca = calendario.filter(p => p.fecha <= hoy && !hecho[p.id]);
    if (!toca.length) return console.log('Nada pendiente para hoy.');
    if (!confirmado) return console.log(`Pendientes (agrega --si para publicarlos): ${toca.map(p => p.id).join(', ')}`);
    for (const p of toca) console.log(`Publicado ${p.id}: ${(await publicar(p)).permalink}`);
  } else {
    console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(0, 15).join('\n'));
  }
})().catch(e => { console.error(`Error: ${e.message}`); process.exit(1); });
