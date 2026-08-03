import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import ExpertiseIcon from './components/ExpertiseIcon.jsx'
import BrandVault from './components/BrandVault.jsx'

gsap.registerPlugin(ScrollTrigger)

const navigation = ['Home', 'About', 'Services', 'Portfolio', 'Testimonials', 'Contact']

/* ===== ACTIVE NAVIGATION SYSTEM ===== */

const navigationTargets = {
  Home: '#home',
  About: '#about',
  Services: '#services',
  Portfolio: '#portfolio',
  Testimonials: '#testimonials',
  Contact: '#contact',
}

const expertise = [
  {
    icon: 'identity',
    title: 'Brand Identity',
    body: 'Distinctive logos, typography, color systems, and visual standards built for recognition.',
  },
  {
    icon: 'digital',
    title: 'Digital Experiences',
    body: 'Purposeful websites and interactive visuals shaped through design, motion, and usability.',
  },
  {
    icon: 'campaign',
    title: 'Campaign Creative',
    body: 'Launch graphics, advertisements, and social content designed to command attention.',
  },
  {
    icon: 'partnership',
    title: 'Creative Partnership',
    body: 'Thoughtful design support from the first strategic idea through polished final delivery.',
  },
]

const carouselCards = [
  {
    title: 'Home',
    eyebrow: 'Opening scene',
    description: 'Return to the beginning of the experience.',
    video: '/assets/hero-neon.mp4',
    poster: '/assets/hero-neon-poster.png',
  },
  {
    title: 'Logos',
    eyebrow: 'Identity marks',
    description: 'Distinctive symbols and signature systems made to be remembered.',
    video: '/assets/carousel/packaging.mp4',
    poster: '/assets/carousel/packaging.jpg',
  },
  {
    title: 'Brand Guidelines',
    eyebrow: 'Visual systems',
    description: 'Rules that keep every brand expression clear, consistent, and recognizable.',
    video: '/assets/carousel/brand-guidelines.mp4',
    poster: '/assets/carousel/brand-guidelines.jpg',
  },
  {
    title: 'Websites',
    eyebrow: 'Digital experiences',
    description: 'Immersive interfaces that turn strong ideas into intuitive experiences.',
    video: '/assets/carousel/websites.mp4',
    poster: '/assets/carousel/websites.jpg',
  },
  {
    title: 'Illustrations',
    eyebrow: 'Custom artwork',
    description: 'Original visuals built to give campaigns and stories their own character.',
    video: '/assets/carousel/illustrations.mp4',
    poster: '/assets/carousel/illustrations.jpg',
  },
  {
    title: 'Social Campaigns',
    eyebrow: 'Attention systems',
    description: 'Connected campaign visuals designed to stop the scroll and strengthen recall.',
    video: '/assets/carousel/social-campaigns.mp4',
    poster: '/assets/carousel/social-campaigns.jpg',
  },
  {
    title: 'Print Design',
    eyebrow: 'Physical media',
    description: 'Editorial, promotional, and event materials shaped with tactile precision.',
    video: '/assets/carousel/print-design.mp4',
    poster: '/assets/carousel/print-design.jpg',
  },
  {
    title: 'Typography',
    eyebrow: 'Voice in form',
    description: 'Type-led compositions that make language feel as intentional as the message.',
    video: '/assets/carousel/typography.mp4',
    poster: '/assets/carousel/typography.jpg',
  },
  {
    title: 'Motion Design',
    eyebrow: 'Design in time',
    description: 'Movement, rhythm, and transformation used to make visual stories feel alive.',
    video: '/assets/carousel/motion-design.mp4',
    poster: '/assets/carousel/motion-design.jpg',
  },
  {
    title: 'Creative Direction',
    eyebrow: 'Unified vision',
    description: 'A clear visual point of view carried from the first concept through delivery.',
    video: '/assets/carousel/creative-direction.mp4',
    poster: '/assets/carousel/creative-direction.jpg',
  },
  {
    title: 'Photo Composites',
    eyebrow: 'Constructed worlds',
    description: 'Layered image-making that bends reality without losing believability.',
    video: '/assets/carousel/photo-composites.mp4',
    poster: '/assets/carousel/photo-composites.jpg',
  },
  {
    title: 'Case Studies',
    eyebrow: 'Process revealed',
    description: 'A closer look at the decisions, systems, and craft behind selected projects.',
    video: '/assets/carousel/case-studies.mp4',
    poster: '/assets/carousel/case-studies.jpg',
  },
  {
    title: 'About',
    eyebrow: 'The designer',
    description: 'The thinking, standards, and experience behind the work.',
    video: '/assets/carousel/about.mp4',
    poster: '/assets/carousel/about.jpg',
  },
  {
    title: 'Contact',
    eyebrow: 'Start something',
    description: 'Bring the idea. We will shape the visual experience around it.',
    video: '/assets/carousel/contact.mp4',
    poster: '/assets/carousel/contact.jpg',
  },
]

/* ===== BRAND GUIDELINES PROJECT CAROUSEL ===== */

