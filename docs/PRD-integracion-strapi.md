# PRD — Integración de Strapi como CMS headless en GiGi Energy

> **Resumen:** todo el contenido de la landing (textos, imágenes, sabores, navegación, footer y SEO) pasó de estar hardcodeado en los componentes de React a gestionarse desde **Strapi 5**. La página se arma con **bloques reordenables** (page builder), se renderiza en el servidor con **Next.js 16** y se mantiene estática con **ISR + revalidación por webhook**.

| Campo | Valor |
|-------|-------|
| Estado | Implementado y verificado en local |
| Stack | Next.js 16.0 (App Router, React 19) · Strapi 5.56 · SQLite (dev) / Postgres (prod) |
| Alcance | Landing única (`/`), contenido global, catálogo de sabores |
| Fuera de alcance | Preview de borradores, i18n, e-commerce, newsletter real |

---

## 1. Problema y objetivo

### Problema

- Cada texto, imagen y sabor vivía como constante dentro de los componentes (`hero-section.tsx`, `flavor-carousel.tsx`, etc.).
- Cambiar un copy o agregar un sabor requería un desarrollador, un commit y un deploy.
- Los colores por sabor eran clases de Tailwind fijas (`from-[#84cc16]/20`), imposibles de cambiar sin tocar código.

### Objetivo

Que el equipo de marketing pueda **editar, reordenar y publicar** contenido sin intervención técnica, manteniendo el diseño, las animaciones y el rendimiento estático del sitio.

### Métricas de éxito

| Métrica | Objetivo | Resultado |
|---------|----------|-----------|
| Cambio de copy sin deploy | Sí | ✅ Publicar en Strapi → visible en el sitio |
| Agregar un sabor sin código | Sí | ✅ Nuevo `Flavor` + relación en el carrusel |
| Página sigue siendo estática | `○ /` en el build | ✅ `/` prerenderizada |
| Paridad visual con el diseño original | 100% | ✅ Verificado con capturas |
| El frontend funciona sin CMS | Sí | ✅ Fallback a `content/default-content.json` |

---

## 2. Usuarios y casos de uso

| Usuario | Necesita | Cómo lo resuelve la integración |
|---------|----------|--------------------------------|
| Editor de contenido | Cambiar textos, CTAs e imágenes | Content Manager de Strapi |
| Marketing | Lanzar un sabor nuevo | Colección `Flavor` + carrusel con orden manual |
| Marketing | Reordenar/ocultar secciones | Dynamic zone `blocks` en `Landing page` |
| SEO | Editar title/description/OG | Componente `shared.seo` (global y por página) |
| Desarrollador | Trabajar sin levantar el CMS | Fallback local cuando `STRAPI_URL` está vacío |

---

## 3. Arquitectura

### 3.1 Vista general (headless)

```mermaid
flowchart LR
  subgraph Editores
    E[Editor / Marketing]
  end

  subgraph CMS["cms/ — Strapi 5"]
    A[Admin Panel]
    API[REST API /api/*]
    ML[(Media Library<br/>public/uploads)]
    DB[(SQLite dev<br/>Postgres prod)]
    WH[Webhooks]
    A --> DB
    A --> ML
    API --> DB
    API --> ML
  end

  subgraph Web["raíz — Next.js 16"]
    SC[Server Components<br/>app/page.tsx]
    DL[Capa de datos<br/>lib/strapi/*]
    CACHE[(Data Cache<br/>tag: strapi)]
    RV[Route Handler<br/>/api/revalidate]
    CC[Client Components<br/>animaciones framer-motion]
    SC --> DL --> CACHE
    SC -->|props serializables| CC
  end

  U[Visitante]

  E --> A
  DL -->|fetch + qs populate| API
  WH -->|POST + Bearer secret| RV
  RV -->|revalidateTag| CACHE
  U -->|HTML estático| SC
  U -->|imágenes| ML
```

### 3.2 Estructura del repositorio

