import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import {
  GlobalWorkerOptions,
  getDocument,
} from 'pdfjs-dist/legacy/build/pdf.mjs'
import pdfWorkerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url'
import './BrandVault.css'

GlobalWorkerOptions.workerSrc = pdfWorkerUrl

const brandThemes = {
  'Riches Cosmetics': {
    accent: '#f277bd',
    glow: '#8d2d67',
    surface: '#170b15',
  },
  'Chick Muy Caliente': {
    accent: '#ff735d',
    glow: '#a42d1d',
    surface: '#1b0b08',
  },
  'Bellora Design Studio': {
    accent: '#dbc8a4',
    glow: '#806a47',
    surface: '#17130d',
  },
}

function clamp(value, minimum, maximum) {
  return Math.min(
    Math.max(value, minimum),
    maximum,
  )
}

function BrandVaultPage({
  documentProxy,
  pageNumber,
  zoom,
  spread,
  title,
  snapshotRef,
}) {
  const [canvas, setCanvas] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    if (!documentProxy || !canvas) {
      return undefined
    }

    let cancelled = false
    let renderTask = null
    let resizeTimer = null

    const renderPage = async () => {
      try {
        setStatus('loading')

        const page = await documentProxy.getPage(
          pageNumber,
        )

        if (cancelled) {
          return
        }

        const baseViewport = page.getViewport({
          scale: 1,
        })

        const desktopWidth = Math.min(
          window.innerWidth * 0.34,
          650,
        )

        const singleWidth = Math.min(
          window.innerWidth * 0.82,
          820,
        )

        const targetCssWidth = spread
          ? desktopWidth
          : singleWidth

        const pixelRatio = Math.min(
          window.devicePixelRatio || 1,
          2,
        )

        const renderScale =
          (
            targetCssWidth *
            pixelRatio *
            zoom
          ) /
          baseViewport.width

        const viewport = page.getViewport({
          scale: renderScale,
        })

        canvas.width = Math.floor(viewport.width)
        canvas.height = Math.floor(viewport.height)

        const context = canvas.getContext('2d', {
          alpha: false,
        })

        renderTask = page.render({
          canvasContext: context,
          viewport,
          background: 'rgb(255,255,255)',
        })

        await renderTask.promise

        if (!cancelled) {
          try {
            snapshotRef.current =
              canvas.toDataURL(
                'image/jpeg',
                0.94,
              )
          } catch {
            snapshotRef.current = null
          }

          setStatus('ready')
        }
      } catch (error) {
        if (
          error?.name !==
            'RenderingCancelledException' &&
          !cancelled
        ) {
          console.error(
            'Brand Vault page rendering failed:',
            error,
          )

          setStatus('error')
        }
      }
    }

    const handleResize = () => {
      window.clearTimeout(resizeTimer)

      resizeTimer = window.setTimeout(() => {
        renderTask?.cancel()
        renderPage()
      }, 180)
    }

    renderPage()

    window.addEventListener(
      'resize',
      handleResize,
    )

    return () => {
      cancelled = true

      window.clearTimeout(resizeTimer)

      window.removeEventListener(
        'resize',
        handleResize,
      )

      renderTask?.cancel()
    }
  }, [
    canvas,
    documentProxy,
    pageNumber,
    snapshotRef,
    spread,
    zoom,
  ])

  return (
    <figure
      className="brand-vault-page"
      data-status={status}
      aria-label={`${title}, page ${pageNumber}`}
    >
      <canvas ref={setCanvas} />

      {status === 'loading' && (
        <span className="brand-vault-page-status">
          Rendering page
        </span>
      )}

      {status === 'error' && (
        <span className="brand-vault-page-status">
          Page unavailable
        </span>
      )}
    </figure>
  )
}