const brandGuidelineProjects = [
  {
    title: 'Riches Cosmetics',
    category: 'Luxury cosmetics identity',
    description:
      'A 27-page confidence-led identity system built around control, restraint, clarity, and quiet visual authority.',
    image:
      '/assets/brand-guidelines/projects/riches-cosmetics-cover.jpg',
    pdf:
      '/assets/brand-guidelines/projects/riches-cosmetics-brand-guidelines.pdf',
    pages: 27,
  },
  {
    title: 'Chick Muy Caliente',
    category: 'Food brand identity',
    description:
      'A bold 17-page system covering brand essence, mascot use, voice, typography, color, heat levels, imagery, and iconography.',
    image:
      '/assets/brand-guidelines/projects/chick-muy-caliente-cover.jpg',
    pdf:
      '/assets/brand-guidelines/projects/chick-muy-caliente-brand-guidelines.pdf',
    pages: 17,
  },
  {
    title: 'Bellora Design Studio',
    category: 'Luxury interior identity',
    description:
      'A refined identity presentation featuring logo direction, an alternative mark, color palette, and typography for an elevated interior design studio.',
    image:
      '/assets/brand-guidelines/projects/bellora-design-studio-cover.jpg',
    pdf:
      '/assets/brand-guidelines/projects/bellora-design-studio-brand-guidelines.pdf',
    pages: 5,
  },
]

function getBrandProjectOffset(index, activeIndex, total) {
  let offset = index - activeIndex
  const halfway = total / 2

  if (offset > halfway) {
    offset -= total
  }

  if (offset < -halfway) {
    offset += total
  }

  return offset
}