```text
/                         → Next.js (frontend)
├── app/
│   ├── page.tsx              Server Component: obtiene datos y renderiza bloques
│   └── api/revalidate/       Webhook de Strapi → invalida caché
├── components/
│   ├── block-renderer.tsx    __component de Strapi → componente React
│   └── *-section.tsx         Secciones, ahora reciben props
├── lib/
│   ├── strapi/
│   │   ├── client.ts         fetch, token, caché, errores
│   │   ├── queries.ts        populate por bloque (fragmentos `on`)
│   │   ├── media.ts          URLs de media absolutas (solo servidor)
│   │   ├── fallback.ts       contenido local si no hay CMS
│   │   └── types.ts          contrato de datos
│   └── icons.ts              nombre de ícono (string) → Lucide
├── content/default-content.json   Fuente única: seed + fallback
└── cms/                  → Strapi 5 (backend de contenido)
    ├── config/               server, db, cors, upload, plugins
    ├── src/api/              flavor, global, landing-page
    ├── src/components/       shared, elements, layout, blocks
    ├── src/index.js          bootstrap: permisos públicos de lectura
    └── scripts/seed.js       carga inicial de contenido e imágenes
```

### 3.3 Capas del frontend

```mermaid
flowchart TB
  P["app/page.tsx<br/>(Server Component, async)"]
  Q["queries.ts<br/>getGlobal() · getLandingPage()"]
  C["client.ts<br/>strapiFetch()"]
  F["fallback.ts"]
  M["media.ts<br/>withAbsoluteMediaUrls()"]
  BR["BlockRenderer"]
  S["Secciones 'use client'<br/>Hero · FlavorCarousel · BentoGrid<br/>Activations · Social · Nav · Footer"]

  P --> Q
  Q -->|STRAPI_URL definido| C --> M
  Q -->|STRAPI_URL vacío| F
  P --> BR --> S
```

**Regla clave:** solo el servidor habla con Strapi. Los componentes cliente reciben datos planos y URLs ya absolutas, por lo que el navegador nunca necesita variables de entorno del CMS.

---

## 4. Modelo de contenido

### 4.1 Tipos de contenido

| Tipo | Clase | Draft & Publish | Propósito |
|------|-------|-----------------|-----------|
| `landing-page` | Single type | Sí | Home construida con bloques |
| `global` | Single type | No | SEO por defecto, navegación, footer |
| `flavor` | Collection type | Sí | Catálogo de sabores |

### 4.2 Diagrama entidad-relación

```mermaid
erDiagram
  LANDING_PAGE ||--o| SEO : seo
  LANDING_PAGE ||--o{ BLOCK : "blocks (dynamic zone)"
  GLOBAL ||--o| SEO : defaultSeo
  GLOBAL ||--o{ LINK : navLinks
  GLOBAL ||--o| LINK : navCta
  GLOBAL ||--o| FOOTER : footer
  FOOTER ||--o{ LINK_GROUP : linkGroups
  LINK_GROUP ||--o{ LINK : links
  FLAVOR ||--o{ TAG : badges
  FLAVOR ||--|| MEDIA : image

  BLOCK {
    string __component "hero | flavor-carousel | features-grid | activations | social-feed"
  }
  FLAVOR {
    string name
    uid slug
    string tagline
    text description
    string accentColor "hex validado"
    boolean isMystery
    string ctaLabel
  }
  LINK {
    string label
    string href
    boolean isExternal
  }
```

### 4.3 Bloques de la dynamic zone

```mermaid
flowchart LR
  DZ[blocks] --> H[blocks.hero]
  DZ --> FC[blocks.flavor-carousel]
  DZ --> FG[blocks.features-grid]
  DZ --> AC[blocks.activations]
  DZ --> SF[blocks.social-feed]

  H --> H1[eyebrow · title · highlightedTitle · subtitle]
  H --> H2[primaryCta · secondaryCta: shared.link]
  H --> H3[benefits: shared.tag x N]
  H --> H4[image: media]

  FC --> FC1[flavors: relación → Flavor, orden manual]
  FG --> FG1[items: elements.feature x N<br/>icon · value · label · accentColor]
  AC --> AC1[items: elements.activation x N<br/>icon · title · description · cta]
  SF --> SF1[posts: elements.social-post x N<br/>image · likes · url]
  SF --> SF2[cta: shared.link]
```

### 4.4 Decisiones de modelado

