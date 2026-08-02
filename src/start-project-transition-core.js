const STYLE_ID = 'start-project-transition-styles'
const STAGE_ID = 'start-project-transition-stage'
const MODEL_URL = '/assets/start-project/macbook/macbook-pro-2020.obj'
const VIDEO_URL = '/assets/start-project/environment.mp4'
const ROCK_URL = '/assets/start-project/black-stone.png'

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum)
}

function mix(start, end, progress) {
  return start + (end - start) * progress
}

function easeInOutCubic(value) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2
}

function easeOutExpo(value) {
  return value === 1 ? 1 : 1 - Math.pow(2, -10 * value)
}

function solveLinearSystem(matrix) {
  const size = matrix.length

  for (let column = 0; column < size; column += 1) {
    let pivotRow = column

    for (let row = column + 1; row < size; row += 1) {
      if (Math.abs(matrix[row][column]) > Math.abs(matrix[pivotRow][column])) {
        pivotRow = row
      }
    }

    if (Math.abs(matrix[pivotRow][column]) < 1e-10) return null

    if (pivotRow !== column) {
      const temporaryRow = matrix[column]
      matrix[column] = matrix[pivotRow]
      matrix[pivotRow] = temporaryRow
    }

    const pivot = matrix[column][column]

    for (let index = column; index <= size; index += 1) {
      matrix[column][index] /= pivot
    }

    for (let row = 0; row < size; row += 1) {
      if (row === column) continue

      const factor = matrix[row][column]
      if (Math.abs(factor) < 1e-12) continue

      for (let index = column; index <= size; index += 1) {
        matrix[row][index] -= factor * matrix[column][index]
      }
    }
  }

  return matrix.map((row) => row[size])
}

function getProjectiveTransform(width, height, destination) {
  const source = [
    [0, 0],
    [width, 0],
    [width, height],
    [0, height],
  ]
  const equations = []

  source.forEach(([x, y], index) => {
    const [targetX, targetY] = destination[index]

    equations.push([
      x,
      y,
      1,
      0,
      0,
      0,
      -targetX * x,
      -targetX * y,
      targetX,
    ])

    equations.push([
      0,
      0,
      0,
      x,
      y,
      1,
      -targetY * x,
      -targetY * y,
      targetY,
    ])
  })

  const solution = solveLinearSystem(equations)
  if (!solution) return null

  const [a, b, c, d, e, f, g, h] = solution

  return `matrix3d(${[
    a,
    d,
    0,
    g,
    b,
    e,
    0,
    h,
    0,
    0,
    1,
    0,
    c,
    f,
    0,
    1,
  ].join(',')})`
}

function polygonArea(points) {
  let area = 0

  for (let index = 0; index < points.length; index += 1) {
    const current = points[index]
    const next = points[(index + 1) % points.length]
    area += current[0] * next[1] - next[0] * current[1]
  }

  return area / 2
}

function injectStylesheet() {
  if (document.getElementById(STYLE_ID)) return

  const link = document.createElement('link')
  link.id = STYLE_ID
  link.rel = 'stylesheet'
  link.href = '/assets/start-project/start-project-transition.css'
  document.head.append(link)
}

