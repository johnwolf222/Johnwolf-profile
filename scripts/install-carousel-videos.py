#!/usr/bin/env python3
from __future__ import annotations

from datetime import datetime
from pathlib import Path
import re
import shutil
import sys

ROOT = Path.cwd()
APP = ROOT / 'src' / 'App.jsx'
ASSET_DIR = ROOT / 'public' / 'assets' / 'carousel'

EXPECTED_SLUGS = [
    'logos',
    'brand-guidelines',
    'websites',
    'illustrations',
    'packaging',
    'social-campaigns',
    'print-design',
    'typography',
    'motion-design',
    'creative-direction',
    'photo-composites',
    'case-studies',
    'about',
    'contact',
]

if not (ROOT / 'package.json').exists() or not APP.exists():
    raise SystemExit(
        'ERROR: Run this installer from the john-wolf-portfolio-starter project root.'
    )

missing = []
for slug in EXPECTED_SLUGS:
    for extension in ('mp4', 'jpg'):
        path = ASSET_DIR / f'{slug}.{extension}'
        if not path.exists():
            missing.append(str(path.relative_to(ROOT)))

if missing:
    raise SystemExit('ERROR: Missing carousel assets:\n  ' + '\n  '.join(missing))

stamp = datetime.now().strftime('%Y%m%d-%H%M%S')
backup = APP.with_name(f'App.jsx.before-card-videos-{stamp}')
shutil.copy2(APP, backup)

text = APP.read_text()

cards_block = """const carouselCards = [
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
    video: '/assets/carousel/logos.mp4',
    poster: '/assets/carousel/logos.jpg',
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
    title: 'Packaging',
    eyebrow: 'Product presence',
    description: 'Shelf-ready design that makes the product feel considered before it is opened.',
    video: '/assets/carousel/packaging.mp4',
    poster: '/assets/carousel/packaging.jpg',
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
]"""

cards_pattern = re.compile(
    r"const carouselCards = \[.*?\n\]\n\nfunction scrollToSection",
    re.DOTALL,
)
if len(cards_pattern.findall(text)) != 1:
    raise SystemExit(
        'ERROR: Could not safely identify the current carouselCards block. '
        f'Backup created at {backup.name}; no source changes were written.'
    )
text = cards_pattern.sub(cards_block + '\n\nfunction scrollToSection', text, count=1)

old_render_pattern = re.compile(
    r"\s{20}\{card\.type === 'video' \? \(.*?\n\s{20}\)\}\n\n"
    r"(?=\s{20}<div className=\"carousel-card-content\">)",
    re.DOTALL,
)

video_render = """                    <div className=\"carousel-card-video\">
                      <video
                        ref={index === 0 ? homeCardVideo : undefined}
                        muted
                        loop
                        playsInline
                        preload={index === 0 ? 'auto' : 'metadata'}
                        poster={card.poster}
                        aria-hidden=\"true\"
                      >
                        <source src={card.video} type=\"video/mp4\" />
                      </video>
                      <div className=\"carousel-card-shade\" />
                    </div>

"""

matches = old_render_pattern.findall(text)
if len(matches) != 1:
    raise SystemExit(
        'ERROR: Could not safely identify the existing card artwork renderer. '
        f'Backup created at {backup.name}; no source changes were written.'
    )
text = old_render_pattern.sub(video_render, text, count=1)

playback_marker = '  /* Active carousel video playback */\n'
if playback_marker not in text:
    insertion_point = '  useLayoutEffect(() => {'
    if insertion_point not in text:
        raise SystemExit(
            'ERROR: Could not locate the animation setup insertion point. '
            f'Backup created at {backup.name}; no source changes were written.'
        )

    playback_effect = """  /* Active carousel video playback */
  useEffect(() => {
    const cardVideos = Array.from(
      root.current?.querySelectorAll('.carousel-card-video video') ?? [],
    )
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    cardVideos.forEach((video, index) => {
      if (!reduceMotion && index === activeCard) {
        video.play().catch(() => {})
      } else {
        video.pause()
      }
    })

    return () => {
      cardVideos.forEach((video) => video.pause())
    }
  }, [activeCard])

"""
    text = text.replace(insertion_point, playback_effect + insertion_point, 1)

APP.write_text(text)

print(f'Installed 14 optimized carousel videos.')
print(f'Backup: {backup.name}')
print('Only the active/front card plays; the remaining cards use lightweight posters.')