function BrandVaultThumbnail({
  documentProxy,
  pageNumber,
  active,
  title,
  onSelect,
}) {
  const buttonRef = useRef(null)
  const canvasRef = useRef(null)
  const [visible, setVisible] = useState(
    pageNumber <= 4,
  )

  useEffect(() => {
    const button = buttonRef.current

    if (!button || visible) {
      return undefined
    }

    if (!('IntersectionObserver' in window)) {
      setVisible(true)
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '240px',
        threshold: 0.01,
      },
    )

    observer.observe(button)

    return () => {
      observer.disconnect()
    }
  }, [visible])

  useEffect(() => {
    if (
      !visible ||
      !documentProxy ||
      !canvasRef.current
    ) {
      return undefined
    }

    let cancelled = false
    let renderTask = null

    const renderThumbnail = async () => {
      try {
        const page = await documentProxy.getPage(
          pageNumber,
        )

        if (cancelled || !canvasRef.current) {
          return
        }

        const canvas = canvasRef.current

        const baseViewport = page.getViewport({
          scale: 1,
        })

        const pixelRatio = Math.min(
          window.devicePixelRatio || 1,
          1.5,
        )

        const targetWidth = 104 * pixelRatio

        const viewport = page.getViewport({
          scale:
            targetWidth /
            baseViewport.width,
        })

        canvas.width = Math.floor(
          viewport.width,
        )

        canvas.height = Math.floor(
          viewport.height,
        )

        const context = canvas.getContext(
          '2d',
          {
            alpha: false,
          },
        )

        renderTask = page.render({
          canvasContext: context,
          viewport,
          background: 'rgb(255,255,255)',
        })

        await renderTask.promise
      } catch (error) {
        if (
          error?.name !==
            'RenderingCancelledException' &&
          !cancelled
        ) {
          console.error(
            'Brand Vault thumbnail failed:',
            error,
          )
        }
      }
    }

    renderThumbnail()

    return () => {
      cancelled = true
      renderTask?.cancel()
    }
  }, [
    documentProxy,
    pageNumber,
    visible,
  ])

  return (
    <button
      ref={buttonRef}
      className={`brand-vault-thumbnail ${
        active ? 'is-active' : ''
      }`}
      type="button"
      data-page={pageNumber}
      aria-label={`Open ${title}, page ${pageNumber}`}
      aria-current={
        active ? 'page' : undefined
      }
      onClick={() => onSelect(pageNumber)}
    >
      <canvas ref={canvasRef} />

      <span>
        {String(pageNumber).padStart(2, '0')}
      </span>
    </button>
  )
}

