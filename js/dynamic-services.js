// ============================================================
// DYNAMIC SERVICES - HOMEPAGE
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {

    const serviceContainer =
        document.getElementById("dynamicServices");

    if (!serviceContainer) {
        return;
    }

    try {

        // ----------------------------------------------------
        // CHECK SUPABASE
        // ----------------------------------------------------

        if (!window.supabaseClient) {

            console.error(
                "Supabase client is not available."
            );

            serviceContainer.innerHTML = `
                <p class="service-error">
                    Unable to load services.
                </p>
            `;

            return;
        }


        // ----------------------------------------------------
        // LOAD ACTIVE SERVICES
        // ----------------------------------------------------

        const { data, error } =
            await window.supabaseClient
                .from("services")
                .select(`
                    id,
                    name,
                    slug,
                    short_description,
                    description,
                    benefits,
                    image_url,
                    is_active,
                    is_coming_soon,
                    display_order
                `)
                .eq("is_active", true)
                .order("display_order", {
                    ascending: true,
                    nullsFirst: false
                });


        // ----------------------------------------------------
        // DATABASE ERROR
        // ----------------------------------------------------

        if (error) {

            console.error(
                "Service loading error:",
                error
            );

            serviceContainer.innerHTML = `
                <p class="service-error">
                    Unable to load services.
                </p>
            `;

            return;
        }


        // ----------------------------------------------------
        // NO SERVICES
        // ----------------------------------------------------

        if (!data || data.length === 0) {

            serviceContainer.innerHTML = `
                <p class="service-error">
                    No services are currently available.
                </p>
            `;

            return;
        }


        // ----------------------------------------------------
        // CLEAR LOADING
        // ----------------------------------------------------

        serviceContainer.innerHTML = "";


        // ----------------------------------------------------
        // CREATE SERVICE CARDS
        // ----------------------------------------------------

        data.forEach(service => {

            const isActive =
                service.is_active === true;

            const comingSoon =
                service.is_coming_soon === true;


            // Ignore inactive services

            if (!isActive) {
                return;
            }


            // ------------------------------------------------
            // CARD
            // ------------------------------------------------

            const card =
                document.createElement("a");

            card.className =
                "service-item";


            // ------------------------------------------------
            // COMING SOON
            // ------------------------------------------------

            if (comingSoon) {

                card.href = "#";

                card.classList.add(
                    "service-coming-soon"
                );

                card.addEventListener(
                    "click",
                    event => {
                        event.preventDefault();
                    }
                );

            }


            // ------------------------------------------------
            // NORMAL SERVICE
            // ------------------------------------------------

            else {

                card.href =
                    getServicePage(service);
            }


            // ------------------------------------------------
            // IMAGE
            // ------------------------------------------------

            const imageWrapper =
                document.createElement("div");

            imageWrapper.className =
                "service-image";


            if (service.image_url) {

                const image =
                    document.createElement("img");

                image.src =
                    service.image_url;

                image.alt =
                    service.name;

                image.loading =
                    "lazy";

                imageWrapper.appendChild(
                    image
                );

            }

            else {

                imageWrapper.classList.add(
                    "service-image-placeholder"
                );

                imageWrapper.textContent =
                    getServiceIcon(service.name);
            }


            // ------------------------------------------------
            // CONTENT
            // ------------------------------------------------

            const content =
                document.createElement("div");

            content.className =
                "service-content";


            // ------------------------------------------------
            // TITLE
            // ------------------------------------------------

            const title =
                document.createElement("h3");

            title.textContent =
                service.name;


            // ------------------------------------------------
            // DESCRIPTION
            // ------------------------------------------------

            const description =
                document.createElement("p");

            description.textContent =
                service.short_description ||
                service.description ||
                "Explore our wellness program.";


            content.appendChild(title);
            content.appendChild(description);


            // ------------------------------------------------
            // STATUS / ARROW
            // ------------------------------------------------

            const status =
                document.createElement("span");


            if (comingSoon) {

                status.textContent =
                    "Coming Soon";

                status.className =
                    "coming-soon-label";

            }

            else {

                status.textContent =
                    "→";

                status.className =
                    "service-arrow";
            }


            // ------------------------------------------------
            // BUILD CARD
            // ------------------------------------------------

            card.appendChild(
                imageWrapper
            );

            card.appendChild(
                content
            );

            card.appendChild(
                status
            );


            serviceContainer.appendChild(
                card
            );

        });

    }


    // --------------------------------------------------------
    // UNEXPECTED ERROR
    // --------------------------------------------------------

    catch (error) {

        console.error(
            "Unexpected service loading error:",
            error
        );

        serviceContainer.innerHTML = `
            <p class="service-error">
                Unable to load services.
            </p>
        `;
    }

});


// ============================================================
// SERVICE PAGE MAPPING
// ============================================================

function getServicePage(service) {

    const pages = {

        "hatha-yoga":
            "hatha.html",

        "ashtanga-yoga":
            "ashtanga.html",

        "prenatal-yoga":
            "prenatal.html",

        "postnatal-yoga":
            "postnatal.html",

        "fertility-yoga":
            "fertility.html",

        "kids-yoga":
            "kids.html",

        "garbh-sanskar":
            "garbhsanskar.html",

        "infant-massage":
            "infant.html",

        "breastfeeding-education":
            "breastfeeding.html",

        "labor-management":
            "labor.html",

        "pilates":
            "services.html"
    };


    return pages[service.slug] ||
        `service.html?slug=${encodeURIComponent(
            service.slug
        )}`;
}


// ============================================================
// SERVICE ICONS
// ============================================================

function getServiceIcon(name) {

    const icons = {

        "Hatha Yoga":
            "🧘",

        "Ashtanga Yoga":
            "🧘",

        "Prenatal Yoga":
            "🤰",

        "Postnatal Yoga":
            "👩‍🍼",

        "Fertility Yoga":
            "🌸",

        "Kids Yoga":
            "👦",

        "Garbh Sanskar":
            "🤱",

        "Infant Massage":
            "👶",

        "Breastfeeding Education":
            "🍼",

        "Labor Management":
            "🤰",

        "Pilates":
            "🧘"
    };


    return icons[name] || "🧘";
}