function createStage() {
  const existing = document.getElementById(STAGE_ID)
  if (existing) return existing

  const stage = document.createElement('section')
  stage.id = STAGE_ID
  stage.className = 'spt-stage'
  stage.setAttribute('aria-hidden', 'true')
  stage.innerHTML = `
    <video
      class="spt-environment-video"
      muted
      loop
      playsinline
      preload="auto"
      aria-hidden="true"
    >
      <source src="${VIDEO_URL}" type="video/mp4" />
    </video>

    <div class="spt-environment-wash" aria-hidden="true"></div>
    <canvas class="spt-laptop-canvas" aria-hidden="true"></canvas>

    <div class="spt-rock-scene" aria-hidden="true">
      <div class="spt-underlight"></div>
      <img src="${ROCK_URL}" alt="" draggable="false" />
    </div>

    <div class="spt-mobile-page-flow">
      <article
        class="spt-form-card"
        aria-label="Start a project form"
      >
      <p class="spt-form-kicker">Creative partnership</p>
      <h2>Start a Project</h2>
      <p class="spt-form-intro">
        Tell me what you are building and where you want the work to take your brand.
      </p>

      <form class="spt-form" novalidate>
        <label>
          <span>Name</span>
          <input type="text" name="name" autocomplete="name" placeholder="Your name" />
        </label>

        <label>
          <span>Email</span>
          <input type="email" name="email" autocomplete="email" placeholder="you@example.com" />
        </label>

        <label>
          <span>Project type</span>
          <select name="projectType">
            <option value="" selected disabled>Select a service</option>
            <option>Brand identity</option>
            <option>Website design</option>
            <option>Creative direction</option>
            <option>Campaign design</option>
            <option>Something custom</option>
          </select>
        </label>
        <label class="spt-upload-field">
          <span>Example image</span>

          <div class="spt-upload-control">
            <div class="spt-upload-copy">
              <strong>Upload image</strong>
              <small class="spt-upload-name">
                PNG, JPG or WEBP
              </small>
            </div>

            <span
              class="spt-upload-mark"
              aria-hidden="true"
            >
              +
            </span>

            <input
              type="file"
              name="exampleImage"
              accept="image/png,image/jpeg,image/webp"
              aria-label="Upload an example image"
            />
          </div>
        </label>


        <label class="spt-form-message">
          <span>Project vision</span>
          <textarea name="message" rows="4" placeholder="Tell me about the idea, goals, and timing."></textarea>
        </label>

        <button type="submit">
          Begin the conversation
          <span aria-hidden="true">↗</span>
        </button>

        <p class="spt-form-status" aria-live="polite"></p>
        </form>
      </article>
    </div>

    <button class="spt-close" type="button" aria-label="Return to portfolio">
      <span aria-hidden="true">×</span>
    </button>
  `

  document.documentElement.append(stage)
  return stage
}

function saveInlineStyles(element, properties) {
  const saved = {}

  properties.forEach((property) => {
    saved[property] = element.style[property]
  })

  return saved
}

function restoreInlineStyles(element, saved) {
  Object.entries(saved).forEach(([property, value]) => {
    element.style[property] = value
  })
}

function createLivePageLayer() {
  const scrollPosition = window.scrollY
  const body = document.body
  const html = document.documentElement
  const movedNodes = Array.from(body.children).filter(
    (element) => element.tagName !== 'SCRIPT',
  )
  const originalBodyStyles = saveInlineStyles(body, [
    'overflow',
    'position',
    'width',
    'height',
  ])
  const originalHtmlStyles = saveInlineStyles(html, ['overflow'])

  const screen = document.createElement('div')
  screen.className = 'spt-live-screen'
  screen.setAttribute('aria-hidden', 'true')

  const scrollLayer = document.createElement('div')
  scrollLayer.className = 'spt-live-scroll'
  scrollLayer.style.top = `${-scrollPosition}px`
  scrollLayer.style.height = `${Math.max(
    document.documentElement.scrollHeight,
    window.innerHeight,
  )}px`

  movedNodes.forEach((node) => scrollLayer.append(node))
  screen.append(scrollLayer)
  html.append(screen)

  html.style.overflow = 'hidden'
  body.style.overflow = 'hidden'
  body.style.position = 'fixed'
  body.style.width = '100%'
  body.style.height = '100%'

  const restore = () => {
    const firstScript = Array.from(body.childNodes).find(
      (node) => node.nodeType === 1 && node.tagName === 'SCRIPT',
    )

    movedNodes.forEach((node) => {
      body.insertBefore(node, firstScript || null)
    })

    screen.remove()
    restoreInlineStyles(body, originalBodyStyles)
    restoreInlineStyles(html, originalHtmlStyles)
    window.scrollTo(0, scrollPosition)
  }

  return {
    screen,
    restore,
    width: window.innerWidth,
    height: window.innerHeight,
  }
}

function createMaterials(THREE) {
  return {
    shell: new THREE.MeshPhysicalMaterial({
      color: 0xb8bcc3,
      metalness: 0.92,
      roughness: 0.27,
      clearcoat: 0.45,
      clearcoatRoughness: 0.22,
    }),
    dark: new THREE.MeshStandardMaterial({
      color: 0x08090b,
      metalness: 0.25,
      roughness: 0.42,
    }),
    keyboard: new THREE.MeshStandardMaterial({
      color: 0x111318,
      metalness: 0.12,
      roughness: 0.52,
    }),
    trackpad: new THREE.MeshPhysicalMaterial({
      color: 0x9ea3aa,
      metalness: 0.72,
      roughness: 0.32,
    }),
    hinge: new THREE.MeshStandardMaterial({
      color: 0x17191d,
      metalness: 0.68,
      roughness: 0.36,
    }),
  }
}

