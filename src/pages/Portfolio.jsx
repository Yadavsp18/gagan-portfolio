import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { useVideos } from '../context/VideoContext';
import VideoModal from '../components/VideoModal';
import { getDirectVideoUrl, getYouTubeVideoId } from '../utils/videoUtils';
import './Portfolio.css';

const VIDEOS_PER_PAGE = 3;
const MOBILE_VIDEOS_PER_PAGE = 2;
const PAGE_TRANSITION_MS = 520;

const HoverVideo = ({ previewUrl, thumbnailUrl, title, isPlaying }) => {
  const videoRef = useRef(null);
  const directUrl = getDirectVideoUrl(previewUrl);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !directUrl) return;

    if (isPlaying) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          video.pause();
        });
      }
      return;
    }

    video.pause();
    video.currentTime = 0;
  }, [directUrl, isPlaying]);

  if (!directUrl) return null;

  return (
    <div className="card-thumb-video-wrapper" aria-hidden="true">
      <video
        ref={videoRef}
        src={directUrl}
        className="card-thumb-video"
        muted
        loop
        playsInline
        preload="metadata"
        poster={thumbnailUrl}
        title={`${title} preview`}
      />
    </div>
  );
};

const VideoCard = ({ video, index, onOpen }) => {
  const [isHovered, setIsHovered] = useState(false);
  const hasPreview = Boolean(video.previewUrl);
  const youtubeVideoId = getYouTubeVideoId(video.youtubeUrl);
  const youtubePreviewUrl = youtubeVideoId
    ? `https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&mute=1&controls=0&playsinline=1&loop=1&playlist=${youtubeVideoId}&rel=0&modestbranding=1`
    : '';

  return (
    <article
      className={`work-card card-${(index % 5) + 1} ${hasPreview ? 'has-preview' : ''} ${youtubePreviewUrl ? 'has-youtube-preview' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button className="card-thumb" type="button" onClick={() => onOpen(video)}>
        <div className="card-poster-fallback">
          <span>Video</span>
          <strong>{video.title}</strong>
        </div>
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="card-thumb-img"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />
        <HoverVideo
          previewUrl={video.previewUrl}
          thumbnailUrl={video.thumbnailUrl}
          title={video.title}
          isPlaying={isHovered}
        />
        {!hasPreview && isHovered && youtubePreviewUrl && (
          <>
            <iframe
              className="card-thumb-youtube"
              src={youtubePreviewUrl}
              title={`${video.title} YouTube preview`}
              allow="autoplay; encrypted-media; picture-in-picture"
              loading="lazy"
            />
            <div className="card-youtube-mask" aria-hidden="true"></div>
          </>
        )}
        <div className="card-grid-lines"></div>
        <div className="card-play">
          <Play size={26} fill="currentColor" strokeWidth={1.8} />
        </div>
        <div className="card-overlay"></div>
        <div className="card-info">
          <h3 className="card-title">{video.title}</h3>
          <p className="card-desc">{video.description}</p>
        </div>
        <div className="card-badge">{video.year || '2026'}</div>
      </button>
    </article>
  );
};

const Portfolio = () => {
  const { videos } = useVideos();
  const [currentPage, setCurrentPage] = useState(1);
  const [videosPerPage, setVideosPerPage] = useState(VIDEOS_PER_PAGE);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [pageDirection, setPageDirection] = useState('next');
  const [transitionPage, setTransitionPage] = useState(null);
  const touchStartX = useRef(null);
  const transitionTimer = useRef(null);
  const projectCount = videos.length;
  const totalPages = Math.max(1, Math.ceil(videos.length / videosPerPage));
  const activePage = transitionPage || currentPage;
  const isPageTransitioning = transitionPage !== null;
  const pageStart = (currentPage - 1) * videosPerPage;
  const transitionPageStart = transitionPage ? (transitionPage - 1) * videosPerPage : 0;

  const visibleVideos = videos.slice(pageStart, pageStart + videosPerPage);
  const transitionVideos = transitionPage
    ? videos.slice(transitionPageStart, transitionPageStart + videosPerPage)
    : [];

  const goToPage = (page) => {
    const nextPage = Math.min(Math.max(page, 1), totalPages);
    if (nextPage === currentPage || isPageTransitioning) return;

    setPageDirection(nextPage > currentPage ? 'next' : 'prev');
    setTransitionPage(nextPage);

    window.clearTimeout(transitionTimer.current);
    transitionTimer.current = window.setTimeout(() => {
      setCurrentPage(nextPage);
      setTransitionPage(null);
    }, PAGE_TRANSITION_MS);
  };

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null) return;

    const touchEndX = event.changedTouches[0].clientX;
    const difference = touchStartX.current - touchEndX;
    touchStartX.current = null;

    if (Math.abs(difference) < 50) return;
    if (difference > 0) {
      goToPage(activePage + 1);
    } else {
      goToPage(activePage - 1);
    }
  };

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    return () => {
      window.clearTimeout(transitionTimer.current);
    };
  }, []);

  useEffect(() => {
    const updateVideosPerPage = () => {
      setVideosPerPage(window.innerWidth <= 640 ? MOBILE_VIDEOS_PER_PAGE : VIDEOS_PER_PAGE);
    };

    updateVideosPerPage();
    window.addEventListener('resize', updateVideosPerPage);

    return () => {
      window.removeEventListener('resize', updateVideosPerPage);
    };
  }, []);

  useEffect(() => {
    /*
    Custom cursor logic can be restored later.

    const cursor = document.getElementById('cursor');
    const ring = document.getElementById('cursor-ring');
    let mx = 0;
    let my = 0;
    let rx = 0;
    let ry = 0;
    let animationFrame;

    const handleMouseMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (cursor) {
        cursor.style.left = `${mx}px`;
        cursor.style.top = `${my}px`;
      }
    };

    const animateRing = () => {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      if (ring) {
        ring.style.left = `${rx}px`;
        ring.style.top = `${ry}px`;
      }
      animationFrame = requestAnimationFrame(animateRing);
    };

    document.addEventListener('mousemove', handleMouseMove);
    animateRing();

    const hoverables = document.querySelectorAll('a, button, .work-card, .service-item, .testimonial-card, .skill-item, .nav-link');
    const addHover = () => document.body.classList.add('hovering');
    const removeHover = () => document.body.classList.remove('hovering');
    hoverables.forEach((el) => {
      el.addEventListener('mouseenter', addHover);
      el.addEventListener('mouseleave', removeHover);
    });
    */

    const reveals = document.querySelectorAll('.reveal');
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach((el) => revealObs.observe(el));

    const sections = document.querySelectorAll('.page-section');
    const sectionObs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('section-visible');
        }
      });
    }, { threshold: 0.18, rootMargin: '-12% 0px -18% 0px' });
    sections.forEach((el) => sectionObs.observe(el));

    return () => {
      /*
      document.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrame);
      hoverables.forEach((el) => {
        el.removeEventListener('mouseenter', addHover);
        el.removeEventListener('mouseleave', removeHover);
      });
      */
      revealObs.disconnect();
      sectionObs.disconnect();
      document.body.classList.remove('hovering');
    };
  }, [currentPage, visibleVideos.length]);

  return (
    <div className="portfolio-page">
      <section id="hero" className="hero-section page-section section-visible">
        <div className="hero-label">Professional Video Editor</div>

        <h1 className="hero-title">
          <span className="line"><span className="line-inner">Crafting</span></span>
          <span className="line"><span className="line-inner"><em>Cinematic</em></span></span>
          <span className="line"><span className="line-inner">Edits</span></span>
        </h1>

        <div className="hero-sub">
          <p>Transforming raw footage into compelling visual stories for brands, creators, and fast-moving social campaigns.</p>
          <button className="hero-cta" onClick={() => document.getElementById('work').scrollIntoView({ behavior: 'smooth' })}>
            <span className="cta-arrow"></span>
            View My Work
          </button>
        </div>

        <div className="hero-scroll">Scroll</div>
      </section>

      <section id="about" className="about-section page-section">
        <div className="about-visual reveal">
          <div className="about-img-frame">
            <img src="/profile.jpeg" alt="Gagan - Video Editor" className="profile-image" />
          </div>
          <div className="about-img-border"></div>
          <div className="about-stats">
            <div className="stat-number">{projectCount}+</div>
            <div className="stat-label">Videos</div>
          </div>
        </div>

        <div className="about-content">
          <div className="section-tag reveal">About Me</div>
          <h2 className="section-title reveal reveal-delay-1">Turning Footage into <em>Stories</em></h2>
          <p className="about-text reveal reveal-delay-2">
            Every frame is an opportunity to create momentum. I shape raw footage into sharp, emotional edits with strong pacing, clean structure, and a polished final look.
          </p>
          <p className="about-text reveal reveal-delay-3">
            The portfolio is set up for free hosting: short local previews play on hover, while the full videos open in a modal from an embeddable video link.
          </p>
          <div className="skills-grid reveal reveal-delay-4">
            <div className="skill-item">Adobe Premiere Pro</div>
            <div className="skill-item">DaVinci Resolve</div>
            <div className="skill-item">Cap Cut</div>
          </div>
        </div>
      </section>

      <section id="work" className="work-section page-section">
        <div className="work-header reveal">
          <div>
            <div className="section-tag">Work I Have Done</div>
            <h2 className="section-title">Featured <em>Edits</em></h2>
          </div>
          <div className="work-count">
            <strong>{videos.length}</strong>
            <span>videos</span>
          </div>
        </div>

        <div className={`work-stage ${isPageTransitioning ? 'is-moving' : ''}`} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <div className={`work-grid ${isPageTransitioning ? `is-exiting exit-${pageDirection}` : ''}`}>
            {visibleVideos.map((video, index) => (
              <VideoCard key={video.id} video={video} index={index} onOpen={setSelectedVideo} />
            ))}
          </div>

          {isPageTransitioning && (
            <div className={`work-grid is-entering enter-${pageDirection}`}>
              {transitionVideos.map((video, index) => (
                <VideoCard key={video.id} video={video} index={index} onOpen={setSelectedVideo} />
              ))}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="portfolio-pagination reveal">
            <button
              className="pagination-btn"
              type="button"
              onClick={() => goToPage(activePage - 1)}
              disabled={activePage === 1 || isPageTransitioning}
              aria-label="Previous videos"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="pagination-pages" aria-label="Video pages">
              {Array.from({ length: totalPages }, (_, index) => {
                const page = index + 1;
                return (
                  <button
                    key={page}
                    type="button"
                    className={activePage === page ? 'active' : ''}
                    onClick={() => goToPage(page)}
                    disabled={isPageTransitioning}
                    aria-label={`Go to video page ${page}`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
            <button
              className="pagination-btn"
              type="button"
              onClick={() => goToPage(activePage + 1)}
              disabled={activePage === totalPages || isPageTransitioning}
              aria-label="Next videos"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </section>

      <section id="services" className="services-section page-section">
        <div className="services-intro">
          <div className="section-tag reveal">What I Do</div>
          <h2 className="section-title reveal reveal-delay-1">Editing <em>Services</em></h2>
        </div>

        <div className="services-grid">
          <div className="service-item reveal">
            <div className="service-num">01</div>
            <div className="service-name">Video Editing</div>
            <div className="service-desc">Precise cuts, seamless transitions, and rhythmic pacing that keeps audiences engaged from start to finish.</div>
          </div>

          <div className="service-item reveal reveal-delay-1">
            <div className="service-num">02</div>
            <div className="service-name">Color Grading</div>
            <div className="service-desc">Professional color correction and cinematic grading to give your footage a signature look.</div>
          </div>

          <div className="service-item reveal reveal-delay-2">
            <div className="service-num">03</div>
            <div className="service-name">Motion Graphics</div>
            <div className="service-desc">Titles, lower thirds, animated text, and visual effects that elevate your production value.</div>
          </div>


          <div className="service-item reveal reveal-delay-4">
            <div className="service-num">04</div>
            <div className="service-name">Social Media Edits</div>
            <div className="service-desc">Platform-optimized cuts for Instagram, TikTok, and YouTube that stop the scroll.</div>
          </div>

        </div>
      </section>

      <section id="testimonials" className="testimonials-section page-section">
        <div className="section-tag reveal">Feedback</div>
        <h2 className="section-title reveal reveal-delay-1">Client <em>Reviews</em></h2>
        <div className="testimonials-grid">
          <div className="testimonial-card reveal">
            <span className="quote-mark">&ldquo;</span>
            <p className="testimonial-text">The edit was clean, fast, and exactly what the campaign needed. The pacing made the product feel premium immediately.</p>
            <div className="testimonial-author">
              <div className="author-avatar">BP</div>
              <div>
                <div className="author-name">Blen Pinto</div>
                <div className="author-role">Maneging Director B Hive</div>
              </div>
            </div>
          </div>
          <div className="testimonial-card reveal reveal-delay-1">
            <span className="quote-mark">&ldquo;</span>
            <p className="testimonial-text">Great attention to detail and a very smooth delivery. The final reel looked polished without losing the original energy.</p>
            <div className="testimonial-author">
              <div className="author-avatar">B</div>
              <div>
                <div className="author-name">Balaji</div>
                <div className="author-role">Fiverr Client</div>
              </div>
            </div>
          </div>
          <div className="testimonial-card reveal reveal-delay-2">
            <span className="quote-mark">&ldquo;</span>
            <p className="testimonial-text">Turned hours of raw footage into a tight promo that captured our brand. The sound design really tied everything together.</p>
            <div className="testimonial-author">
              <div className="author-avatar">R</div>
              <div>
                <div className="author-name">Rajiv</div>
                <div className="author-role">Marketing Manager</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="contact-section page-section">
        <div className="contact-content">
          <div className="contact-copy">
            <div className="section-tag reveal">Get in Touch</div>
            <h2 className="contact-title reveal reveal-delay-1">Let&apos;s Work <em>Together</em></h2>
            <p className="contact-text reveal reveal-delay-2">Send your footage brief, timeline, and reference style. I will get back with a clear next step.</p>
          </div>
          <div className="contact-links reveal reveal-delay-3">
            <a href="mailto:gagan.rhyr1@gmail.com" className="contact-link">
              <span className="link-icon">Email</span>
              <span className="link-value">gagan.rhyr1@gmail.com</span>
            </a>
            <a href="tel:+917760062252" className="contact-link">
              <span className="link-icon">Phone</span>
              <span className="link-value">+91 77600 62252</span>
            </a>
            <div className="contact-link">
              <span className="link-icon">Based</span>
              <span className="link-value">Available Worldwide - Remote Friendly</span>
            </div>
          </div>

          <footer className="footer contact-footer">
            <div className="footer-copy">Copyright {new Date().getFullYear()} Gagan. All rights reserved.</div>
            <ul className="footer-socials">
              <li><a href="https://youtube.com" target="_blank" rel="noopener noreferrer">YouTube</a></li>
              <li><a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
              <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a></li>
            </ul>
          </footer>
        </div>
      </section>

      <VideoModal
        isOpen={Boolean(selectedVideo)}
        onClose={() => setSelectedVideo(null)}
        videoUrl={selectedVideo?.youtubeUrl || selectedVideo?.embedUrl || selectedVideo?.videoUrl || ''}
        title={selectedVideo?.title || 'Portfolio video'}
      />
    </div>
  );
};

export default Portfolio;
