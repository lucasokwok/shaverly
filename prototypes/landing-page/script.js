/* Protótipo V0.3: enhancement opcional; nenhuma biblioteca é stack definitiva. */
(() => {
  'use strict';
  const html = document.documentElement;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let cancelled = false;
  let teardown = () => {};
  let watchdog;
  let presentationReady = false;
  let hint = { sync() {}, stop() {} };
  document.addEventListener('DOMContentLoaded', mountScrollHint, { once: true });

  function mountScrollHint() {
    const element = document.querySelector('.scroll-hint');
    const status = document.querySelector('[data-scroll-status]');
    let elapsed = 0, started = null, timer = 0, shown = false, dismissed = false, stopped = false;
    function sync() {
      if (stopped) return;
      const now = performance.now();
      if (started !== null) elapsed += now - started;
      started = null;
      clearTimeout(timer); timer = 0;
      const atTop = Math.max(0, scrollY) <= 1 && !location.hash;
      if (!atTop || !presentationReady) {
        elapsed = 0;
        if (shown) dismissed = true;
        element.hidden = true;
        status.textContent = '';
        return;
      }
      if (document.hidden || dismissed) return;
      if (shown) return;
      if (elapsed >= 30000) {
        shown = true;
        element.hidden = false;
        status.textContent = element.textContent;
      } else {
        started = now;
        timer = setTimeout(sync, Math.ceil(30000 - elapsed));
      }
    }
    function stop() {
      if (stopped) return;
      stopped = true;
      clearTimeout(timer);
      element.hidden = true; status.textContent = '';
      window.removeEventListener('scroll', sync);
      window.removeEventListener('hashchange', sync);
      document.removeEventListener('visibilitychange', sync);
      window.removeEventListener('pagehide', stop);
      if (debug) delete window.shaverlyHintDebug;
    }
    hint = { sync, stop };
    window.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('hashchange', sync);
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('pagehide', stop, { once: true });
    if (debug) window.shaverlyHintDebug = { snapshot: () => ({
      elapsed: elapsed + (started === null ? 0 : performance.now() - started),
      shown, dismissed, visible: !element.hidden, running: started !== null,
    }) };
    sync();
  }
  const loading = new AbortController();
  const debug = new URLSearchParams(location.search).has('debug');
  const pageHide = () => staticHero('page-hidden');

  function staticHero(reason, error) {
    cancelled = true;
    clearTimeout(watchdog);
    loading.abort();
    window.removeEventListener('pagehide', pageHide);
    motion.removeEventListener('change', handleMotion);
    const dispose = teardown;
    teardown = () => {};
    dispose();
    html.classList.remove('intro-pending', 'intro-active');
    html.dataset.introState = reason;
    presentationReady = true;
    if (reason === 'skipped' || reason === 'page-hidden') hint.stop(); else hint.sync();
    if (error) console.warn('[Shaverly abertura 3D] Hero estático:', error);
  }

  // file://, navegação direta e movimento reduzido têm acesso imediato ao conteúdo.
  if (motion.matches || location.protocol === 'file:' || location.hash) {
    html.dataset.introState = motion.matches ? 'reduced-motion' : 'static';
    presentationReady = true;
    return;
  }
  html.classList.add('intro-pending');
  html.dataset.introState = 'loading';
  watchdog = setTimeout(() => staticHero('load-timeout', new Error('Abertura não disponível após 10 s.')), 10000);
  function handleMotion() { if (motion.matches) staticHero('reduced-motion'); }
  motion.addEventListener('change', handleMotion);
  window.addEventListener('pagehide', pageHide, { once: true });
  document.addEventListener('DOMContentLoaded', init, { once: true });

  async function init() {
    if (cancelled) return;
    const opening = document.querySelector('[data-opening]');
    const skip = document.querySelector('.skip-intro');
    skip.addEventListener('click', () => { staticHero('skipped'); document.querySelector('#hero-title').focus({ preventScroll: true }); });
    document.querySelector('.skip-link').addEventListener('click', () => staticHero('skipped'));
    try {
      const [THREE, { GLTFLoader }, { gsap }, { ScrollTrigger }, svgText] = await Promise.all([
        import('three'), import('three/addons/loaders/GLTFLoader.js'),
        import('https://cdn.jsdelivr.net/npm/gsap@3.13.0/index.js'),
        import('https://cdn.jsdelivr.net/npm/gsap@3.13.0/ScrollTrigger.js'),
        fetch('../../assets/branding/logos/shaverly-logo.svg', { signal: loading.signal }).then(r => {
          if (!r.ok) throw new Error(`SVG: HTTP ${r.status}`);
          return r.text();
        }),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const canvasHost = document.querySelector('.opening-canvas');
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
      let root, context, timeline, raf = 0, disposed = false;
      let renderCount = 0, measureCount = 0, bufferResizes = 0;
      let canvasWidth = 0, canvasHeight = 0, canvasDpr = 0;
      const tintedMaterials = [];
      const paletteColor = token => getComputedStyle(html).getPropertyValue(`--${token}`).trim();
      const brandColor = new THREE.Color(paletteColor('coffee'));
      const dockColor = new THREE.Color(paletteColor('linen'));
      let measure = () => {};
      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, .1, 3000);
      camera.position.z = 1000;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.setClearColor(dockColor, 0);
      canvasHost.append(renderer.domElement);
      const ambient = new THREE.HemisphereLight(paletteColor('key-light'), paletteColor('olive-mid'), .85);
      scene.add(ambient);
      const key = new THREE.DirectionalLight(paletteColor('key-light'), 2.2);
      key.position.set(-3, 4, 6); scene.add(key);
      const fill = new THREE.DirectionalLight(paletteColor('fill-light'), .65);
      fill.position.set(3, -1, 2); scene.add(fill);
      const pivot = new THREE.Group(); scene.add(pivot);
      const pointerGroup = new THREE.Group(); pivot.add(pointerGroup);
      const targetImage = document.querySelector('[data-logo-target]');
      const frame = document.createElement('div'); frame.className = 'logo-frame';
      targetImage.before(frame); frame.append(targetImage);
      let silhouette;
      let resizeObserver;
      let stopPointer = () => {};
      let resetPointerAnchor = () => {};
      const loseContext = event => { event.preventDefault(); staticHero('webgl-context-lost', new Error('Contexto WebGL perdido.')); };
      renderer.domElement.addEventListener('webglcontextlost', loseContext);
      const geometries = new Set(), materials = new Set(), textures = new Set();
      const disposeModel = object => object?.traverse(node => {
        if (node.geometry) geometries.add(node.geometry);
        for (const material of [].concat(node.material || [])) {
          materials.add(material);
          for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
        }
      });
      const release = () => {
        geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose());
        geometries.clear(); materials.clear(); textures.clear();
      };
      const visibility = () => { resetPointerAnchor(); if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else requestRender(); };
      teardown = () => {
        if (disposed) return;
        disposed = true;
        const st = ScrollTrigger.getById('shaverly-opening');
        const scroll = window.scrollY;
        const offset = st ? Math.min(Math.max(scroll - st.start, 0), st.end - st.start) : 0;
        resizeObserver?.disconnect();
        stopPointer();
        ScrollTrigger.removeEventListener('refresh', measure);
        document.removeEventListener('visibilitychange', visibility);
        window.removeEventListener('pagehide', pageHide);
        context?.revert();
        cancelAnimationFrame(raf);
        silhouette?.remove();
        frame.replaceWith(targetImage);
        disposeModel(root); release();
        renderer.domElement.removeEventListener('webglcontextlost', loseContext);
        renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
        if (debug) delete window.shaverlyDebug;
        if (offset) window.scrollTo(0, Math.max(0, scroll - offset));
      };
      const loader = new GLTFLoader();
      const gltf = await loader.loadAsync('../../assets/branding/models/mustache.glb');
      if (cancelled) { disposeModel(gltf.scene); release(); return; }
      root = gltf.scene;
      const bounds = new THREE.Box3().setFromObject(root);
      const size = bounds.getSize(new THREE.Vector3());
      const center = bounds.getCenter(new THREE.Vector3());
      root.position.sub(center); root.scale.setScalar(1 / size.x);
      // Centering translation and scale use the same normalization, preserving the exported hierarchy.
      root.position.multiplyScalar(1 / size.x);
      pointerGroup.add(root);
      root.traverse(node => {
        if (!node.isMesh) return;
        // Original baseColorFactor is ~0.001: tint in memory for legibility on the approved dark background.
        for (const material of [].concat(node.material)) {
          material.color.copy(brandColor);
          if (!tintedMaterials.includes(material)) tintedMaterials.push(material);
        }
      });

      // Inspection of the official evenodd path: subpath 5 is the mustache cutout.
      // Bounds in SVG units: x=703, y=337, width=201, height=63; no transforms.
      // Validate those measurements against the fetched asset instead of guessing screen pixels.
      const source = new DOMParser().parseFromString(svgText, 'image/svg+xml');
      const sourcePath = source.querySelector('path[fill-rule="evenodd"]');
      const cutout = sourcePath?.getAttribute('d').match(/M[^M]+/g)?.[5];
      if (!cutout) throw new Error('Recorte do bigode não identificado no SVG.');
      const ns = 'http://www.w3.org/2000/svg';
      silhouette = document.createElementNS(ns, 'svg');
      silhouette.setAttribute('viewBox', source.documentElement.getAttribute('viewBox'));
      silhouette.setAttribute('aria-hidden', 'true');
      silhouette.classList.add('docking-silhouette');
      const path = document.createElementNS(ns, 'path');
      path.setAttribute('d', cutout); path.setAttribute('fill', paletteColor('linen'));
      silhouette.append(path); frame.append(silhouette);
      const box = path.getBBox();
      if ([box.x-703, box.y-337, box.width-201, box.height-63].some(d => Math.abs(d) > .01)) throw new Error('O SVG mudou: recalibre o recorte antes de animar.');
      const viewBox = silhouette.viewBox.baseVal;
      await document.fonts.ready;
      await targetImage.decode();
      if (cancelled) return;
      if (window.scrollY > 10) { staticHero('already-scrolled'); return; }
      clearTimeout(watchdog);
      html.classList.replace('intro-pending', 'intro-active');
      html.dataset.introState = 'ready';
      presentationReady = true; hint.sync();

      const pose = { travel: 0, opacity: 1, tint: 0 };
      const metrics = { width: 0, height: 0, startScale: 0, endScale: 0, x: 0, y: 0 };
      // Assigned before the refresh event is registered; reads only on resize/refresh.
      measure = () => {
        if (disposed) return;
        measureCount++;
        const canvasRect = canvasHost.getBoundingClientRect();
        const logoRect = targetImage.getBoundingClientRect();
        const scale = Math.min(logoRect.width / viewBox.width, logoRect.height / viewBox.height);
        const left = logoRect.left + (logoRect.width - viewBox.width * scale) / 2;
        const top = logoRect.top + (logoRect.height - viewBox.height * scale) / 2;
        metrics.width = canvasRect.width; metrics.height = canvasRect.height;
        metrics.startScale = Math.min(canvasRect.width * .68, canvasRect.height * .6, 650);
        metrics.endScale = box.width * scale;
        metrics.x = left + (box.x + box.width / 2 - viewBox.x) * scale - canvasRect.left - canvasRect.width / 2;
        metrics.y = canvasRect.height / 2 - (top + (box.y + box.height / 2 - viewBox.y) * scale - canvasRect.top);
        camera.left = -canvasRect.width / 2; camera.right = canvasRect.width / 2;
        camera.top = canvasRect.height / 2; camera.bottom = -canvasRect.height / 2;
        camera.updateProjectionMatrix();
        const dpr = Math.min(devicePixelRatio, matchMedia('(pointer: coarse)').matches ? 1.25 : 1.5);
        if (canvasWidth !== canvasRect.width || canvasHeight !== canvasRect.height || canvasDpr !== dpr) {
          // One buffer allocation, and only if dimensions or DPR actually changed.
          renderer.setDrawingBufferSize(canvasRect.width, canvasRect.height, dpr);
          canvasWidth = canvasRect.width; canvasHeight = canvasRect.height; canvasDpr = dpr;
          bufferResizes++;
        }
        requestRender();
      };
      // Pointer orientation is independent of the scroll-owned pivot: no Euler accumulation/gimbal lock.
      const pointer = {
        fine: matchMedia('(any-pointer: fine)'),
        mouseCapable: matchMedia('(any-pointer: fine)').matches,
        current: new THREE.Quaternion(), target: new THREE.Quaternion(), exit: new THREE.Quaternion(),
        light: new THREE.Vector2(), lightTarget: new THREE.Vector2(), lightExit: new THREE.Vector2(),
        previous: null, atTop: true, lastFrame: 0,
      };
      const identity = new THREE.Quaternion();
      const stepQuaternion = new THREE.Quaternion();
      const stepEuler = new THREE.Euler(0, 0, 0, 'XYZ');
      resetPointerAnchor = () => { pointer.previous = null; pointer.lastFrame = 0; };
      const atStart = () => Math.max(0, scrollY) <= 1;
      const onPointerScroll = () => {
        const top = atStart();
        if (top === pointer.atTop) return;
        pointer.atTop = top;
        resetPointerAnchor();
        if (!top) {
          // Capture what was actually drawn, not the still-settling target.
          pointer.exit.copy(pointer.current);
          pointer.lightExit.copy(pointer.light);
          pointer.target.copy(pointer.current);
          pointer.lightTarget.copy(pointer.light);
        } else {
          // Restores the same endpoint when reversing the scroll.
          pointer.current.copy(pointer.exit); pointer.target.copy(pointer.exit);
          pointer.light.copy(pointer.lightExit); pointer.lightTarget.copy(pointer.lightExit);
        }
        requestRender();
      };
      const onPointerMove = event => {
        if (disposed || document.hidden || event.pointerType !== 'mouse' || !atStart()) return;
        // Actual mouse events also cover hybrid devices and headless environments with no primary pointer.
        pointer.mouseCapable = true;
        const x = THREE.MathUtils.clamp(event.clientX / metrics.width * 2 - 1, -1, 1);
        const y = THREE.MathUtils.clamp(1 - event.clientY / metrics.height * 2, -1, 1);
        pointer.lightTarget.set(x, y);
        if (pointer.previous) {
          const old = pointer.previous;
          const dx = THREE.MathUtils.clamp(x - old.x, -.12, .12);
          const dy = THREE.MathUtils.clamp(y - old.y, -.12, .12);
          // Angular motion around the center supplies roll; ignore the singularity near the center.
          const roll = Math.hypot(x, y) > .2 && Math.hypot(old.x, old.y) > .2
            ? THREE.MathUtils.clamp(Math.atan2(old.x * y - old.y * x, old.x * x + old.y * y), -.2, .2) * .6
            : 0;
          stepEuler.set(-dy * Math.PI * .8, dx * Math.PI * .8, roll);
          stepQuaternion.setFromEuler(stepEuler);
          pointer.target.premultiply(stepQuaternion).normalize();
        }
        pointer.previous = { x, y };
        requestRender();
      };
      const pointerSurface = document.querySelector('.opening');
      pointerSurface.addEventListener('pointermove', onPointerMove, { passive: true });
      pointerSurface.addEventListener('pointerleave', resetPointerAnchor);
      window.addEventListener('scroll', onPointerScroll, { passive: true });
      const onPointerCapability = () => { pointer.mouseCapable = pointer.fine.matches; resetPointerAnchor(); };
      pointer.fine.addEventListener('change', onPointerCapability);
      stopPointer = () => {
        pointerSurface.removeEventListener('pointermove', onPointerMove);
        pointerSurface.removeEventListener('pointerleave', resetPointerAnchor);
        window.removeEventListener('scroll', onPointerScroll);
        pointer.fine.removeEventListener('change', onPointerCapability);
      };
      function requestRender() {
        if (disposed || document.hidden || raf) return;
        raf = requestAnimationFrame(now => {
          raf = 0;
          const p = pose.travel;
          pivot.position.set(metrics.x * p, metrics.y * p, 0);
          pivot.rotation.set(-.22 * (1-p), -.38 * (1-p), .025 * (1-p));
          let settling = false;
          if (pointer.atTop) {
            const dt = pointer.lastFrame ? Math.min((now - pointer.lastFrame) / 1000, .05) : 1 / 60;
            const alpha = 1 - Math.exp(-dt / .12);
            pointer.current.slerp(pointer.target, alpha);
            pointer.light.lerp(pointer.lightTarget, alpha);
            settling = pointer.current.angleTo(pointer.target) > .0005 || pointer.light.distanceTo(pointer.lightTarget) > .001;
            if (!settling) { pointer.current.copy(pointer.target); pointer.light.copy(pointer.lightTarget); }
            pointerGroup.quaternion.copy(pointer.current);
          } else {
            const t = THREE.MathUtils.clamp((timeline?.progress() || 0) / .12, 0, 1);
            const weight = 1 - t * t * (3 - 2 * t);
            pointerGroup.quaternion.slerpQuaternions(identity, pointer.exit, weight);
            pointer.light.copy(pointer.lightExit).multiplyScalar(weight);
          }
          pointer.lastFrame = now;
          key.position.set(-3 + pointer.light.x * .9, 4 + pointer.light.y * .7, 6);
          pivot.scale.setScalar(metrics.startScale * Math.pow(metrics.endScale / metrics.startScale, p));
          tintedMaterials.forEach(material => material.color.lerpColors(brandColor, dockColor, pose.tint));
          renderer.domElement.style.opacity = pose.opacity;
          if (pose.opacity > 0) {
            try { renderer.render(scene, camera); renderCount++; }
            catch (error) { staticHero('render-error', error); }
          }
          if (settling) requestRender();
        });
      }
      context = gsap.context(() => {
        const slogan = document.querySelector('#hero-title');
        gsap.set([targetImage, silhouette, slogan], { autoAlpha: 0 });
        timeline = gsap.timeline({
          defaults: { ease: 'none' },
          onUpdate: requestRender,
          scrollTrigger: {
            id: 'shaverly-opening', trigger: opening, start: 'top top',
            end: () => `+=${Math.round(opening.getBoundingClientRect().height * 1.5)}`,
            pin: true, scrub: true, invalidateOnRefresh: true,
          },
        });
        timeline.addLabel('transform', 0)
          .to(pose, { travel: 1, duration: .62, ease: 'sine.inOut' }, 'transform')
          .addLabel('dock', .5)
          .to(targetImage, { autoAlpha: 1, duration: .2 }, 'dock')
          .to(pose, { tint: 1, duration: .12, ease: 'sine.inOut' }, .58)
          .to(silhouette, { autoAlpha: 1, duration: .08 }, .62)
          .to(pose, { opacity: 0, duration: .1 }, .64)
          .to(silhouette, { autoAlpha: 0, duration: .06 }, .72)
          .addLabel('reveal', .82)
          .fromTo(slogan, { y: 8 }, { y: 0, autoAlpha: 1, duration: .18 }, 'reveal');
      }, opening);
      ScrollTrigger.addEventListener('refresh', measure);
      let observedWidth = opening.clientWidth, observedHeight = opening.clientHeight;
      resizeObserver = new ResizeObserver(([entry]) => {
        const { width, height } = entry.contentRect;
        if (Math.abs(width - observedWidth) < .5 && Math.abs(height - observedHeight) < .5) return;
        observedWidth = width; observedHeight = height;
        ScrollTrigger.refresh();
      });
      resizeObserver.observe(opening);
      document.addEventListener('visibilitychange', visibility);
      ScrollTrigger.refresh();
      if (debug) window.shaverlyDebug = {
        snapshot: () => ({
          progress: timeline.progress(), travel: pose.travel, opacity: pose.opacity, tint: pose.tint,
          scale: pivot.scale.x, targetScale: metrics.endScale,
          target: { x: metrics.x + metrics.width / 2, y: metrics.height / 2 - metrics.y },
          model: { x: pivot.position.x + metrics.width / 2, y: metrics.height / 2 - pivot.position.y },
          renderCount, measureCount, bufferResizes, dpr: canvasDpr,
          meshes: renderer.info.memory.geometries, triangles: renderer.info.render.triangles,
          scrollEnd: timeline.scrollTrigger.end,
          pointerQuaternion: pointerGroup.quaternion.toArray(),
          pointerTarget: pointer.target.toArray(), pointerExit: pointer.exit.toArray(),
          orientation: pivot.quaternion.clone().multiply(pointerGroup.quaternion).toArray(),
          light: key.position.toArray(), pointerEnabled: pointer.mouseCapable && atStart(),

        }),
      };
      if (debug) console.info('[Shaverly abertura 3D]', { bounds: size.toArray(), cutout: { x:box.x,y:box.y,width:box.width,height:box.height }, versions: { three: THREE.REVISION, gsap: gsap.version } });
    } catch (error) { if (!cancelled) staticHero('load-error', error); }
  }
})();