| Decisión | Motivo |
|----------|--------|
| Título dividido en `title` + `highlightedTitle` | El diseño resalta la segunda línea en verde; evita parsear HTML o markdown. |
| Íconos como `enumeration` | El editor elige de una lista cerrada; el frontend lo mapea a Lucide en `lib/icons.ts`. |
| Colores como `string` con regex `^#[0-9A-Fa-f]{6}$` | Evita valores inválidos sin instalar el plugin color-picker. |
| Listas de textos como componente `shared.tag` repetible | Strapi no tiene arrays de strings; el componente es editable y reordenable. |
| El carrusel referencia sabores por relación | Un sabor se edita en un solo lugar y el carrusel define cuáles y en qué orden. |

---

## 5. Flujos

### 5.1 Flujo editorial (publicar un cambio)

```mermaid
flowchart TD
  A[Editor modifica contenido en Strapi] --> B{¿Publica?}
  B -->|Guardar como borrador| C[Solo visible en el admin]
  B -->|Publish| D[Strapi persiste la versión publicada]
  D --> E{Entorno}
  E -->|Producción| F[Webhook → POST /api/revalidate]
  F --> G[revalidateTag 'strapi', 'max']
  G --> H[Siguiente visita regenera la página en background]
  E -->|Desarrollo| I[Sin caché: el próximo reload ya lo muestra]
```

### 5.2 Selección de origen de datos

```mermaid
flowchart TD
  R[Request a /] --> Q{¿STRAPI_URL definido?}
  Q -->|No| FB[Usar content/default-content.json]
  Q -->|Sí| FE[fetch a Strapi]
  FE --> OK{¿Respuesta OK?}
  OK -->|Sí| N[Normalizar URLs de media] --> RENDER[Render]
  OK -->|No| ERR[Lanzar StrapiError]
  ERR --> ISR[ISR conserva la última versión buena]
  FB --> RENDER
```

**Por qué no hay fallback silencioso cuando Strapi falla:** si el CMS está configurado pero cae, lanzar el error hace que Next siga sirviendo la última página válida. Un fallback silencioso reemplazaría el contenido real por el contenido inicial.

### 5.3 Render de bloques

```mermaid
flowchart LR
  B[blocks del CMS] --> SW{__component}
  SW -->|blocks.hero| H[HeroSection]
  SW -->|blocks.flavor-carousel| F[FlavorCarousel]
  SW -->|blocks.features-grid| G[BentoGrid]
  SW -->|blocks.activations| A[ActivationsSection]
  SW -->|blocks.social-feed| S[SocialSection]
  SW -->|desconocido| X[null — se omite sin romper la página]
```

---

## 6. Diagramas de secuencia

### 6.1 Visita a la página (producción, ISR)

```mermaid
sequenceDiagram
  autonumber
  actor U as Visitante
  participant N as Next.js (Server)
  participant DC as Data Cache
  participant S as Strapi API
  participant ML as Media Library

  U->>N: GET /
  N->>DC: ¿global y landing-page en caché?
  alt Caché válida
    DC-->>N: datos cacheados
  else Caché vacía o vencida
    N->>S: GET /api/global?populate=...
    N->>S: GET /api/landing-page?populate[blocks][on]...
    S-->>N: JSON (data)
    N->>N: withAbsoluteMediaUrls()
    N->>DC: guardar (tags: strapi, strapi:path)
  end
  N->>N: generateMetadata() con SEO del CMS
  N-->>U: HTML + props serializados
  U->>ML: GET /uploads/*.png|jpg
  ML-->>U: imágenes
  Note over U: Hidratan los componentes cliente<br/>(framer-motion, Lenis)
```

### 6.2 Publicación con revalidación por webhook

```mermaid
sequenceDiagram
  autonumber
  actor E as Editor
  participant A as Strapi Admin
  participant S as Strapi Core
  participant R as Next /api/revalidate
  participant DC as Data Cache
  actor U as Visitante

  E->>A: Edita Flavor "Lemon Lime" y pulsa Publish
  A->>S: Persistir versión publicada
  S->>R: POST {event: entry.publish, model: flavor}<br/>Authorization: Bearer <secret>
  R->>R: timingSafeEqual(secret)
  alt Secreto inválido
    R-->>S: 401 {revalidated: false}
  else Secreto válido
    R->>DC: revalidateTag("strapi", "max")
    R-->>S: 200 {revalidated: true}
  end
  U->>DC: GET / (siguiente visita)
  DC-->>U: versión stale mientras regenera
  Note over DC: Regeneración en background<br/>con el contenido nuevo
```