function materialForMesh(mesh, materials) {
  const name = mesh.name || ''

  if (name === 'Rectangle004') return materials.dark
  if (name === 'Object026' || name === 'Object027' || name === 'Object028') {
    return materials.keyboard
  }
  if (name === 'Object025') return materials.trackpad
  if (name === 'Cylinder007' || name === 'Plane006') return materials.hinge
  return materials.shell
}

function getSceneLayout(camera, screenWidth) {
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const aspect = viewportWidth / viewportHeight
  const verticalWorldSize =
    2 * camera.position.z * Math.tan((camera.fov * Math.PI) / 360)
  const horizontalWorldSize = verticalWorldSize * aspect
  const mobile = viewportWidth < 820
  const finalScreenFraction = mobile ? 0.31 : 0.34

  return {
    viewportWidth,
    viewportHeight,
    screenHeight: Math.min(
      screenWidth * (viewportHeight / viewportWidth),
      194,
    ),
    initialScale: horizontalWorldSize / screenWidth,
    finalScale:
      (
        horizontalWorldSize *
        finalScreenFraction *
        (mobile ? 0.82 : 0.9)
      ) / screenWidth,
    finalX: mobile ? 0 : -horizontalWorldSize * 0.225,
    finalY: mobile
      ? verticalWorldSize * 0.36
      : verticalWorldSize * 0.055,
    verticalWorldSize,
    horizontalWorldSize,
    mobile,
  }
}

