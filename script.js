// ---------------------------------------------
// Mobile drawer toggle
// ---------------------------------------------
const drawerToggle = document.getElementById("drawerToggle");
const primarySidebar = document.getElementById("primarySidebar");
const backdrop = document.getElementById("backdrop");

function closeDrawer() {
  primarySidebar.classList.remove("open");
  backdrop.classList.remove("open");
  drawerToggle.setAttribute("aria-expanded", "false");
}

drawerToggle.addEventListener("click", () => {
  const isOpen = primarySidebar.classList.toggle("open");
  backdrop.classList.toggle("open", isOpen);
  drawerToggle.setAttribute("aria-expanded", String(isOpen));
});

backdrop.addEventListener("click", closeDrawer);
document.querySelectorAll(".md-sidebar--primary .md-nav__link").forEach((link) => {
  link.addEventListener("click", closeDrawer);
});

// ---------------------------------------------
// Build "On this page" TOC from h2 headings
// ---------------------------------------------
const headings = document.querySelectorAll(".md-content__inner h2[id]");
const tocList = document.getElementById("tocList");

headings.forEach((heading) => {
  const li = document.createElement("li");
  const a = document.createElement("a");
  a.href = `#${heading.id}`;
  a.textContent = heading.textContent;
  a.className = "md-nav__link";
  a.dataset.tocTarget = heading.id;
  li.appendChild(a);
  tocList.appendChild(li);
});

// ---------------------------------------------
// Highlight active section in both nav sidebars while scrolling
// ---------------------------------------------
const navLinks = document.querySelectorAll('[data-toc]');
const tocLinks = document.querySelectorAll('#tocList a');

function setActive(id) {
  navLinks.forEach((link) => {
    link.classList.toggle("md-nav__link--active", link.getAttribute("href") === `#${id}`);
  });
  tocLinks.forEach((link) => {
    link.classList.toggle("md-nav__link--active", link.dataset.tocTarget === id);
  });
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setActive(entry.target.id);
      }
    });
  },
  { rootMargin: "-15% 0px -70% 0px" }
);

headings.forEach((heading) => observer.observe(heading));

// ---------------------------------------------
// Copy-to-clipboard for code blocks
// ---------------------------------------------
document.querySelectorAll(".copy-btn").forEach((button) => {
  button.addEventListener("click", async () => {
    const code = button.closest(".codehilite").querySelector("code").innerText;
    try {
      await navigator.clipboard.writeText(code);
      const original = button.textContent;
      button.textContent = "Copied";
      setTimeout(() => (button.textContent = original), 1500);
    } catch (err) {
      button.textContent = "Failed";
    }
  });
});

// ---------------------------------------------
// Simple nav search filter
// ---------------------------------------------
const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLowerCase();

  document.querySelectorAll(".md-sidebar--primary .md-nav__link").forEach((link) => {
    const match = link.textContent.toLowerCase().includes(query);
    const li = link.closest("li");
    if (li) {
      li.style.display = match || !query ? "" : "none";
    } else {
      link.style.display = match || !query ? "" : "none";
    }
  });

  document.querySelectorAll(".md-nav__section").forEach((section) => {
    const hasVisibleMatch = Array.from(section.querySelectorAll(".md-nav__link")).some(
      (link) => link.textContent.toLowerCase().includes(query)
    );
    if (query) section.open = hasVisibleMatch;
  });
});