### 6.3 Carga inicial de contenido (seed)

```mermaid
sequenceDiagram
  autonumber
  actor D as Desarrollador
  participant SD as scripts/seed.js
  participant ST as Strapi (load)
  participant UP as Upload service
  participant DOC as Document Service
  participant JSON as default-content.json

  D->>SD: npm run seed [-- --force]
  SD->>ST: compileStrapi() + createStrapi().load()
  ST->>ST: bootstrap: permisos públicos de lectura
  SD->>DOC: ¿existe landing-page?
  alt Existe y sin --force
    SD-->>D: "skipping seed"
  else
    SD->>JSON: leer flavors, global, landingPage
    loop Cada imagen {src, alt}
      SD->>UP: ¿ya existe por nombre?
      UP-->>SD: no → upload desde public/
    end
    SD->>DOC: create flavors (published)
    SD->>DOC: create global
    SD->>DOC: create landing-page con slugs → documentIds
    SD-->>D: "Seeded 3 flavors, global settings and the landing page."
  end
  SD->>ST: destroy()
```

---

## 7. Requisitos

### 7.1 Funcionales

| ID | Requisito | Estado |
|----|-----------|--------|
| RF-01 | Editar todos los textos de cada sección desde Strapi | ✅ |
| RF-02 | Gestionar imágenes desde la Media Library | ✅ |
| RF-03 | CRUD de sabores con color de acento propio | ✅ |
| RF-04 | Reordenar, agregar u ocultar secciones | ✅ Dynamic zone |
| RF-05 | Editar navegación, CTA y footer | ✅ `global` |
| RF-06 | Editar SEO global y por página | ✅ `shared.seo` |
| RF-07 | Ver cambios publicados sin redeploy | ✅ Webhook (prod) / sin caché (dev) |

### 7.2 No funcionales

| ID | Requisito | Implementación |
|----|-----------|----------------|
| RNF-01 | Página estática y rápida | ISR, `revalidate` 3600 s + tag `strapi` |
| RNF-02 | Resiliencia ante caída del CMS | Error explícito → ISR sirve la última versión |
| RNF-03 | Seguridad del webhook | Bearer secret con `timingSafeEqual` |
| RNF-04 | Mínimo privilegio | Rol Public solo con `find`/`findOne`; token opcional |
| RNF-05 | Sin secretos en el cliente | Fetch solo en servidor; sin `NEXT_PUBLIC_*` |
| RNF-06 | Payload liviano | `fields` acotados en media (url, alt, width, height) |
| RNF-07 | Tolerancia a cambios de esquema | Bloques desconocidos se omiten |

---

## 8. Configuración

### 8.1 Variables de entorno

| App | Variable | Uso |
|-----|----------|-----|
| Next | `STRAPI_URL` | URL del CMS. Vacía = fallback local |
| Next | `STRAPI_API_TOKEN` | Token read-only (opcional) |
| Next | `STRAPI_REVALIDATE_SECONDS` | Revalidación por tiempo (default 3600, ignorada en dev) |
| Next | `STRAPI_WEBHOOK_SECRET` | Secreto compartido con el webhook |
| Strapi | `APP_KEYS`, `*_SALT`, `*_SECRET`, `ENCRYPTION_KEY` | Seguridad interna |
| Strapi | `DATABASE_CLIENT`, `DATABASE_URL` | SQLite o Postgres |
| Strapi | `CORS_ORIGINS` | Orígenes permitidos |

### 8.2 Puesta en marcha

```bash
# 1. CMS
cd cms && cp .env.example .env   # completar secretos
npm install
npm run seed                      # contenido inicial
npm run develop                   # http://localhost:1337/admin

# 2. Frontend (en la raíz)
cp .env.example .env.local        # STRAPI_URL=http://localhost:1337
pnpm install
pnpm dev
```

### 8.3 Webhook (producción)

1. Strapi → **Settings → Webhooks → Create new webhook**.
2. URL: `https://<sitio>/api/revalidate`.
3. Header: `Authorization: Bearer <STRAPI_WEBHOOK_SECRET>`.
4. Eventos: `entry.publish`, `entry.unpublish`, `entry.update`, `entry.delete`, `media.*`.

### 8.4 Despliegue sugerido

