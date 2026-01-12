"use client";
import "./Menu.css";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

const Menu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const menuSidebarRef = useRef(null);
  const menuButtonRef = useRef(null);
  const allSplitsRef = useRef([]); // Все элементы для scramble

  const scrambleText = (elements, duration = 0.4) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";

    elements.forEach((char) => {
      const originalText = char.textContent;
      let iterations = 0;
      const maxIterations = Math.floor(Math.random() * 6) + 3;

      gsap.set(char, { opacity: 1 });

      const scrambleInterval = setInterval(() => {
        char.textContent = chars[Math.floor(Math.random() * chars.length)];
        iterations++;

        if (iterations >= maxIterations) {
          clearInterval(scrambleInterval);
          char.textContent = originalText;
        }
      }, 25);

      setTimeout(() => {
        clearInterval(scrambleInterval);
        char.textContent = originalText;
      }, duration * 1000);
    });
  };

  const openMenu = () => {
    setIsOpen(true);
    setIsAnimating(true);

    const tl = gsap.timeline({
      onComplete: () => setIsAnimating(false),
    });

    // Скрываем кнопку
    tl.to(menuButtonRef.current, {
      opacity: 0,
      pointerEvents: "none",
      duration: 0.2,
    });

    // Открываем сайдбар
    tl.to(menuSidebarRef.current, {
      x: 0,
      duration: 0.5,
      ease: "power3.out",
    }, "<");

    // Показываем все элементы
    const allElements = menuSidebarRef.current.querySelectorAll(
      ".menu-header h2, .menu-section-label, .menu-link-text, .menu-link-arrow, .menu-socials a, .menu-close"
    );
    
    tl.to(allElements, {
      opacity: 1,
      y: 0,
      duration: 0.4,
      stagger: 0.03,
      ease: "power3.out",
    }, "-=0.3");

    // Scramble эффект на ВСЕ элементы
    tl.add(() => {
      allSplitsRef.current.forEach((split, splitIndex) => {
        split.chars.forEach((char, charIndex) => {
          setTimeout(() => {
            scrambleText([char], 0.5);
          }, (splitIndex * 50) + (charIndex * 20));
        });
      });
    }, "-=0.3");
  };

  const closeMenu = () => {
    setIsOpen(false);
    setIsAnimating(true);

    const tl = gsap.timeline({
      onComplete: () => setIsAnimating(false),
    });

    // Скрываем все элементы
    const allElements = menuSidebarRef.current.querySelectorAll(
      ".menu-header h2, .menu-section-label, .menu-link-text, .menu-link-arrow, .menu-socials a, .menu-close"
    );

    tl.to(allElements, {
      opacity: 0,
      y: -20,
      duration: 0.25,
      stagger: -0.02,
      ease: "power3.in",
    });

    // Закрываем сайдбар
    tl.to(menuSidebarRef.current, {
      x: "-110%",
      duration: 0.4,
      ease: "power3.inOut",
    }, "-=0.1");

    // Показываем кнопку
    tl.to(menuButtonRef.current, {
      opacity: 1,
      pointerEvents: "all",
      duration: 0.3,
    }, "-=0.2");
  };

  const toggleMenu = () => {
    if (isAnimating) return;
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  const handleLinkClick = () => {
    if (isOpen) {
      setTimeout(() => closeMenu(), 300);
    }
  };

  // Инициализация
  useEffect(() => {
    if (!menuSidebarRef.current) return;

    gsap.set(menuSidebarRef.current, {
      x: "-110%",
    });

    // Split text для ВСЕХ текстовых элементов (для scramble)
    const allTextElements = menuSidebarRef.current.querySelectorAll(
      ".menu-header h2, .menu-section-label, .menu-link-text, .menu-socials a, .menu-close"
    );
    
    allSplitsRef.current = [];

    allTextElements.forEach((element) => {
      const split = new SplitText(element, { type: "chars" });
      allSplitsRef.current.push(split);
    });

    // Скрываем все элементы изначально
    const allElements = menuSidebarRef.current.querySelectorAll(
      ".menu-header h2, .menu-section-label, .menu-link-text, .menu-link-arrow, .menu-socials a, .menu-close"
    );
    gsap.set(allElements, { opacity: 0, y: 20 });

  }, []);

  // Body overflow
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Menu Button - октагон */}
      <button
        ref={menuButtonRef}
        className="menu-button"
        onClick={toggleMenu}
      >
        <span className="menu-button-text">МЕНЮ</span>
      </button>

      {/* Menu Sidebar */}
      <div className="menu-sidebar" ref={menuSidebarRef}>
        <div className="menu-sidebar-content">
          <div className="menu-header">
            <h2>Chrome Hub</h2>
            <button className="menu-close" onClick={toggleMenu}>
              Закрыть
            </button>
          </div>

          <nav className="menu-nav">
            <div className="menu-section">
              <span className="menu-section-label">Магазин</span>
              <Link href="/catalog" className="menu-link" onClick={handleLinkClick}>
                <span className="menu-link-text">Каталог</span>
                <span className="menu-link-arrow">→</span>
              </Link>
              <Link href="/preorder" className="menu-link" onClick={handleLinkClick}>
                <span className="menu-link-text">Предзаказ</span>
                <span className="menu-link-arrow">→</span>
              </Link>
            </div>
          </nav>

          <div className="menu-footer">
            <div className="menu-socials">
              <a href="https://t.me/chromehub" target="_blank" rel="noopener noreferrer">
                Telegram
              </a>
              <a href="https://instagram.com/chromehub" target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
              <a href="https://avito.ru/chromehub" target="_blank" rel="noopener noreferrer">
                Avito
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && <div className="menu-backdrop" onClick={toggleMenu} />}
    </>
  );
};

export default Menu;