export function initStartProjectTransition({ THREE, OBJLoader }) {
  if (window.__johnWolfStartProjectTransition) {
    return window.__johnWolfStartProjectTransition
  }

  injectStylesheet()
  const stage = createStage()
  const video = stage.querySelector('.spt-environment-video')
  const canvas = stage.querySelector('.spt-laptop-canvas')
  const closeButton = stage.querySelector('.spt-close')
  const form = stage.querySelector('.spt-form')
  const formStatus = stage.querySelector('.spt-form-status')
  const exampleImageInput = stage.querySelector('input[name="exampleImage"]')
  const exampleImageName = stage.querySelector('.spt-upload-name')

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  })
  renderer.setClearColor(0x000000, 0)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.06

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 3000)
  camera.position.set(0, 0, 900)
  camera.lookAt(0, 0, 0)

  const laptopRoot = new THREE.Group()
  scene.add(laptopRoot)

  scene.add(new THREE.HemisphereLight(0xf4f4ff, 0x210307, 2.15))

  const keyLight = new THREE.DirectionalLight(0xffffff, 4.4)
  keyLight.position.set(-320, 420, 540)
  scene.add(keyLight)

  const redRim = new THREE.PointLight(0xff243f, 2700, 1100, 2)
  redRim.position.set(-260, -180, 260)
  scene.add(redRim)

  const coolRim = new THREE.PointLight(0x9db8ff, 1350, 900, 2)
  coolRim.position.set(250, 210, 160)
  scene.add(coolRim)

  const screenWidth = 310
  let layout = getSceneLayout(camera, screenWidth)
  let livePage = null
  let active = false
  let animating = false
  let settled = false
  let animationFrame = 0
  let hoverStartedAt = 0
  let modelLoaded = false
  let modelLoadFailed = false

  const materials = createMaterials(THREE)
  const loader = new OBJLoader()
  const modelReady = new Promise((resolve) => {
    loader.load(
      MODEL_URL,
      (model) => {
        model.traverse((child) => {
          if (!child.isMesh) return
          child.material = materialForMesh(child, materials)
          child.castShadow = true
          child.receiveShadow = true
        })

        model.position.set(0, -3.8512, 120.62065)
        laptopRoot.add(model)
        modelLoaded = true
        resolve(model)
      },
      undefined,
      (error) => {
        modelLoadFailed = true
        console.error('The Start a Project MacBook model could not load.', error)
        resolve(null)
      },
    )
  })

  function resizeRenderer() {
    layout = getSceneLayout(camera, screenWidth)
    camera.aspect = layout.viewportWidth / layout.viewportHeight
    camera.updateProjectionMatrix()
    renderer.setSize(layout.viewportWidth, layout.viewportHeight, false)
  }

  function getScreenCorners() {
    const halfWidth = screenWidth / 2
    const halfHeight = layout.screenHeight / 2

    return [
      new THREE.Vector3(-halfWidth, halfHeight, 0),
      new THREE.Vector3(halfWidth, halfHeight, 0),
      new THREE.Vector3(halfWidth, -halfHeight, 0),
      new THREE.Vector3(-halfWidth, -halfHeight, 0),
    ]
  }

  function projectLivePage() {
    if (!livePage) return

    const projected = getScreenCorners().map((corner) => {
      const point = laptopRoot.localToWorld(corner.clone()).project(camera)
      return [
        (point.x * 0.5 + 0.5) * layout.viewportWidth,
        (-point.y * 0.5 + 0.5) * layout.viewportHeight,
      ]
    })

    const area = polygonArea(projected)
    const transform = getProjectiveTransform(
      livePage.width,
      livePage.height,
      projected,
    )

    livePage.screen.style.opacity = area > 1 ? '1' : '0'

    if (transform) {
      livePage.screen.style.transform = transform
    }
  }

  function setOpeningPose(progress) {
    const firstPhase = clamp(progress / 0.2, 0, 1)
    const travelPhase = clamp((progress - 0.08) / 0.92, 0, 1)
    const travelEase = easeInOutCubic(travelPhase)
    const pullEase = easeOutExpo(firstPhase)

    laptopRoot.scale.setScalar(
      mix(
        layout.initialScale,
        mix(layout.initialScale * 0.56, layout.finalScale, travelEase),
        pullEase,
      ),
    )

    laptopRoot.position.x = mix(0, layout.finalX, travelEase)
    laptopRoot.position.y =
      mix(0, layout.finalY, travelEase) +
      Math.sin(travelPhase * Math.PI) * layout.verticalWorldSize * 0.055
    laptopRoot.position.z = Math.sin(travelPhase * Math.PI) * -42

    laptopRoot.rotation.x =
      Math.sin(travelPhase * Math.PI) * -0.22 +
      mix(0, -0.075, travelEase)
    laptopRoot.rotation.y =
      travelEase * Math.PI * 2 + mix(0, -0.2, travelEase)
    laptopRoot.rotation.z =
      Math.sin(travelPhase * Math.PI * 2) * 0.055 +
      mix(0, -0.018, travelEase)

    if (progress > 0.08 && livePage) {
      livePage.screen.classList.add('is-framed')
    }
    if (progress > 0.26) stage.classList.add('is-rock-visible')
    if (progress > 0.72) stage.classList.add('is-form-visible')
  }

  function setSettledPose(timestamp) {
    const elapsed = (timestamp - hoverStartedAt) / 1000
    const hover = Math.sin(elapsed * 1.15)
    const drift = Math.sin(elapsed * 0.58)

    laptopRoot.scale.setScalar(layout.finalScale)
    laptopRoot.position.set(
      layout.finalX + drift * 2.6,
      layout.finalY + hover * 5.2,
      0,
    )
    laptopRoot.rotation.set(
      -0.075 + drift * 0.006,
      Math.PI * 2 - 0.2 + hover * 0.008,
      -0.018 + drift * 0.009,
    )
  }

  function renderFrame(timestamp) {
    if (!active) return

    if (settled) setSettledPose(timestamp)

    projectLivePage()
    renderer.render(scene, camera)
    animationFrame = requestAnimationFrame(renderFrame)
  }

  function animate(duration, update) {
    return new Promise((resolve) => {
      const startedAt = performance.now()

      const tick = (timestamp) => {
        const progress = clamp((timestamp - startedAt) / duration, 0, 1)
        update(progress)

        if (progress < 1) {
          requestAnimationFrame(tick)
        } else {
          resolve()
        }
      }

      requestAnimationFrame(tick)
    })
  }

  async function openTransition() {
    if (active || animating) return

    animating = true
    formStatus.textContent = ''

    await modelReady

    if (modelLoadFailed || !modelLoaded) {
      animating = false
      return
    }

    resizeRenderer()

    const mobileProjectPage =
      window.innerWidth < 820

    const lenisAttributes = [
      'data-lenis-prevent',
      'data-lenis-prevent-wheel',
      'data-lenis-prevent-touch',
    ]

    lenisAttributes.forEach((attribute) => {
      if (mobileProjectPage) {
        stage.setAttribute(attribute, '')
      } else {
        stage.removeAttribute(attribute)
      }
    })

    stage.scrollTop = 0
    livePage = createLivePageLayer()
    active = true
    settled = false
    stage.classList.remove('is-rock-visible', 'is-form-visible', 'is-settled')
    stage.classList.add('is-active')
    stage.setAttribute('aria-hidden', 'false')
    stage.scrollTop = 0
    video.currentTime = 0
    video.play().catch(() => {})

    laptopRoot.position.set(0, 0, 0)
    laptopRoot.rotation.set(0, 0, 0)
    laptopRoot.scale.setScalar(layout.initialScale)

    cancelAnimationFrame(animationFrame)
    animationFrame = requestAnimationFrame(renderFrame)

    await animate(2860, (progress) => {
      setOpeningPose(progress)
    })

    settled = true
    hoverStartedAt = performance.now()
    stage.classList.add('is-settled', 'is-rock-visible', 'is-form-visible')
    closeButton.focus({ preventScroll: true })
    animating = false
  }

  async function closeTransition() {
    if (!active || animating) return

    animating = true
    settled = false
    stage.classList.remove('is-form-visible', 'is-settled')

    const startScale = laptopRoot.scale.x
    const startPosition = laptopRoot.position.clone()
    const startRotation = laptopRoot.rotation.clone()

    await animate(1680, (progress) => {
      const eased = easeInOutCubic(progress)
      const reverseSpin = mix(startRotation.y, Math.PI * 4, eased)

      laptopRoot.scale.setScalar(mix(startScale, layout.initialScale, eased))
      laptopRoot.position.set(
        mix(startPosition.x, 0, eased),
        mix(startPosition.y, 0, eased),
        mix(startPosition.z, 0, eased),
      )
      laptopRoot.rotation.set(
        mix(startRotation.x, 0, eased),
        reverseSpin,
        mix(startRotation.z, 0, eased),
      )

      if (progress > 0.38) stage.classList.remove('is-rock-visible')
      if (progress > 0.88 && livePage) {
        livePage.screen.classList.remove('is-framed')
      }
    })

    laptopRoot.rotation.set(0, 0, 0)
    laptopRoot.position.set(0, 0, 0)
    laptopRoot.scale.setScalar(layout.initialScale)
    projectLivePage()

    livePage?.restore()
    livePage = null
    active = false
    stage.classList.remove(
      'is-active',
      'is-rock-visible',
      'is-form-visible',
      'is-settled',
    )
    stage.setAttribute('aria-hidden', 'true')
    video.pause()
    video.currentTime = 0
    cancelAnimationFrame(animationFrame)
    animating = false
  }

  function startFromEvent(event) {
    const trigger = event.target.closest?.(
      '.header-cta, a[href="#contact"], a[href="/#contact"]',
    )

    if (!trigger) return

    const label = (
      trigger.textContent ||
      ''
    ).trim()

    const startsProject =
      /start\s+a?\s*project/i.test(label)

    const opensContact =
      /^contact$/i.test(label)

    if (!startsProject && !opensContact) return

    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()

    openTransition()
  }

  function handleKeydown(event) {
    if (event.key === 'Escape' && active) {
      event.preventDefault()
      closeTransition()
    }
  }

  function handleResize() {
    resizeRenderer()

    if (active && livePage) {
      livePage.width = window.innerWidth
      livePage.height = window.innerHeight
      livePage.screen.style.width = `${livePage.width}px`
      livePage.screen.style.height = `${livePage.height}px`
    }
  }

  exampleImageInput?.addEventListener(
    'change',
    () => {
      const selectedFile =
        exampleImageInput.files?.[0]

      if (!exampleImageName) return

      exampleImageName.textContent =
        selectedFile?.name ||
        'PNG, JPG or WEBP'
    },
  )

  form.addEventListener('submit', (event) => {
    event.preventDefault()
    formStatus.textContent = 'The visual form is ready. Submission wiring comes next.'
  })
  closeButton.addEventListener('click', closeTransition)
  window.addEventListener('click', startFromEvent, true)
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('resize', handleResize)
  resizeRenderer()

  const api = {
    open: openTransition,
    close: closeTransition,
  }

  window.__johnWolfStartProjectTransition = api
  return api
}