```mermaid
flowchart LR
  subgraph Vercel
    NX[Next.js<br/>ISR + /api/revalidate]
  end
  subgraph Cloud["Strapi Cloud / Render / Railway"]
    SP[Strapi 5]
  end
  PG[(Postgres)]
  S3[(S3 / Cloudinary<br/>upload provider)]

  SP --> PG
  SP --> S3
  NX -->|REST + token| SP
  SP -->|webhook| NX
  NX -.->|imágenes vía CDN| S3
```

---

## 9. Decisiones técnicas y trade-offs

| Decisión | Alternativa descartada | Motivo |
|----------|------------------------|--------|
| Page builder con dynamic zone | Campos fijos por sección | Editores pueden reordenar y reutilizar bloques |
| REST + `qs` | GraphQL plugin | Menos dependencias; populate explícito alcanza |
| Fetch solo en Server Components | Fetch en el cliente | SEO, sin secretos expuestos, HTML estático |
| ISR + webhook | SSR en cada request | Rendimiento de sitio estático con frescura inmediata |
| JSON único para seed y fallback | Duplicar contenido en TS y JS | Una sola fuente de verdad |
| Monorepo con dos apps independientes | Repos separados | Cambios de esquema y frontend en un mismo PR |
| Colores como estilos inline | Clases Tailwind dinámicas | Tailwind no genera clases para valores en runtime |

---

## 10. Problemas encontrados durante la integración

| Problema | Causa | Solución |
|----------|-------|----------|
| `Error during initial TypeScript compilation: Debug Failure` al iniciar Strapi | El CLI busca `tsconfig.json` hacia arriba y tomaba el de Next | `cms/tsconfig.json` propio con `allowJs` |
| Strapi arrancaba con base vacía | Al compilar a `dist/`, la ruta SQLite apuntaba a `dist/.tmp` | `path.join(__dirname, '..', '..', ...)` en `config/database.js` |
| Cambios publicados no aparecían en dev | Caché de fetch de 1 h y webhook sin configurar | `revalidate: 0` en desarrollo |
| `pnpm add` fallaba con `ERR_PNPM_IGNORED_BUILDS` | pnpm 12 bloquea scripts de `sharp` | `pnpm-workspace.yaml` con `allowBuilds.sharp: false` |
| Gradiente del carrusel sin color | Clases Tailwind con hex del CMS no se generan | `linear-gradient` inline desde `accentColor` |
| Lock de `next dev` | Dos instancias usando `.next/dev` | Detener la instancia duplicada |

---

## 11. Riesgos

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Strapi caído durante `next build` | Build falla | Esperado: evita publicar contenido viejo; reintentar o build sin `STRAPI_URL` |
| Webhook mal configurado | Cambios tardan hasta 1 h | Revalidación por tiempo como red de seguridad |
| Media en disco local de Strapi | Se pierde al redeployar | Usar provider S3/Cloudinary en producción |
| Editor rompe el layout (textos muy largos) | Visual | `maxLength` en SEO; agregar límites en títulos si hace falta |
| Rol Public demasiado amplio | Exposición de datos | Solo lectura; migrar a API token read-only |

---

## 12. Criterios de aceptación

- [x] `GET /api/landing-page` devuelve los 5 bloques con media y relaciones pobladas.
- [x] `GET /api/global` devuelve navegación (5 links) y footer (4 grupos).
- [x] La home renderiza imágenes desde `/uploads` de Strapi.
- [x] Un cambio publicado en un `Flavor` aparece en el sitio (verificado en dev).
- [x] `/api/revalidate` responde 401 sin secreto o con secreto incorrecto.
- [x] `pnpm build` sin `STRAPI_URL` genera `/` estática con el contenido de fallback.
- [x] Paridad visual con el diseño original (Hero y carrusel verificados).

---

## 13. Próximos pasos

1. **Preview de borradores:** Strapi 5 Preview + `draftMode()` de Next.
2. **Producción:** Postgres + upload provider (S3/Cloudinary).
3. **API token read-only** en lugar del rol Public.
4. **i18n** si el sitio será bilingüe (plugin nativo de Strapi).
5. **Newsletter real:** conectar el formulario del footer a un servicio de email.
6. **Sabor Wild Berry:** subir `public/images/drink3-wild-berry.jpg` (ideal: PNG sin fondo) y agregarlo al carrusel.