function scrollToSection(id) {
  document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' })
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

export default function App() {
  const root = useRef(null)
  const experience = useRef(null)
  const stickyStage = useRef(null)
  const heroVideo = useRef(null)
  const homeCardVideo = useRef(null)
  const carouselRing = useRef(null)
  const brandPageStage = useRef(null)
  const brandPageOriginVideo = useRef(null)
  const brandPageBackgroundVideo = useRef(null)
  const brandPageOrigin = useRef(null)
  const brandPageOriginTime = useRef(0)
  const brandPageTouchStart = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeNavigation, setActiveNavigation] = useState('Home')
  const [videoReady, setVideoReady] = useState(false)
  const [activeCard, setActiveCard] = useState(0)
  const [brandPageOpen, setBrandPageOpen] = useState(false)
  const [brandVaultOpen, setBrandVaultOpen] = useState(false)
  const [brandProjectIndex, setBrandProjectIndex] = useState(0)

  const angleStep = useMemo(() => 360 / carouselCards.length, [])

  const activeBrandProject =
    brandGuidelineProjects[brandProjectIndex]

  /* ===== BRAND GUIDELINES PAGE FOUNDATION ===== */

  const openBrandGuidelines = (event) => {
    const card = event.currentTarget
    const rect = card.getBoundingClientRect()
    const video = card.querySelector('video')

    brandPageOrigin.current = {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    }

    brandPageOriginTime.current =
      video && Number.isFinite(video.currentTime)
        ? video.currentTime
        : 0

    setBrandVaultOpen(false)
    setBrandProjectIndex(0)
    setActiveNavigation('Portfolio')
    setBrandPageOpen(true)
  }


  /*
    The active Logos card is duplicated at its exact viewport
    position, expands to full screen, and hands its playing
    video to the standalone 3D Logos page.
  */
  const openLogosPage = (event) => {
    const card = event.currentTarget

    if (
      !card ||
      card.dataset.logoTransitioning === 'true'
    ) {
      return
    }

    const rect = card.getBoundingClientRect()
    const cardVideo = card.querySelector('video')

    const startingTime =
      cardVideo &&
      Number.isFinite(cardVideo.currentTime)
        ? cardVideo.currentTime
        : 0

    card.dataset.logoTransitioning = 'true'

    const overlay = document.createElement('div')
    overlay.className = 'logos-page-transition'
    overlay.setAttribute('aria-hidden', 'true')

    const transitionVideo =
      document.createElement('video')

    transitionVideo.className =
      'logos-page-transition-video'

    transitionVideo.muted = true
    transitionVideo.loop = true
    transitionVideo.autoplay = true
    transitionVideo.playsInline = true
    transitionVideo.poster =
      '/assets/carousel/packaging.jpg'

    const transitionSource =
      document.createElement('source')

    transitionSource.src =
      '/assets/carousel/packaging.mp4'

    transitionSource.type = 'video/mp4'

    transitionVideo.appendChild(transitionSource)

    const shade = document.createElement('div')
    shade.className = 'logos-page-transition-shade'

    const copy = document.createElement('div')
    copy.className = 'logos-page-transition-copy'

    copy.innerHTML = `
      <p>Identity marks</p>
      <h3>Logos</h3>
      <span>Entering collection ↗</span>
    `

    overlay.append(
      transitionVideo,
      shade,
      copy,
    )

    document.body.appendChild(overlay)

    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'

    const syncTransitionVideo = () => {
      try {
        if (
          Number.isFinite(startingTime) &&
          startingTime >= 0
        ) {
          transitionVideo.currentTime =
            startingTime
        }
      } catch {
        // The poster remains until seeking is available.
      }

      transitionVideo.play().catch(() => {})
    }

    if (transitionVideo.readyState >= 1) {
      syncTransitionVideo()
    } else {
      transitionVideo.addEventListener(
        'loadedmetadata',
        syncTransitionVideo,
        { once: true },
      )
    }

    gsap.set(overlay, {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      borderRadius: '1.45rem',
      borderColor:
        'rgba(255,255,255,.58)',
      boxShadow:
        '0 38px 110px rgba(0,0,0,.72), 0 0 52px rgba(121,74,255,.12)',
    })

    const enterLogosPage = () => {
      const currentTime =
        Number.isFinite(transitionVideo.currentTime)
          ? transitionVideo.currentTime
          : startingTime

      window.sessionStorage.setItem(
        'logosBackgroundTime',
        String(currentTime),
      )

      window.location.assign('/ring-lab.html')
    }

    const reduceMotion =
      window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches

    if (reduceMotion) {
      gsap.set(overlay, {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
        borderRadius: 0,
      })

      enterLogosPage()
      return
    }

    gsap
      .timeline({
        onComplete: enterLogosPage,
      })
      .to(
        copy,
        {
          opacity: 0,
          y: 24,
          duration: 0.38,
          ease: 'power2.in',
        },
        0,
      )
      .to(
        shade,
        {
          opacity: 0.34,
          duration: 0.62,
          ease: 'power2.out',
        },
        0.08,
      )
      .to(
        overlay,
        {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
          borderRadius: 0,
          borderColor:
            'rgba(255,255,255,0)',
          boxShadow:
            '0 0 0 rgba(0,0,0,0)',
          duration: 1.05,
          ease:
            'power4.inOut',
        },
        0,
      )
  }

  const navigateToSection = (
    item,
    closeBrandPage = false,
  ) => {
    const target = navigationTargets[item]

    if (!target) return

    setActiveNavigation(item)
    setMenuOpen(false)

    const completeNavigation = () => {
      scrollToSection(target)

      if (window.location.hash !== target) {
        window.history.pushState(
          { section: item },
          '',
          target,
        )
      } else {
        window.history.replaceState(
          { section: item },
          '',
          target,
        )
      }
    }

    if (closeBrandPage && brandPageOpen) {
      setBrandPageOpen(false)

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(
          completeNavigation,
        )
      })

      return
    }

    completeNavigation()
  }

  useEffect(() => {
    const syncNavigationFromLocation = () => {
      const matchingItem = navigation.find(
        (item) =>
          navigationTargets[item] ===
          window.location.hash,
      )

      if (matchingItem) {
        setActiveNavigation(matchingItem)
      }
    }

    syncNavigationFromLocation()

    window.addEventListener(
      'hashchange',
      syncNavigationFromLocation,
    )

    window.addEventListener(
      'popstate',
      syncNavigationFromLocation,
    )

    return () => {
      window.removeEventListener(
        'hashchange',
        syncNavigationFromLocation,
      )

      window.removeEventListener(
        'popstate',
        syncNavigationFromLocation,
      )
    }
  }, [])

  useEffect(() => {
    let animationFrame = null

    const updateActiveNavigation = () => {
      if (brandPageOpen) {
        setActiveNavigation('Portfolio')
        return
      }

      const laterSections = [
        'Contact',
        'Testimonials',
        'Services',
        'About',
      ]

      const visibleLaterSection =
        laterSections.find((item) => {
          const section = document.querySelector(
            navigationTargets[item],
          )

          if (!section) return false

          return (
            section.getBoundingClientRect().top <=
            120
          )
        })

      if (visibleLaterSection) {
        setActiveNavigation(
          (current) =>
            current === visibleLaterSection
              ? current
              : visibleLaterSection,
        )

        return
      }

      const experienceSection =
        activeCard === 0
          ? 'Home'
          : 'Portfolio'

      setActiveNavigation(
        (current) =>
          current === experienceSection
            ? current
            : experienceSection,
      )
    }

    const requestNavigationUpdate = () => {
      if (animationFrame !== null) return

      animationFrame =
        window.requestAnimationFrame(() => {
          animationFrame = null
          updateActiveNavigation()
        })
    }

    updateActiveNavigation()

    window.addEventListener(
      'scroll',
      requestNavigationUpdate,
      { passive: true },
    )

    window.addEventListener(
      'resize',
      requestNavigationUpdate,
    )

    return () => {
      window.removeEventListener(
        'scroll',
        requestNavigationUpdate,
      )

      window.removeEventListener(
        'resize',
        requestNavigationUpdate,
      )

      if (animationFrame !== null) {
        window.cancelAnimationFrame(
          animationFrame,
        )
      }
    }
  }, [activeCard, brandPageOpen])

  useEffect(() => {
    if (!brandPageOpen) return undefined

    const oldHtmlOverflow =
      document.documentElement.style.overflow
    const oldBodyOverflow =
      document.body.style.overflow

    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setBrandPageOpen(false)
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('keydown', handleEscape)

      document.documentElement.style.overflow =
        oldHtmlOverflow

      document.body.style.overflow =
        oldBodyOverflow

      window.requestAnimationFrame(() => {
        ScrollTrigger.refresh()
      })
    }
  }, [brandPageOpen])

  /*
    Endless project navigation inside the opened Brand Guidelines page.
    This does not change the card-to-page opening animation.
  */
  useEffect(() => {
    if (!brandPageOpen || !brandPageStage.current) {
      return undefined
    }

    const stage = brandPageStage.current
    let wheelLocked = false
    let wheelTimer = null

    const moveProject = (direction) => {
      setBrandProjectIndex((current) => {
        const total = brandGuidelineProjects.length
        return (current + direction + total) % total
      })
    }

    const handleWheel = (event) => {
      event.preventDefault()

      if (
        wheelLocked ||
        Math.abs(event.deltaY) < 8
      ) {
        return
      }

      wheelLocked = true
      moveProject(event.deltaY > 0 ? 1 : -1)

      wheelTimer = window.setTimeout(() => {
        wheelLocked = false
      }, 470)
    }

    const handleProjectKeys = (event) => {
      if (
        event.key === 'ArrowDown' ||
        event.key === 'PageDown'
      ) {
        event.preventDefault()
        moveProject(1)
      }

      if (
        event.key === 'ArrowUp' ||
        event.key === 'PageUp'
      ) {
        event.preventDefault()
        moveProject(-1)
      }
    }

    stage.addEventListener(
      'wheel',
      handleWheel,
      { passive: false },
    )

    window.addEventListener(
      'keydown',
      handleProjectKeys,
    )

    return () => {
      stage.removeEventListener(
        'wheel',
        handleWheel,
      )

      window.removeEventListener(
        'keydown',
        handleProjectKeys,
      )

      if (wheelTimer) {
        window.clearTimeout(wheelTimer)
      }
    }
  }, [brandPageOpen])

  /*
    The selected Brand Guidelines card is duplicated at its exact
    viewport rectangle and expands into the new full-screen page.
  */
  useLayoutEffect(() => {
    if (
      !brandPageOpen ||
      !brandPageStage.current ||
      !brandPageOrigin.current
    ) {
      return undefined
    }

    const stage = brandPageStage.current
    const originVideo = brandPageOriginVideo.current
    const backgroundVideo =
      brandPageBackgroundVideo.current
    const origin = brandPageOrigin.current

    if (originVideo) {
      try {
        originVideo.currentTime =
          brandPageOriginTime.current
      } catch {
        // Poster remains visible until metadata is available.
      }

      originVideo.play().catch(() => {})
    }

    if (backgroundVideo) {
      backgroundVideo.play().catch(() => {})
    }

    const context = gsap.context(() => {
      const cardCopy = stage.querySelector(
        '.brand-page-card-copy',
      )

      const cardShade = stage.querySelector(
        '.brand-page-card-shade',
      )

      const originLayer = stage.querySelector(
        '.brand-page-origin-video',
      )

      const backgroundLayer = stage.querySelector(
        '.brand-page-background-video',
      )

      const fadedOverlay = stage.querySelector(
        '.brand-page-faded-overlay',
      )

      const pageInterface = stage.querySelector(
        '.brand-page-interface',
      )

      gsap.set(stage, {
        top: origin.top,
        left: origin.left,
        width: origin.width,
        height: origin.height,
        borderRadius: '1.45rem',
        boxShadow:
          '0 38px 110px rgba(0,0,0,.72), 0 0 0 1px rgba(255,255,255,.22)',
      })

      gsap.set(backgroundLayer, {
        opacity: 0,
      })

      gsap.set(fadedOverlay, {
        opacity: 0,
      })

      gsap.set(pageInterface, {
        opacity: 0,
        y: 30,
      })

      const opening = gsap.timeline()

      opening
        .to(
          stage,
          {
            top: 0,
            left: 0,
            width: '100vw',
            height: '100svh',
            borderRadius: '0rem',
            boxShadow: '0 0 0 rgba(0,0,0,0)',
            duration: 1.2,
            ease: 'power4.inOut',
          },
          0,
        )
        .to(
          cardCopy,
          {
            opacity: 0,
            y: -22,
            duration: 0.34,
            ease: 'power2.in',
          },
          0.18,
        )
        .to(
          cardShade,
          {
            opacity: 0,
            duration: 0.52,
            ease: 'power2.inOut',
          },
          0.28,
        )
        .to(
          backgroundLayer,
          {
            opacity: 0.62,
            duration: 0.66,
            ease: 'power2.inOut',
          },
          0.48,
        )
        .to(
          originLayer,
          {
            opacity: 0,
            duration: 0.58,
            ease: 'power2.inOut',
          },
          0.55,
        )
        .to(
          fadedOverlay,
          {
            opacity: 1,
            duration: 0.54,
            ease: 'power2.out',
          },
          0.64,
        )
        .to(
          pageInterface,
          {
            opacity: 1,
            y: 0,
            duration: 0.68,
            ease: 'power3.out',
          },
          0.78,
        )
    }, stage)

    return () => {
      context.revert()
    }
  }, [brandPageOpen])

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return undefined

    const lenis = new Lenis({
      duration: 1.08,
      smoothWheel: true,
      syncTouch: false,
    })

    lenis.on('scroll', ScrollTrigger.update)
    const update = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(update)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(update)
      lenis.destroy()
    }
  }, [])

  useEffect(() => {
    const source = heroVideo.current
    const destination = homeCardVideo.current
    if (!source || !destination) return undefined

    const alignVideos = () => {
      if (Number.isFinite(source.currentTime) && Math.abs(destination.currentTime - source.currentTime) > 0.35) {
        destination.currentTime = source.currentTime
      }
      destination.play().catch(() => {})
    }

    source.addEventListener('playing', alignVideos)
    destination.addEventListener('canplay', alignVideos)
    alignVideos()

    return () => {
      source.removeEventListener('playing', alignVideos)
      destination.removeEventListener('canplay', alignVideos)
    }
  }, [videoReady])

  /* Active carousel video playback */
  useEffect(() => {
    const cardVideos = Array.from(
      root.current?.querySelectorAll('.carousel-card-video video') ?? [],
    )
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    cardVideos.forEach((video, index) => {
      if (
        !brandPageOpen &&
        !reduceMotion &&
        index === activeCard
      ) {
        video.play().catch(() => {})
      } else {
        video.pause()
      }
    })

    return () => {
      cardVideos.forEach((video) => video.pause())
    }
  }, [activeCard, brandPageOpen])

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const cards = gsap.utils.toArray('.carousel-card')
      const otherCards = cards.slice(1)

      const setCardGeometry = () => {
        const mobile = window.innerWidth <= 700
        const cardWidth = mobile
          ? Math.min(window.innerWidth * 0.72, 300)
          : Math.min(window.innerWidth * 0.235, 350)
        const cardHeight = cardWidth * 1.38
        const cardGap = mobile ? 28 : 56
        const radius =
          (cardWidth + cardGap) /
          (2 * Math.sin(Math.PI / carouselCards.length))

        root.current?.style.setProperty('--carousel-card-width', `${cardWidth}px`)
        root.current?.style.setProperty('--carousel-card-height', `${cardHeight}px`)
        root.current?.style.setProperty('--carousel-radius', `${radius}px`)
        root.current?.style.setProperty('--video-scale-x', `${cardWidth / window.innerWidth}`)
        root.current?.style.setProperty('--video-scale-y', `${cardHeight / window.innerHeight}`)
      }

      setCardGeometry()

      if (reduceMotion) {
        gsap.set('.hero-interface, .carousel-interface, .carousel-card', { clearProps: 'all' })
        return
      }

      gsap.set('[data-reveal]', { y: 32, opacity: 0 })
      gsap.set('.expertise-card', { y: 38, opacity: 0 })
      gsap.set('.carousel-interface', { opacity: 0 })
      gsap.set(otherCards, { opacity: 0 })
      gsap.set('.home-card', { opacity: 0 })
      gsap.set(carouselRing.current, { rotationY: 0 })

      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } })
      intro
        .from('.site-header', { y: -24, opacity: 0, duration: 0.8 })
        .to('[data-reveal]', {
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.09,
        }, '-=0.35')
        .to('.expertise-card', {
          y: 0,
          opacity: 1,
          duration: 0.85,
          stagger: 0.08,
        }, '-=0.55')

      const experienceTimeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: experience.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.7,
          invalidateOnRefresh: true,
          onRefreshInit: setCardGeometry,
          onUpdate: (self) => {
            const carouselProgress = clamp((self.progress - 0.145) / 0.855, 0, 1)
            const nextIndex = Math.round(carouselProgress * (carouselCards.length - 1))
            setActiveCard((current) => (current === nextIndex ? current : nextIndex))
          },
        },
      })

      experienceTimeline
        .to('.hero-interface', {
          opacity: 0,
          y: -28,
          filter: 'blur(10px)',
          duration: 0.035,
          pointerEvents: 'none',
        }, 0.012)
        .to('.video-atmosphere', {
          width: () =>
            getComputedStyle(root.current)
              .getPropertyValue('--carousel-card-width')
              .trim(),
          height: () =>
            getComputedStyle(root.current)
              .getPropertyValue('--carousel-card-height')
              .trim(),
          borderRadius: '1.45rem',
          boxShadow: '0 36px 110px rgba(0, 0, 0, 0.72), 0 0 0 1px rgba(255, 255, 255, 0.22)',
          duration: 0.105,
          ease: 'power3.inOut',
        }, 0.025)
        .to('.video-vignette, .video-grain', {
          opacity: 0,
          duration: 0.055,
          ease: 'power2.out',
        }, 0.06)
        .to('.carousel-interface', {
          opacity: 1,
          duration: 0.04,
        }, 0.082)
        .to(otherCards, {
          opacity: 1,
          duration: 0.045,
          stagger: 0.0015,
        }, 0.092)
        .to('.home-card', {
          opacity: 1,
          duration: 0.018,
        }, 0.112)
        .to('.video-atmosphere', {
          opacity: 0,
          duration: 0.025,
          pointerEvents: 'none',
        }, 0.122)
        .to('.home-card .carousel-card-shade, .home-card .carousel-card-content', {
          opacity: 1,
          duration: 0.025,
          ease: 'power2.out',
        }, 0.132)
        .to(carouselRing.current, {
          rotationY: -angleStep * (carouselCards.length - 1),
          duration: 0.855,
          ease: 'none',
        }, 0.145)

      const onResize = () => {
        setCardGeometry()
        ScrollTrigger.refresh()
      }

      window.addEventListener('resize', onResize)

      return () => {
        window.removeEventListener('resize', onResize)
      }
    }, root)

    return () => context.revert()
  }, [angleStep])

  const handleCardPointer = (event) => {
    const card = event.currentTarget
    const rect = card.getBoundingClientRect()
    card.style.setProperty('--pointer-x', `${event.clientX - rect.left}px`)
    card.style.setProperty('--pointer-y', `${event.clientY - rect.top}px`)
    card.style.setProperty('--rotate-x', `${((event.clientY - rect.top) / rect.height - 0.5) * -4}deg`)
    card.style.setProperty('--rotate-y', `${((event.clientX - rect.left) / rect.width - 0.5) * 5}deg`)
  }

  const resetCard = (event) => {
    const card = event.currentTarget
    card.style.setProperty('--rotate-x', '0deg')
    card.style.setProperty('--rotate-y', '0deg')
  }

  const active = carouselCards[activeCard]

  return (
    <div className="site" ref={root}>
      <div className="black-foundation" aria-hidden="true" />

      {/* ===== GLOBAL SITE NAVIGATION ===== */}

      <header
        className={`site-header global-site-header ${
          brandPageOpen
            ? 'is-over-project-page'
            : ''
        }`}
      >
        <a
          className="monogram"
          href="#home"
          aria-label="John Wolf home"
          onClick={(event) => {
            event.preventDefault()
            navigateToSection('Home', true)
          }}
        >
          JW<span>.</span>
        </a>

        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          aria-label={
            menuOpen
              ? 'Close navigation'
              : 'Open navigation'
          }
          onClick={() =>
            setMenuOpen((open) => !open)
          }
        >
          <span />
          <span />
          <span />
          <span className="sr-only">
            Toggle navigation
          </span>
        </button>

        <nav
          className={`primary-navigation ${
            menuOpen ? 'is-open' : ''
          }`}
          id="primary-navigation"
          aria-label="Primary navigation"
        >
          {navigation.map((item) => (
            <a
              className={
                activeNavigation === item
                  ? 'is-active'
                  : ''
              }
              href={navigationTargets[item]}
              key={item}
              aria-current={
                activeNavigation === item
                  ? 'page'
                  : undefined
              }
              onClick={(event) => {
                event.preventDefault()
                navigateToSection(item, true)
              }}
            >
              {item}
            </a>
          ))}
        </nav>

        <button
          className="header-cta"
          type="button"
          onClick={() =>
            navigateToSection('Contact', true)
          }
        >
          Start a Project
          <span aria-hidden="true">↗</span>
        </button>
      </header>

      <section className="experience" id="home" ref={experience}>
        <div className="experience-sticky" ref={stickyStage}>
          <div className={`video-atmosphere ${videoReady ? 'is-ready' : ''}`} aria-hidden="true">
            <video
              ref={heroVideo}
              className="hero-video"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster="/assets/hero-neon-poster.png"
              onCanPlay={() => setVideoReady(true)}
            >
              <source src="/assets/hero-neon.mp4" type="video/mp4" />
            </video>
            <div className="video-vignette" />
            <div className="video-grain" />
          </div>

          <div className="hero-interface">
            <div
              className="global-header-spacer"
              aria-hidden="true"
            />

            <div className="hero-layout">
              <div className="hero-copy">
                <p className="eyebrow" data-reveal>
                  Independent graphic designer
                </p>

                <h1 data-reveal>
                  John <span>Wolf</span>
                </h1>

                <p className="role" data-reveal>
                  Graphic Designer <span aria-hidden="true">+</span> Visual Storyteller
                </p>

                <p className="hero-statement" data-reveal>
                  I transform ideas into bold visual identities, immersive digital experiences,
                  and design systems built to leave a lasting impression.
                </p>

                <div className="hero-actions" data-reveal>
                  <button className="button button-primary" type="button" onClick={() => scrollToSection('#portfolio')}>
                    Explore Selected Work
                    <span aria-hidden="true">→</span>
                  </button>
                  <button className="button button-secondary" type="button" onClick={() => scrollToSection('#about')}>
                    Let's Get Started
                  </button>
                </div>

                <div className="availability" data-reveal>
                  <span className="availability-dot" />
                  Available for select branding and web projects
                </div>
              </div>
            </div>

            <div className="expertise-grid">
              {expertise.map((item, index) => (
                <article
                  className="expertise-card"
                  key={item.title}
                  onPointerMove={handleCardPointer}
                  onPointerLeave={resetCard}
                >
                  <div className="icon-shell">
                    <ExpertiseIcon name={item.icon} />
                  </div>
                  <div>
                    <h2>{item.title}</h2>
                    <p>{item.body}</p>
                  </div>
                </article>
              ))}
            </div>

            <button className="scroll-cue" type="button" onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}>
              <span>Scroll to enter</span>
              <i aria-hidden="true" />
            </button>
          </div>

          <div className="carousel-interface" id="portfolio">
            <div className="carousel-heading">
              <p>02 / Design archive</p>
              <h2>Move through the work.</h2>
            </div>

            <div className="carousel-active-copy" aria-live="polite">
              <span>{String(activeCard + 1).padStart(2, '0')} / {carouselCards.length}</span>
              <p>{active.eyebrow}</p>
              <h3>{active.title}</h3>
              <div className="active-rule" />
              <small>{active.description}</small>
            </div>

            <div className="carousel-viewport" aria-label="Graphic design portfolio categories">
              <div className="carousel-ring" ref={carouselRing}>
                {carouselCards.map((card, index) => (
                  <article
                    className={`carousel-card ${index === 0 ? 'home-card' : ''} ${activeCard === index ? 'is-active' : ''} ${card.title === 'Brand Guidelines' || card.title === 'Logos' ? 'is-brand-page-trigger' : ''}`}
                    style={{ '--card-index': index, '--card-angle': `${index * angleStep}deg` }}
                    key={card.title}
                    aria-label={card.title}
                    role={
                      card.title === 'Logos' ||
                      card.title === 'Brand Guidelines'
                        ? 'button'
                        : undefined
                    }
                    tabIndex={
                      (
                        card.title === 'Logos' ||
                        card.title === 'Brand Guidelines'
                      ) &&
                      activeCard === index
                        ? 0
                        : undefined
                    }
                    onClick={(event) => {
                      if (
                        card.title === 'Logos' &&
                        activeCard === index
                      ) {
                        event.preventDefault()
                        openLogosPage(event)
                        return
                      }

                      if (
                        card.title === 'Brand Guidelines' &&
                        activeCard === index
                      ) {
                        openBrandGuidelines(event)
                      }
                    }}
                    onKeyDown={(event) => {
                      const isActivationKey =
                        event.key === 'Enter' ||
                        event.key === ' '

                      if (
                        card.title === 'Logos' &&
                        activeCard === index &&
                        isActivationKey
                      ) {
                        event.preventDefault()
                        openLogosPage(event)
                        return
                      }

                      if (
                        card.title === 'Brand Guidelines' &&
                        activeCard === index &&
                        isActivationKey
                      ) {
                        event.preventDefault()
                        openBrandGuidelines(event)
                      }
                    }}
                  >
                    <div className="carousel-card-video">
                      <video
                        ref={index === 0 ? homeCardVideo : undefined}
                        muted
                        loop
                        playsInline
                        preload={index === 0 ? 'auto' : 'metadata'}
                        poster={card.poster}
                        aria-hidden="true"
                      >
                        <source src={card.video} type="video/mp4" />
                      </video>
                      <div className="carousel-card-shade" />
                    </div>

                    <div className="carousel-card-content">
                      <p>{card.eyebrow}</p>
                      <h3>{card.title}</h3>
                      <span>View collection ↗</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="carousel-scroll-note">
              <span>Continue scrolling</span>
              <i />
            </div>
          </div>
        </div>
      </section>

      <section className="next-stage" id="about">
        <p>Scene 03</p>
        <h2>The next transformation begins here.</h2>
        <span>
          This black stage is reserved for the transition that will follow the final Contact card.
        </span>
      </section>

      <section className="anchor-section" id="services" aria-hidden="true" />
      <section className="anchor-section" id="testimonials" aria-hidden="true" />
      <section className="anchor-section" id="contact" aria-hidden="true" />

      {brandPageOpen && (
        <section
          className="brand-page-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Brand Guidelines"
        >
          <div
            className="brand-page-stage"
            ref={brandPageStage}
          >
            <video
              className="brand-page-origin-video"
              ref={brandPageOriginVideo}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster="/assets/carousel/brand-guidelines.jpg"
              aria-hidden="true"
            >
              <source
                src="/assets/carousel/brand-guidelines.mp4"
                type="video/mp4"
              />
            </video>

            <video
              className="brand-page-background-video"
              ref={brandPageBackgroundVideo}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster="/assets/brand-guidelines/brand-guidelines-background-poster.jpg"
              aria-hidden="true"
            >
              <source
                src="/assets/brand-guidelines/brand-guidelines-background.mp4"
                type="video/mp4"
              />
            </video>

            <div className="brand-page-card-shade" />
            <div className="brand-page-faded-overlay" />

            <div className="brand-page-card-copy">
              <p>Visual systems</p>
              <h3>Brand Guidelines</h3>
              <span>View collection ↗</span>
            </div>

            <div className="brand-page-interface">
              <span className="brand-page-index brand-page-index-floating">
                {String(brandProjectIndex + 1).padStart(2, '0')}
                {' / '}
                {String(brandGuidelineProjects.length).padStart(2, '0')}
              </span>

              <div className="brand-page-copy">
                <p>03 / Selected systems</p>

                <h2>
                  Brand
                  <br />
                  Guidelines
                </h2>

                <div
                  className="brand-page-active-project"
                  key={activeBrandProject.title}
                >
                  <span>{activeBrandProject.category}</span>
                  <h3>{activeBrandProject.title}</h3>

                  <i />

                  <p>{activeBrandProject.description}</p>

                  <button
                    type="button"
                    aria-label={`Open ${activeBrandProject.title} in the Brand Vault`}
                    onClick={() => {
                      setBrandVaultOpen(true)
                    }}
                  >
                    View Project
                    <span aria-hidden="true">↗</span>
                  </button>
                </div>
              </div>

              <div
                className="brand-project-carousel"
                aria-label="Brand Guidelines projects"
                onTouchStart={(event) => {
                  brandPageTouchStart.current =
                    event.touches[0]?.clientY ?? null
                }}
                onTouchEnd={(event) => {
                  const start = brandPageTouchStart.current
                  const end =
                    event.changedTouches[0]?.clientY

                  brandPageTouchStart.current = null

                  if (
                    start === null ||
                    end === undefined
                  ) {
                    return
                  }

                  const distance = start - end

                  if (Math.abs(distance) < 36) {
                    return
                  }

                  setBrandProjectIndex((current) => {
                    const total =
                      brandGuidelineProjects.length

                    const direction =
                      distance > 0 ? 1 : -1

                    return (
                      current +
                      direction +
                      total
                    ) % total
                  })
                }}
              >
                <div className="brand-project-perspective">
                  {brandGuidelineProjects.map(
                    (project, index) => {
                      const offset =
                        getBrandProjectOffset(
                          index,
                          brandProjectIndex,
                          brandGuidelineProjects.length,
                        )

                      const distance = Math.abs(offset)
                      const limitedDistance = Math.min(
                        distance,
                        4,
                      )
                      const visible = distance <= 4
                      const scale =
                        1 - limitedDistance * 0.08
                      const arcPush =
                        Math.pow(
                          limitedDistance,
                          1.45,
                        ) * 76
                      const verticalShift =
                        offset * 21
                      const tilt =
                        offset * 5.5
                      const depth =
                        limitedDistance * -95

                      return (
                        <button
                          className={`brand-project-card ${
                            offset === 0
                              ? 'is-active'
                              : ''
                          } ${
                            visible
                              ? ''
                              : 'is-hidden'
                          }`}
                          type="button"
                          key={project.title}
                          aria-label={`Select ${project.title}`}
                          aria-current={
                            offset === 0
                              ? 'true'
                              : undefined
                          }
                          tabIndex={
                            offset === 0 ? 0 : -1
                          }
                          onClick={() =>
                            setBrandProjectIndex(index)
                          }
                          style={{
                            zIndex:
                              40 -
                              Math.round(
                                limitedDistance * 4,
                              ),
                            opacity: visible
                              ? 1 - limitedDistance * 0.16
                              : 0,
                            transform: `
                              translate3d(
                                ${arcPush}px,
                                calc(
                                  -50% +
                                  ${verticalShift}vh
                                ),
                                ${depth}px
                              )
                              rotateZ(${tilt}deg)
                              rotateY(${
                                -limitedDistance * 8
                              }deg)
                              scale(${scale})
                            `,
                          }}
                        >
                          <img
                            src={project.image}
                            alt=""
                          />

                          <span className="brand-project-card-shade" />

                          <span className="brand-project-card-copy">
                            <small>
                              {String(index + 1).padStart(2, '0')}
                            </small>

                            <strong>{project.title}</strong>
                          </span>
                        </button>
                      )
                    },
                  )}
                </div>

                <div className="brand-project-scroll-note">
                  <span>Scroll to explore</span>
                  <i />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <BrandVault
        open={
          brandPageOpen &&
          brandVaultOpen
        }
        project={activeBrandProject}
        projects={brandGuidelineProjects}
        activeIndex={brandProjectIndex}
        onClose={() => {
          setBrandVaultOpen(false)
        }}
        onSelectProject={(index) => {
          setBrandProjectIndex(index)
        }}
      />
    </div>
  )
}
