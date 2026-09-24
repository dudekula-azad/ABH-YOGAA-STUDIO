// ============================================================
// ABH YOGAA STUDIO
// ADMIN PRICE MANAGEMENT
// ONLINE + OFFLINE
// ============================================================

console.log(
    "Admin Prices JavaScript loaded."
);
// ============================================================
// ADMIN AUTHORIZATION
// ============================================================

async function checkAdminAccess() {

    if (!db) {
        console.error("Supabase client is unavailable.");
        window.location.replace("admin-login.html");
        return false;
    }

    const {
        data: { user },
        error: userError
    } = await db.auth.getUser();

    if (userError || !user) {
        window.location.replace("admin-login.html");
        return false;
    }

    const {
        data: isAdmin,
        error: adminError
    } = await db.rpc("is_admin");

    if (adminError || isAdmin !== true) {

        console.log("Unauthorized admin page access.");

        await db.auth.signOut();

        window.location.replace("admin-login.html");

        return false;
    }

    return true;
}

// ============================================================
// SUPABASE
// ============================================================

const db =
    window.supabaseClient;


// ============================================================
// DOM
// ============================================================

const priceTableBody =
    document.getElementById(
        "priceTableBody"
    );

const savePricesBtn =
    document.getElementById(
        "savePricesBtn"
    );

const statusMessage =
    document.getElementById(
        "statusMessage"
    );


// ============================================================
// PLANS
// ============================================================

const plans = [

    {
        slug: "one_day",
        name: "One Day"
    },

    {
        slug: "one_month",
        name: "One Month"
    },

    {
        slug: "three_months",
        name: "Three Months"
    }

];


// ============================================================
// MODES
// ============================================================

const modes = [

    "offline",
    "online"

];


// ============================================================
// LOAD SERVICES
// ============================================================

async function loadServices() {

    try {

        const {
            data: services,
            error
        } =
            await db
                .from("services")
                .select(
                    "id,name,slug,is_active"
                )
                .eq(
                    "is_active",
                    true
                )
                .order(
                    "display_order",
                    {
                        ascending: true
                    }
                );


        if (error) {

            throw error;

        }


        renderPriceTable(
            services || []
        );


        await loadExistingPrices();


    }

    catch (error) {

        console.error(
            "Service loading error:",
            error
        );


        showStatus(
            error.message ||
            "Unable to load services.",
            "error"
        );

    }

}


// ============================================================
// RENDER TABLE
// ============================================================