export default function BrandVault({
  open,
  project,
  projects,
  activeIndex,
  onClose,
  onSelectProject,
}) {
  const [documentProxy, setDocumentProxy] =
    useState(null)

  const [pageCount, setPageCount] =
    useState(0)

  const [pageNumber, setPageNumber] =
    useState(1)

  const [zoom, setZoom] =
    useState(1)

  const [loadState, setLoadState] =
    useState('idle')

  const [turnDirection, setTurnDirection] =
    useState('none')

  const [turnSnapshot, setTurnSnapshot] =
    useState(null)

  const [turnToken, setTurnToken] =
    useState(0)

  const readerRef = useRef(null)
  const thumbnailRailRef = useRef(null)
  const currentPageSnapshotRef = useRef(null)
  const wheelLockRef = useRef(false)
  const wheelTimerRef = useRef(null)
  const turnTimerRef = useRef(null)

  const [spreadMode, setSpreadMode] =
    useState(false)

  const theme =
    brandThemes[project?.title] ||
    brandThemes['Riches Cosmetics']

  const suggestedGuides = useMemo(
    () =>
      projects
        .map((guide, index) => ({
          guide,
          index,
        }))
        .filter(
          ({ index }) =>
            index !== activeIndex,
        ),
    [activeIndex, projects],
  )

  const beginTurn = (direction) => {
    window.clearTimeout(
      turnTimerRef.current,
    )

    setTurnSnapshot(
      currentPageSnapshotRef.current,
    )

    setTurnDirection(direction)
    setTurnToken((current) => current + 1)

    turnTimerRef.current =
      window.setTimeout(() => {
        setTurnSnapshot(null)
        setTurnDirection('none')
      }, 980)
  }

  useEffect(() => {
    if (!open) {
      return undefined
    }

    const mediaQuery =
      window.matchMedia(
        '(min-width: 980px)',
      )

    const updateLayout = () => {
      setSpreadMode(false)
    }

    updateLayout()

    mediaQuery.addEventListener?.(
      'change',
      updateLayout,
    )

    return () => {
      mediaQuery.removeEventListener?.(
        'change',
        updateLayout,
      )
    }
  }, [open])

  useEffect(() => {
    if (!open || !project?.pdf) {
      return undefined
    }

    let cancelled = false
    let loadedDocument = null

    const loadingTask = getDocument({
      url: project.pdf,
      useSystemFonts: true,
    })

    setLoadState('loading')
    setDocumentProxy(null)
    setPageCount(0)
    setPageNumber(1)
    setZoom(1)
    setTurnDirection('none')
    setTurnSnapshot(null)
    setTurnToken(0)
    currentPageSnapshotRef.current = null

    loadingTask.promise
      .then((pdfDocument) => {
        if (cancelled) {
          pdfDocument.destroy()
          return
        }

        loadedDocument = pdfDocument

        setDocumentProxy(pdfDocument)
        setPageCount(pdfDocument.numPages)
        setLoadState('ready')
      })
      .catch((error) => {
        if (!cancelled) {
          console.error(
            'Brand Vault PDF loading failed:',
            error,
          )

          setLoadState('error')
        }
      })

    return () => {
      cancelled = true

      loadingTask.destroy()

      loadedDocument?.destroy()
    }
  }, [
    open,
    project?.pdf,
  ])

  useEffect(() => {
    if (!open) {
      return undefined
    }

    const oldHtmlOverflow =
      document.documentElement.style.overflow

    const oldBodyOverflow =
      document.body.style.overflow

    document.documentElement.style.overflow =
      'hidden'

    document.body.style.overflow =
      'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        event.stopImmediatePropagation()

        onClose()
        return
      }

      if (
        event.key === 'ArrowRight' ||
        event.key === 'PageDown'
      ) {
        event.preventDefault()

        beginTurn('forward')

        setPageNumber((current) => {
          const step =
            spreadMode && current > 1
              ? 2
              : 1

          return clamp(
            current + step,
            1,
            Math.max(pageCount, 1),
          )
        })
      }

      if (
        event.key === 'ArrowLeft' ||
        event.key === 'PageUp'
      ) {
        event.preventDefault()

        beginTurn('backward')

        setPageNumber((current) => {
          const step =
            spreadMode && current > 2
              ? 2
              : 1

          return clamp(
            current - step,
            1,
            Math.max(pageCount, 1),
          )
        })
      }
    }

    window.addEventListener(
      'keydown',
      handleKeyDown,
      true,
    )

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown,
        true,
      )

      document.documentElement.style.overflow =
        oldHtmlOverflow

      document.body.style.overflow =
        oldBodyOverflow
    }
  }, [
    onClose,
    open,
    pageCount,
    spreadMode,
  ])

  useEffect(() => {
    if (
      !open ||
      !readerRef.current
    ) {
      return undefined
    }

    const reader = readerRef.current

    const handleWheel = (event) => {
      if (
        event.ctrlKey ||
        Math.abs(event.deltaY) < 8
      ) {
        return
      }

      event.preventDefault()

      if (wheelLockRef.current) {
        return
      }

      wheelLockRef.current = true

      const forward = event.deltaY > 0

      beginTurn(
        forward ? 'forward' : 'backward',
      )

      setPageNumber((current) => {
        if (forward) {
          if (!spreadMode) {
            return clamp(
              current + 1,
              1,
              Math.max(pageCount, 1),
            )
          }

          if (current === 1) {
            return clamp(
              2,
              1,
              Math.max(pageCount, 1),
            )
          }

          return clamp(
            current + 2,
            1,
            Math.max(pageCount, 1),
          )
        }

        if (!spreadMode) {
          return clamp(
            current - 1,
            1,
            Math.max(pageCount, 1),
          )
        }

        if (current <= 2) {
          return 1
        }

        return clamp(
          current - 2,
          1,
          Math.max(pageCount, 1),
        )
      })

      window.clearTimeout(
        wheelTimerRef.current,
      )

      wheelTimerRef.current =
        window.setTimeout(() => {
          wheelLockRef.current = false
        }, 720)
    }

    reader.addEventListener(
      'wheel',
      handleWheel,
      {
        passive: false,
      },
    )

    return () => {
      reader.removeEventListener(
        'wheel',
        handleWheel,
      )

      window.clearTimeout(
        wheelTimerRef.current,
      )

      wheelLockRef.current = false
    }
  }, [
    open,
    pageCount,
    spreadMode,
  ])

  useEffect(() => {
    if (
      !open ||
      !thumbnailRailRef.current
    ) {
      return
    }

    const activeThumbnail =
      thumbnailRailRef.current.querySelector(
        `[data-page="${pageNumber}"]`,
      )

    activeThumbnail?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    })
  }, [
    open,
    pageNumber,
    project?.pdf,
  ])

  if (!open || !project) {
    return null
  }

  const secondPage =
    spreadMode &&
    pageNumber > 1 &&
    pageNumber < pageCount
      ? pageNumber + 1
      : null

  const previousPage = () => {
    beginTurn('backward')

    setPageNumber((current) => {
      if (!spreadMode) {
        return clamp(
          current - 1,
          1,
          Math.max(pageCount, 1),
        )
      }

      if (current <= 2) {
        return 1
      }

      return clamp(
        current - 2,
        1,
        Math.max(pageCount, 1),
      )
    })
  }

  const nextPage = () => {
    beginTurn('forward')

    setPageNumber((current) => {
      if (!spreadMode) {
        return clamp(
          current + 1,
          1,
          Math.max(pageCount, 1),
        )
      }

      if (current === 1) {
        return clamp(
          2,
          1,
          Math.max(pageCount, 1),
        )
      }

      return clamp(
        current + 2,
        1,
        Math.max(pageCount, 1),
      )
    })
  }

  const selectThumbnail = (targetPage) => {
    const normalizedPage =
      spreadMode && targetPage > 1
        ? targetPage % 2 === 0
          ? targetPage
          : targetPage - 1
        : targetPage

    if (normalizedPage === pageNumber) {
      return
    }

    beginTurn(
      normalizedPage > pageNumber
        ? 'forward'
        : 'backward',
    )

    setPageNumber(
      clamp(
        normalizedPage,
        1,
        Math.max(pageCount, 1),
      ),
    )
  }

  const selectSuggestedGuide = (index) => {
    window.clearTimeout(
      turnTimerRef.current,
    )

    setPageNumber(1)
    setZoom(1)
    setTurnDirection('none')
    setTurnSnapshot(null)
    setTurnToken(0)
    currentPageSnapshotRef.current = null
    onSelectProject(index)
  }

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement
          .requestFullscreen?.()
      } else {
        await document.exitFullscreen?.()
      }
    } catch {
      // Fullscreen is optional on unsupported devices.
    }
  }

  const displayCount =
    pageCount || project.pages

  const progress =
    displayCount > 0
      ? `${(pageNumber / displayCount) * 100}%`
      : '0%'

  return createPortal(
    <section
      className="brand-vault"
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} Brand Vault`}
      style={{
        '--vault-accent': theme.accent,
        '--vault-glow': theme.glow,
        '--vault-surface': theme.surface,
      }}
    >
      <div
        className="brand-vault-atmosphere"
        aria-hidden="true"
      />

      <header className="brand-vault-header">
        <div className="brand-vault-identity">
          <span>John Wolf / Brand Vault</span>
          <strong>{project.title}</strong>
        </div>

        <div className="brand-vault-tools">
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() =>
              setZoom((current) =>
                clamp(
                  current - 0.1,
                  0.8,
                  1.5,
                ),
              )
            }
          >
            −
          </button>

          <span>
            {String(pageNumber).padStart(2, '0')}
            {' / '}
            {String(displayCount).padStart(2, '0')}
          </span>

          <button
            type="button"
            aria-label="Zoom in"
            onClick={() =>
              setZoom((current) =>
                clamp(
                  current + 0.1,
                  0.8,
                  1.5,
                ),
              )
            }
          >
            +
          </button>

          <button
            type="button"
            aria-label="Toggle fullscreen"
            onClick={toggleFullscreen}
          >
            ⛶
          </button>

          <button
            className="brand-vault-close"
            type="button"
            aria-label="Close Brand Vault"
            onClick={onClose}
          >
            <i />
            <i />
          </button>
        </div>
      </header>

      <div className="brand-vault-layout">
        <aside className="brand-vault-project">
          <p>{project.category}</p>

          <h2>{project.title}</h2>

          <div className="brand-vault-rule" />

          <span>
            {project.pages}-page identity system
          </span>

          <small>
            {project.description}
          </small>

          <div className="brand-vault-reading-note">
            <b>Inside the system</b>

            <span>
              Turn pages with the arrows, thumbnails,
              keyboard, or vertical scroll.
            </span>
          </div>
        </aside>

        <main
          className="brand-vault-reader"
          ref={readerRef}
        >
          <div
            className="brand-vault-spread"
            data-spread={
              spreadMode ? 'true' : 'false'
            }
          >
            {loadState === 'loading' && (
              <div className="brand-vault-loader">
                <i />
                <span>
                  Opening selected system
                </span>
              </div>
            )}

            {loadState === 'error' && (
              <div className="brand-vault-error">
                <strong>
                  This guide could not be rendered.
                </strong>

                <span>
                  The PDF remains safely stored
                  inside the portfolio.
                </span>
              </div>
            )}

            {documentProxy && (
              <div
                className="brand-vault-book"
                key={`${project.pdf}-${pageNumber}-${turnToken}`}
                data-direction={turnDirection}
              >
                <BrandVaultPage
                  documentProxy={documentProxy}
                  pageNumber={pageNumber}
                  zoom={zoom}
                  snapshotRef={
                    currentPageSnapshotRef
                  }
                  spread={
                    spreadMode && pageNumber > 1
                  }
                  title={project.title}
                />

                {secondPage && (
                  <BrandVaultPage
                    documentProxy={documentProxy}
                    pageNumber={secondPage}
                    zoom={zoom}
                    spread
                    title={project.title}
                  />
                )}

                {turnSnapshot &&
                  turnDirection !== 'none' && (
                    <div
                      className="brand-vault-turn-sheet"
                      aria-hidden="true"
                    >
                      <img
                        src={turnSnapshot}
                        alt=""
                      />

                      <span className="brand-vault-turn-shine" />
                    </div>
                  )}
              </div>
            )}
          </div>

          {documentProxy && pageCount > 0 && (
            <nav
              className="brand-vault-thumbnails"
              ref={thumbnailRailRef}
              aria-label="PDF page thumbnails"
            >
              {Array.from(
                {
                  length: pageCount,
                },
                (_, index) => {
                  const thumbnailPage =
                    index + 1

                  const thumbnailActive =
                    thumbnailPage === pageNumber

                  return (
                    <BrandVaultThumbnail
                      key={thumbnailPage}
                      documentProxy={documentProxy}
                      pageNumber={thumbnailPage}
                      active={thumbnailActive}
                      title={project.title}
                      onSelect={selectThumbnail}
                    />
                  )
                },
              )}
            </nav>
          )}

          <nav
            className="brand-vault-navigation"
            aria-label="Brand guide page navigation"
          >
            <button
              type="button"
              onClick={previousPage}
              disabled={pageNumber <= 1}
            >
              <span aria-hidden="true">←</span>
              Previous
            </button>

            <div>
              <i
                style={{
                  '--vault-progress': progress,
                }}
              />

              <span>
                {spreadMode && pageNumber > 1
                  ? `Spread ${Math.ceil(
                      pageNumber / 2,
                    )}`
                  : `Page ${pageNumber}`}
              </span>
            </div>

            <button
              type="button"
              onClick={nextPage}
              disabled={
                pageCount === 0 ||
                pageNumber >= pageCount
              }
            >
              Next
              <span aria-hidden="true">→</span>
            </button>
          </nav>
        </main>

        <aside className="brand-vault-suggested">
          <div className="brand-vault-suggested-heading">
            <span>Suggested Guides</span>

            <small>
              Continue through the archive
            </small>
          </div>

          <div className="brand-vault-suggested-list">
            {suggestedGuides.map(
              ({ guide, index }) => (
                <button
                  type="button"
                  key={guide.title}
                  onClick={() =>
                    selectSuggestedGuide(index)
                  }
                >
                  <img
                    src={guide.image}
                    alt=""
                    aria-hidden="true"
                  />

                  <span>
                    <small>{guide.category}</small>
                    <strong>{guide.title}</strong>
                    <em>{guide.pages} pages</em>
                  </span>

                  <i aria-hidden="true">↗</i>
                </button>
              ),
            )}
          </div>
        </aside>
      </div>
    </section>,
    document.body,
  )
}
