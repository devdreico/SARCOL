import { Link } from "react-router-dom";
import {
  ArrowRight, BookOpen, CheckCircle2, Clock, Database, FileText, Scale,
  ShieldCheck, TriangleAlert, Vote, XCircle,
} from "lucide-react";
import { PageHeader, Badge, Button, Kicker, Reveal, SectionHeader, Sello } from "../components/ui";

const PASOS = [
  { n: "01", t: "Selección", d: "Elegimos una pregunta pública y buscamos la fuente primaria que pueda responderla. Si no existe, no inventamos el indicador.", icono: Database },
  { n: "02", t: "Ingesta", d: "La API o el dataset se consulta de forma automática. Guardamos el valor, la fecha del dato, la serie y la fuente exacta.", icono: FileText },
  { n: "03", t: "Verificación", d: "Comparamos contra la fuente y registramos estado, duración y registros. Si falla, se marca la alerta; no se rellena.", icono: ShieldCheck },
  { n: "04", t: "Doble explicación", d: "Escribimos una versión simple y una versión técnica. La primera se entiende sin formación; la segunda resiste una auditoría.", icono: BookOpen },
  { n: "05", t: "Publicación", d: "El dato aparece con su fecha, su fuente, su TIER y su bitácora. Cualquiera puede descargarlo y citarlo.", icono: CheckCircle2 },
];

const GLOSARIO = [
  { t: "TRM", d: "Tasa Representativa del Mercado. Precio oficial del dólar en pesos, certificado por la Superintendencia Financiera. No es un pronóstico ni un precio de casa de cambio." },
  { t: "SECOP II", d: "Sistema Electrónico para la Contratación Pública. Registra procesos y contratos del Estado colombiano. SARCOL usa el valor referencial (precio base), no el gasto ejecutado." },
  { t: "Valor referencial", d: "Precio base estimado por la entidad antes de contratar. No equivale a lo efectivamente pagado. Sirve para dimensionar, no para auditoría de pagos." },
  { t: "Gini", d: "Coeficiente de desigualdad entre 0 y 100. 0 sería igualdad perfecta; 100, concentración total. Un Gini alto no dice por sí solo quién es rico ni por qué." },
  { t: "Pobreza monetaria", d: "Personas cuyo ingreso está por debajo de la línea de pobreza. Mide capacidad de compra, no acceso efectivo a servicios ni pobreza multidimensional." },
  { t: "TIER", d: "Orden de prioridad de una fuente. TIER 1: estatal. TIER 2: institucional. TIER 3: verificado independiente o comparativo internacional." },
  { t: "Fecha del dato", d: "El periodo al que se refiere la cifra: un año, un mes o un día. No es la fecha en que SARCOL la consultó." },
  { t: "Fecha de verificación", d: "El momento en que la API respondió y SARCOL registró el valor. Puede ser muy posterior a la fecha del dato." },
  { t: "Serie", d: "Conjunto de valores ordenados en el tiempo. Permite ver tendencia, no solo el último dato." },
  { t: "Doble explicación", d: "Regla editorial: cada dato se publica en lenguaje simple y con respaldo técnico. Ninguna de las dos versiones reemplaza a la otra." },
];

