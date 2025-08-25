// Mobile menu toggle functionality
document.addEventListener('DOMContentLoaded', function() {
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  
  if (mobileMenuToggle && navLinks) {
    mobileMenuToggle.addEventListener('click', function() {
      navLinks.classList.toggle('active');
      mobileMenuToggle.classList.toggle('active');
    });
  }

  // Smooth scrolling for navigation links
  const navLinksElements = document.querySelectorAll('nav a[href^="#"]');
  navLinksElements.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      
      if (targetSection) {
        const offsetTop = targetSection.offsetTop - 70; // Account for fixed navbar
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });

  // Add scroll effect to navbar
  window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
      navbar.style.background = 'rgba(255, 255, 255, 0.98)';
      navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
      navbar.style.background = 'rgba(255, 255, 255, 0.95)';
      navbar.style.boxShadow = 'none';
    }
  });

  // Animate elements on scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observe cards and sections for animation
  const animatedElements = document.querySelectorAll('.about-card, .service-card, .testimonial-card, .section-header');
  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });

  // Button click handlers
  const ctaButtons = document.querySelectorAll('.btn-primary, .nav-cta');
  ctaButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Add a subtle animation feedback
      this.style.transform = 'scale(0.95)';
      setTimeout(() => {
        this.style.transform = '';
      }, 150);
      
      // Here you would typically handle the actual booking/contact functionality
      console.log('CTA button clicked - would redirect to booking form');
    });
  });

  // Add hover effects to floating elements
  const floatingElements = document.querySelectorAll('.floating-heart, .floating-star, .floating-care');
  floatingElements.forEach(element => {
    element.addEventListener('mouseenter', function() {
      this.style.transform = 'scale(1.2) rotate(10deg)';
      this.style.transition = 'transform 0.3s ease';
    });
    
    element.addEventListener('mouseleave', function() {
      this.style.transform = '';
    });
  });

  // Add typing effect to hero title (optional enhancement)
  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle) {
    const text = heroTitle.innerHTML;
    heroTitle.innerHTML = '';
    let i = 0;
    
    function typeWriter() {
      if (i < text.length) {
        heroTitle.innerHTML += text.charAt(i);
        i++;
        setTimeout(typeWriter, 50);
      }
    }
    
    // Start typing effect after a short delay
    setTimeout(typeWriter, 500);
  }

  // Add parallax effect to hero section
  window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const heroImage = document.querySelector('.hero-illustration');
    const floatingElements = document.querySelectorAll('.floating-heart, .floating-star, .floating-care');
    
    if (heroImage) {
      heroImage.style.transform = `translateY(${scrolled * 0.1}px) rotate(2deg)`;
    }
    
    floatingElements.forEach((element, index) => {
      const speed = 0.05 + (index * 0.02);
      element.style.transform = `translateY(${scrolled * speed}px)`;
    });
  });

  // Add click-to-call functionality
  const phoneLinks = document.querySelectorAll('a[href*="tel:"], .btn-outline');
  phoneLinks.forEach(link => {
    if (link.textContent.includes('Call')) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'tel:+15551234273'; // CARE spelled out
      });
    }
  });

  console.log('CareHeart website loaded successfully! 💙');
});