function renderPriceTable(
    services
) {

    priceTableBody.innerHTML =
        "";


    if (
        !services ||
        services.length === 0
    ) {

        priceTableBody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    style="text-align:center;padding:30px;"
                >
                    No active services found.
                </td>

            </tr>

        `;

        return;

    }


    services.forEach(
        service => {

            const row =
                document.createElement(
                    "tr"
                );


            let html = `

                <td>

                    ${escapeHtml(
                        service.name
                    )}

                </td>

            `;


            plans.forEach(
                plan => {

                    modes.forEach(
                        mode => {

                            html += `

                                <td>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"

                                        class="price-input"

                                        data-service-id="${service.id}"

                                        data-plan-id="${plan.slug}"

                                        data-plan-name="${escapeAttribute(plan.name)}"

                                        data-mode="${mode}"

                                        placeholder="₹ Price"
                                    >

                                </td>

                            `;

                        }
                    );

                }
            );


            row.innerHTML =
                html;


            priceTableBody.appendChild(
                row
            );

        }
    );

}


// ============================================================
// LOAD EXISTING PRICES
// ============================================================

async function loadExistingPrices() {

    try {

        const {
            data,
            error
        } =
            await db
                .from("plan_prices")
                .select(`
                    id,
                    service_id,
                    plan_id,
                    booking_mode,
                    price,
                    is_active
                `)
                .eq(
                    "is_active",
                    true
                );


        if (error) {

            throw error;

        }


        if (
            !data ||
            data.length === 0
        ) {

            return;

        }


        data.forEach(
            priceRow => {

                const inputs =
                    document.querySelectorAll(
                        `.price-input[data-service-id="${priceRow.service_id}"][data-mode="${priceRow.booking_mode}"]`
                    );


                inputs.forEach(
                    candidate => {

                        if (
                            String(
                                priceRow.plan_id
                            ) ===
                            getPlanIdFromSlug(
                                candidate.dataset.planId
                            )
                        ) {

                            candidate.value =
                                priceRow.price;

                            candidate.dataset.priceId =
                                priceRow.id;

                        }

                    }
                );

            }
        );

    }

    catch (error) {

        console.error(
            "Existing price loading error:",
            error
        );

    }

}


// ============================================================
// GET PLAN ID
// ============================================================

function getPlanIdFromSlug(
    slug
) {

    return window.planIdMap
        ? String(
            window.planIdMap[slug]
        )
        : "";

}


// ============================================================
// LOAD PLAN IDs
// ============================================================

async function loadPlanIds() {

    const {
        data,
        error
    } =
        await db
            .from("plans")
            .select(
                "id,name,slug"
            )
            .eq(
                "is_active",
                true
            );


    if (error) {

        throw error;

    }


    window.planIdMap =
        {};


    (data || []).forEach(
        plan => {

            window.planIdMap[
                plan.slug
            ] =
                plan.id;

        }
    );

}


// ============================================================
// SAVE PRICES
// ============================================================

savePricesBtn.addEventListener(
    "click",
    savePrices
);


async function savePrices() {

    savePricesBtn.disabled =
        true;

    savePricesBtn.innerText =
        "Saving...";


    try {

        await loadPlanIds();


        const inputs =
            document.querySelectorAll(
                ".price-input"
            );


        const records =
            [];


        inputs.forEach(
            input => {

                const value =
                    input.value.trim();


                if (
                    value === ""
                ) {

                    return;

                }


                const serviceId =
                    Number(
                        input.dataset.serviceId
                    );


                const planSlug =
                    input.dataset.planId;


                const planId =
                    Number(
                        window.planIdMap[
                            planSlug
                        ]
                    );


                const mode =
                    input.dataset.mode;


                const price =
                    Number(
                        value
                    );


                if (
                    !planId ||
                    !serviceId ||
                    !mode
                ) {

                    return;

                }


                if (
                    Number.isNaN(
                        price
                    ) ||
                    price < 0
                ) {

                    return;

                }


                records.push({

                    service_id:
                        serviceId,

                    plan_id:
                        planId,

                    booking_mode:
                        mode,

                    price:
                        price,

                    is_active:
                        true

                });

            }
        );


        if (
            records.length === 0
        ) {

            showStatus(
                "Please enter at least one price.",
                "error"
            );

            return;

        }


        console.log(
            "Prices to save:",
            records
        );


        const {
            data,
            error
        } =
            await db
                .from("plan_prices")
                .upsert(
                    records,
                    {
                        onConflict:
                            "service_id,plan_id,booking_mode"
                    }
                )
                .select();


        if (error) {

            throw error;

        }


        console.log(
            "Prices saved:",
            data
        );


        showStatus(
            "Online and Offline prices saved successfully.",
            "success"
        );


        await loadExistingPrices();

    }

    catch (error) {

        console.error(
            "Price save error:",
            error
        );


        showStatus(
            error.message ||
            "Unable to save prices.",
            "error"
        );

    }

    finally {

        savePricesBtn.disabled =
            false;

        savePricesBtn.innerText =
            "Save Prices";

    }

}


// ============================================================
// STATUS
// ============================================================

function showStatus(
    message,
    type
) {

    statusMessage.innerText =
        message;

    statusMessage.className =
        "status-message " +
        type;

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHtml(
    value
) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        value ?? "";

    return div.innerHTML;

}


// ============================================================
// ESCAPE ATTRIBUTE
// ============================================================

function escapeAttribute(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        );

}


// ============================================================
// START
// ============================================================

(async function () {

    try {

        await loadPlanIds();

        await loadServices();

    }

    catch (error) {

        console.error(
            "Price page initialization error:",
            error
        );

        showStatus(
            error.message ||
            "Unable to initialize price management.",
            "error"
        );

    }

})();