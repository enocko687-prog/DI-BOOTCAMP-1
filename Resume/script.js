/* =====================================================
   ENOCK BRIGHTON OCHIENG
   PROFESSIONAL RESUME
   SCRIPT.JS
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    /* ================================================
       1. CURRENT YEAR
    ================================================= */

    const yearElement = document.getElementById("year");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }


    /* ================================================
       2. PRINT RESUME
    ================================================= */

    const printButton = document.getElementById("printResume");

    if (printButton) {

        printButton.addEventListener("click", function () {

            window.print();

        });

    }


    /* ================================================
       3. MOBILE MENU
    ================================================= */

    const menuButton = document.querySelector(".menu-toggle");
    const navigation = document.querySelector("nav");

    if (menuButton && navigation) {

        menuButton.addEventListener("click", function () {

            navigation.classList.toggle("active");

        });


        /* Close menu after clicking a link */

        const navLinks = navigation.querySelectorAll("a");

        navLinks.forEach(function (link) {

            link.addEventListener("click", function () {

                navigation.classList.remove("active");

            });

        });

    }


    /* ================================================
       4. SMOOTH SCROLLING
    ================================================= */

    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(function (link) {

        link.addEventListener("click", function (event) {

            const targetId = this.getAttribute("href");

            if (targetId === "#") {
                return;
            }

            const target = document.querySelector(targetId);

            if (target) {

                event.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        });

    });


    /* ================================================
       5. SCROLL REVEAL ANIMATION
    ================================================= */

    const sections = document.querySelectorAll(
        ".resume-section, .sidebar-section, .experience, .project"
    );

    const observerOptions = {
        threshold: 0.12
    };

    const sectionObserver = new IntersectionObserver(
        function (entries, observer) {

            entries.forEach(function (entry) {

                if (entry.isIntersecting) {

                    entry.target.classList.add("show");

                    observer.unobserve(entry.target);

                }

            });

        },
        observerOptions
    );


    sections.forEach(function (section) {

        section.classList.add("hidden");

        sectionObserver.observe(section);

    });


    /* ================================================
       6. ACTIVE SECTION
    ================================================= */

    const resumeSections = document.querySelectorAll(
        ".resume-section"
    );

    const activeObserver = new IntersectionObserver(
        function (entries) {

            entries.forEach(function (entry) {

                if (entry.isIntersecting) {

                    entry.target.classList.add("active-section");

                }

            });

        },
        {
            threshold: 0.25
        }
    );


    resumeSections.forEach(function (section) {

        activeObserver.observe(section);

    });


    /* ================================================
       7. SKILLS HOVER EFFECT
    ================================================= */

    const skills = document.querySelectorAll(
        ".sidebar-section li"
    );

    skills.forEach(function (skill) {

        skill.addEventListener("mouseenter", function () {

            this.style.transform = "translateX(5px)";

        });

        skill.addEventListener("mouseleave", function () {

            this.style.transform = "translateX(0)";

        });

    });


    /* ================================================
       8. PROJECT CARD EFFECT
    ================================================= */

    const projects = document.querySelectorAll(".project");

    projects.forEach(function (project) {

        project.addEventListener("mouseenter", function () {

            this.style.transform = "translateY(-4px)";

        });

        project.addEventListener("mouseleave", function () {

            this.style.transform = "translateY(0)";

        });

    });


    /* ================================================
       9. PROFILE PHOTO EFFECT
    ================================================= */

    const profilePhoto = document.querySelector(
        ".profile-photo img"
    );

    if (profilePhoto) {

        profilePhoto.addEventListener(
            "mouseenter",
            function () {

                this.style.transform = "scale(1.03)";

            }
        );

        profilePhoto.addEventListener(
            "mouseleave",
            function () {

                this.style.transform = "scale(1)";

            }
        );

    }


    /* ================================================
       10. PRINT MESSAGE
    ================================================= */

    window.addEventListener("beforeprint", function () {

        document.body.classList.add("printing");

    });


    window.addEventListener("afterprint", function () {

        document.body.classList.remove("printing");

    });


    /* ================================================
       11. PAGE LOADED
    ================================================= */

    document.body.classList.add("page-loaded");

});