export default function Metodologia() {
  return (
    <main>
      <PageHeader
        kicker="Método · 09"
        title={<>Cómo se convierte un dato <span className="text-red">en confianza.</span></>}
        description="SARCOL no pide que le creas. Muestra de dónde sale cada cifra, cómo se verificó, qué significa y qué no significa. Esta página es la carta de método de la institución."
        actions={
          <>
            <Button to="/fuentes" variant="soft"><ShieldCheck size={14} /> Ver fuentes</Button>
            <Button to="/datos-abiertos" variant="primary">Descargar datos <ArrowRight size={14} /></Button>
          </>
        }
        meta={
          <>
            <Badge tone="red">v2.0 · octubre 2026</Badge>
            <Badge tone="blue">Método público</Badge>
            <Badge tone="yellow">Sin comentarios · sin contacto</Badge>
          </>
        }
      />

      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 lg:grid-cols-[1fr_250px]">
        <div className="min-w-0">
          <section id="que-es" className="scroll-mt-24">
            <div className="flex flex-wrap items-center gap-3">
              <Sello>Definición</Sello>
              <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted">Sociedad Autónoma Regulatoria de Cumplimiento en Operaciones Legales</span>
            </div>
            <h2 className="mt-4 font-display text-[clamp(1.7rem,3.5vw,2.6rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-ink text-balance">
              Una entidad regulatoria de información pública. No un medio, no una red social.
            </h2>
            <div className="prose-sarcol mt-4 max-w-3xl text-[13.5px] text-ink/75">
              <p>
                SARCOL existe para reducir la distancia entre lo que pasa en Colombia y lo que la ciudadanía
                puede saber con evidencia. No produce opinión de coyuntura ni alinea su relato con gobiernos,
                partidos o campañas. Produce un registro: datos, contexto, fuentes y un mecanismo de voto.
              </p>
              <p>
                La institución tiene tres funciones: <strong>medir</strong> (indicadores y series), <strong>explicar</strong>
                {" "}(doble lenguaje) y <strong>registrar</strong> (bitácora, fuentes, descargas). La participación
                ciudadana se limita al voto anónimo; no hay comentarios, cuentas ni contacto.
              </p>
            </div>
          </section>

          <section id="proceso" className="mt-14 scroll-mt-24">
            <SectionHeader
              kicker="01 / Proceso"
              title={<>Cinco pasos, <span className="text-blue2">sin atajos.</span></>}
              description="Cada indicador recorre el mismo camino. La diferencia está en la fuente y en la frecuencia, no en el rigor."
            />
            <div className="mt-6 space-y-2">
              {PASOS.map((p, i) => (
                <Reveal key={p.n} delay={i * 0.04}>
                  <div className="flex gap-4 border border-line bg-paper2 p-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-line bg-paper text-red"><p.icono size={17} /></span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-red">{p.n}</span>
                        <h3 className="font-display text-[15px] font-bold text-ink">{p.t}</h3>
                      </div>
                      <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{p.d}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          <section id="fuentes" className="mt-14 scroll-mt-24">
            <SectionHeader
              kicker="02 / Fuentes"
              title={<>La jerarquía <span className="text-red">importa.</span></>}
              description="No todas las fuentes tienen el mismo peso. El orden TIER evita que una opinión compita con un registro administrativo."
            />
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {[
                { t: "TIER 1 · Estatal", d: "Dato primario producido por una entidad del Estado. Es la base de la verdad objetiva.", c: "border-yellow2/70 bg-yellow/20", badge: "yellow" as const },
                { t: "TIER 2 · Institucional", d: "Marco legal y operativo: contratación, regulación, emisor, justicia.", c: "border-blue2/25 bg-blue/20", badge: "blue" as const },
                { t: "TIER 3 · Verificado", d: "Comparación internacional y periodismo de datos con método público.", c: "border-red/25 bg-red/5", badge: "red" as const },
              ].map((x) => (
                <div key={x.t} className={`border p-4 ${x.c}`}>
                  <Badge tone={x.badge}>{x.t}</Badge>
                  <p className="mt-3 text-[12px] leading-relaxed text-ink/70">{x.d}</p>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <Button to="/fuentes#tiers" variant="soft">Ver el directorio completo <ArrowRight size={13} /></Button>
            </div>
          </section>

          <section id="doble" className="mt-14 scroll-mt-24">
            <SectionHeader
              kicker="03 / Doble explicación"
              title={<>La misma cifra, <span className="text-blue2">dos lenguajes.</span></>}
              description="Una explicación simple no es una explicación incompleta: es una traducción. La técnica no es la versión “verdadera”: es el respaldo que permite auditar."
            />
            <div className="mt-6 border border-line bg-paper2">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
                <div>
                  <Kicker>Ejemplo real · TRM</Kicker>
                  <div className="mt-0.5 font-display text-lg font-bold text-ink">$3.157,94 COP por USD</div>
                </div>
                <Badge tone="blue">Superfinanciera · TIER 2</Badge>
              </div>
              <div className="grid gap-0 md:grid-cols-2">
                <div className="border-b border-line p-5 md:border-b-0 md:border-r">
                  <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.1em] text-red"><BookOpen size={12} /> Simple</div>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink/80">
                    Cuántos pesos cuesta un dólar hoy. Si la TRM sube, el peso se debilita: importar se vuelve más
                    caro y viajar al exterior cuesta más. No es una predicción; es el precio oficial del día.
                  </p>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.1em] text-blue2"><FileText size={12} /> Técnica</div>
                  <p className="mt-2 text-[12.5px] leading-relaxed text-ink/75">
                    Tasa Representativa del Mercado certificada por la Superintendencia Financiera (datos.gov.co,
                    recurso 32sa-8pi3). Se calcula con operaciones interbancarias del día anterior y rige para
                    operaciones de cambio. No incluye spread bancario ni comisiones.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="fechas" className="mt-14 scroll-mt-24">
            <SectionHeader
              kicker="04 / Fechas"
              title={<>Dos fechas, <span className="text-red">nunca una sola.</span></>}
              description="La fecha del dato y la fecha de verificación no son lo mismo. Confundirlas es una de las formas más comunes de mentir con estadísticas."
            />
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <div className="border border-line bg-paper2 p-5">
                <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.1em] text-muted"><Clock size={12} className="text-blue2" /> Fecha del dato</div>
                <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
                  El periodo al que se refiere la cifra. Puede ser 2024, mayo de 2025 o el 27 de octubre de 2026.
                  Una serie anual siempre tendrá una fecha de dato distinta a la de su consulta.
                </p>
              </div>
              <div className="border border-line bg-paper2 p-5">
                <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.1em] text-muted"><ShieldCheck size={12} className="text-red" /> Fecha de verificación</div>
                <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
                  El momento en que SARCOL consultó la fuente y guardó el valor. Se muestra en la tarjeta y en la
                  bitácora. Si la fuente falla, la fecha de verificación no se actualiza.
                </p>
              </div>
            </div>
          </section>

          <section id="voto" className="mt-14 scroll-mt-24">
            <SectionHeader
              kicker="05 / Voto"
              title={<>Sin centro, <span className="text-blue2">sin cuentas, sin comentarios.</span></>}
              description="El voto no mide verdad científica: mide posición ciudadana. Por eso no reemplaza al dato y por eso se muestra incluso cuando incomoda."
            />
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                { t: "Dos opciones, siempre", d: "No hay una opción neutral. La abstención no se simula: si no votas, no apareces.", icono: Vote },
                { t: "Un dispositivo, un voto", d: "Usamos una huella hash no identificable. No pedimos cuenta, correo ni teléfono.", icono: ShieldCheck },
                { t: "Anónimo", d: "El servidor no recibe tu identidad. La huella no permite reconstruir a una persona.", icono: Scale },
                { t: "Empate visible", d: "Si los votos quedan parejos, SARCOL muestra la similitud. No inventa un centro.", icono: TriangleAlert },
              ].map((c) => (
                <div key={c.t} className="border border-line bg-paper2 p-4">
                  <c.icono size={16} className="text-red" />
                  <h3 className="mt-2 font-display text-[14px] font-bold text-ink">{c.t}</h3>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted">{c.d}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="limites" className="mt-14 scroll-mt-24">
            <SectionHeader
              kicker="06 / Límites"
              title={<>Lo que SARCOL <span className="text-red">no hace.</span></>}
              description="La credibilidad también se construye diciendo qué queda fuera. Estos son los límites explícitos del sistema."
            />
            <div className="mt-6 space-y-2">
              {[
                "No publica comentarios, respuestas ni mensajes de usuarios.",
                "No permite contacto con responsables públicos ni con otros usuarios.",
                "No rellena datos faltantes con estimaciones propias ni con IA generativa.",
                "No declara ganadores de debates: muestra conteos y empates.",
                "No sustituye una auditoría oficial ni un fallo judicial.",
                "No vende, segmenta ni comparte la huella de dispositivo.",
              ].map((t) => (
                <div key={t} className="flex items-start gap-2 border border-line bg-paper2 px-4 py-3">
                  <XCircle size={14} className="mt-0.5 shrink-0 text-red" />
                  <span className="text-[12.5px] leading-relaxed text-ink/75">{t}</span>
                </div>
              ))}
            </div>
          </section>

          <section id="glosario" className="mt-14 scroll-mt-24">
            <SectionHeader
              kicker="07 / Glosario"
              title={<>Las palabras <span className="text-blue2">no son neutrales.</span></>}
              description="Definiciones operativas para leer SARCOL sin ambigüedad. Si un término no está aquí, no debería aparecer en una tarjeta."
            />
            <div className="mt-6 divide-y divide-line border border-line bg-paper2">
              {GLOSARIO.map((g) => (
                <details key={g.t} className="group px-4 py-3">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                    <span className="text-[13px] font-semibold text-ink">{g.t}</span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted group-open:text-red">Abrir</span>
                  </summary>
                  <p className="mt-2 max-w-3xl text-[12.5px] leading-relaxed text-muted">{g.d}</p>
                </details>
              ))}
            </div>
          </section>

          <section id="principios" className="mt-14 scroll-mt-24">
            <div className="border border-ink bg-ink p-6 text-paper">
              <Kicker className="text-yellow">08 / Principios</Kicker>
              <h2 className="mt-2 font-display text-2xl font-extrabold tracking-[-0.02em] text-paper">La carta de SARCOL.</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  ["Sin comentarios.", "La interacción no produce ruido ni moderación discrecional."],
                  ["Sin contacto.", "No hay canal para presionar, negociar o capturar."],
                  ["Doble explicación.", "Cada dato se puede leer sin formación y auditar con formación."],
                  ["Voto anónimo.", "Un dispositivo, un voto. Si el país se divide, se ve."],
                  ["Fuente al descubierto.", "Cada cifra tiene URL, fecha y TIER."],
                  ["Sin datos inventados.", "Si falta, se dice. No se rellena."],
                ].map(([t, d]) => (
                  <div key={t} className="border border-paper/12 bg-paper/[0.04] p-3">
                    <div className="font-display text-[13px] font-bold text-yellow">{t}</div>
                    <div className="mt-1 text-[11.5px] leading-relaxed text-paper/55">{d}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-10 flex flex-wrap items-center justify-between gap-3 border border-line bg-paper2 px-4 py-4">
            <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.1em] text-muted">
              <CheckCircle2 size={13} className="text-green" /> Método público · versión 2.0 · octubre 2026
            </div>
            <div className="flex gap-2">
              <Link to="/fuentes" className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted hover:text-red">Fuentes</Link>
              <span className="text-line2">/</span>
              <Link to="/datos-abiertos" className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted hover:text-red">API</Link>
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-20 lg:h-fit">
          <div className="border border-line bg-paper2 p-4">
            <Kicker>En esta página</Kicker>
            <nav className="mt-2 space-y-1">
              {[
                ["#que-es", "Qué es SARCOL"],
                ["#proceso", "Proceso"],
                ["#fuentes", "Fuentes y TIER"],
                ["#doble", "Doble explicación"],
                ["#fechas", "Las dos fechas"],
                ["#voto", "Voto"],
                ["#limites", "Límites"],
                ["#glosario", "Glosario"],
                ["#principios", "Principios"],
              ].map(([href, texto]) => (
                <a key={href} href={href} className="block border-b border-line/60 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.06em] text-muted last:border-0 hover:text-red">{texto}</a>
              ))}
            </nav>
          </div>
          <div className="mt-3 border border-line bg-yellow/30 p-4">
            <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink/70">Regla de oro</div>
            <p className="mt-2 text-[11.5px] leading-relaxed text-ink/70">
              Si no podemos mostrar la fuente, no publicamos el dato. Si no podemos explicarlo dos veces, no lo
              llamamos indicador.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
