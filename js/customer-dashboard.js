// ============================================================
// ABH YOGAA STUDIO
// CUSTOMER DASHBOARD
// FULL WORKING VERSION
// ============================================================

const db = window.supabaseClient;

const CUSTOMER_CACHE_KEY = "abh_customer_id";
const CUSTOMER_EMAIL_KEY = "abh_customer_email";


// ============================================================
// PAGE LOAD
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {

    console.log("=================================");
    console.log("CUSTOMER DASHBOARD STARTING");
    console.log("=================================");

    setupNavigation();

    await loadDashboard();

});


// ============================================================
// NAVIGATION
// ============================================================

function setupNavigation() {

    const homeBtn = document.getElementById("homeBtn");

    if (homeBtn) {

        homeBtn.addEventListener("click", () => {

            window.location.href = "index.html";

        });

    }


    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {

        logoutBtn.addEventListener("click", logoutCustomer);

    }

}


// ============================================================
// MAIN DASHBOARD
// ============================================================

async function loadDashboard() {

    try {

        if (!db) {
            throw new Error("Supabase client not found.");
        }


        // ----------------------------------------------------
        // GET CURRENT AUTH SESSION
        // ----------------------------------------------------

        const {
            data: sessionData,
            error: sessionError
        } = await db.auth.getSession();


        if (sessionError) {
            throw sessionError;
        }


        const session = sessionData?.session;


        if (!session?.user) {

            console.log("No customer session found.");

            window.location.replace("customer-login.html");

            return;

        }


        const user = session.user;


        console.log(
            "Authenticated customer:",
            user.email
        );


        // ----------------------------------------------------
        // KEEP CUSTOMER SESSION REFERENCE
        // ----------------------------------------------------

        if (user.email) {

            localStorage.setItem(
                CUSTOMER_EMAIL_KEY,
                user.email
            );

        }


        // ----------------------------------------------------
        // PROFILE EMAIL
        // ----------------------------------------------------

        setText(
            "profileEmail",
            user.email || "—"
        );


        // ----------------------------------------------------
        // FIND CUSTOMER
        // ----------------------------------------------------

        let customer = null;


        // First try cached customer ID.
        const cachedCustomerId =
            localStorage.getItem(
                CUSTOMER_CACHE_KEY
            );


        if (cachedCustomerId) {

            console.log(
                "Trying cached customer ID:",
                cachedCustomerId
            );


            const {
                data: cachedCustomer,
                error: cachedError
            } = await db
                .from("customers")
                .select(
                    "id, full_name, email, phone"
                )
                .eq(
                    "id",
                    cachedCustomerId
                )
                .maybeSingle();


            if (!cachedError && cachedCustomer) {

                // Make sure cached customer belongs
                // to the current authenticated email.
                if (
                    !user.email ||
                    !cachedCustomer.email ||
                    cachedCustomer.email.toLowerCase() ===
                    user.email.toLowerCase()
                ) {

                    customer = cachedCustomer;

                }

            }

        }


        // ----------------------------------------------------
        // FIND CUSTOMER BY EMAIL
        // ----------------------------------------------------

        if (!customer && user.email) {

            console.log(
                "Finding customer by email..."
            );


            const {
                data,
                error
            } = await db
                .from("customers")
                .select(
                    "id, full_name, email, phone"
                )
                .eq(
                    "email",
                    user.email
                )
                .maybeSingle();


            if (error) {
                throw error;
            }


            customer = data;

        }


        // ----------------------------------------------------
        // CUSTOMER NOT FOUND
        // ----------------------------------------------------

        if (!customer) {

            console.error(
                "Customer record not found."
            );


            setText(
                "profileName",
                user.user_metadata?.full_name ||
                "Customer"
            );


            setText(
                "profilePhone",
                user.user_metadata?.phone ||
                "Not provided"
            );


            setHTML(
                "membershipsContainer",
                `
                <div class="empty">
                    Customer profile could not be found.
                </div>
                `
            );


            setHTML(
                "bookingsContainer",
                `
                <div class="empty">
                    No bookings found.
                </div>
                `
            );


            return;

        }


        // ----------------------------------------------------
        // SAVE CUSTOMER ID
        // ----------------------------------------------------

        localStorage.setItem(
            CUSTOMER_CACHE_KEY,
            String(customer.id)
        );


        if (customer.email) {

            localStorage.setItem(
                CUSTOMER_EMAIL_KEY,
                customer.email
            );

        }


        console.log(
            "Customer ID:",
            customer.id
        );


        // ----------------------------------------------------
        // PROFILE
        // ----------------------------------------------------

        setText(
            "profileName",
            customer.full_name ||
            "Customer"
        );


        setText(
            "profilePhone",
            customer.phone ||
            "Not provided"
        );


        // ----------------------------------------------------
        // LOAD DASHBOARD DATA
        // ----------------------------------------------------

        await Promise.all([

            loadMemberships(customer.id),

            loadOneDayBookings(customer.id),

            loadTomorrowMembershipSlots(customer.id)

        ]);


        console.log(
            "Customer dashboard loaded successfully."
        );

    }

    catch (error) {

        console.error(
            "CUSTOMER DASHBOARD ERROR:",
            error
        );


        setHTML(
            "membershipsContainer",
            `
            <div class="empty">
                Unable to load memberships.
                Please refresh the page.
            </div>
            `
        );


        setHTML(
            "bookingsContainer",
            `
            <div class="empty">
                Unable to load bookings.
                Please refresh the page.
            </div>
            `
        );

    }

}


// ============================================================
// LOAD MEMBERSHIPS
// ============================================================

async function loadMemberships(customerId) {

    const container =
        document.getElementById(
            "membershipsContainer"
        );


    if (!container) {

        console.warn(
            "membershipsContainer not found."
        );

        return;

    }


    try {

        console.log(
            "Loading memberships for:",
            customerId
        );


        // ----------------------------------------------------
        // GET MEMBERSHIPS
        // ----------------------------------------------------

        const {
            data: memberships,
            error
        } = await db
            .from("memberships")
            .select(`
                id,
                customer_id,
                plan_id,
                service_id,
                start_date,
                end_date,
                booking_mode,
                status,
                amount,
                created_at
            `)
            .eq(
                "customer_id",
                customerId
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (error) {

            throw error;

        }


        console.log(
            "MEMBERSHIPS FROM DATABASE:",
            memberships
        );


        if (
            !memberships ||
            memberships.length === 0
        ) {

            container.innerHTML =
                `
                <div class="empty">
                    You do not have any memberships yet.
                </div>
                `;

            return;

        }


        // ----------------------------------------------------
        // GET PLAN IDs
        // ----------------------------------------------------

        const planIds = [
            ...new Set(
                memberships
                    .map(m => m.plan_id)
                    .filter(Boolean)
            )
        ];


        // ----------------------------------------------------
        // GET SERVICE IDs
        // ----------------------------------------------------

        const serviceIds = [
            ...new Set(
                memberships
                    .map(m => m.service_id)
                    .filter(Boolean)
            )
        ];


        // ----------------------------------------------------
        // LOAD PLANS + SERVICES
        // ----------------------------------------------------

        let plans = [];
        let services = [];


        if (planIds.length > 0) {

            const {
                data,
                error: planError
            } = await db
                .from("plans")
                .select(
                    "id, name"
                )
                .in(
                    "id",
                    planIds
                );


            if (planError) {

                console.error(
                    "Plan loading error:",
                    planError
                );

            }
            else {

                plans = data || [];

            }

        }


        if (serviceIds.length > 0) {

            const {
                data,
                error: serviceError
            } = await db
                .from("services")
                .select(
                    "id, name, slug"
                )
                .in(
                    "id",
                    serviceIds
                );


            if (serviceError) {

                console.error(
                    "Service loading error:",
                    serviceError
                );

            }
            else {

                services = data || [];

            }

        }


        // ----------------------------------------------------
        // MAP DATA
        // ----------------------------------------------------

        const planMap = new Map();

        plans.forEach(plan => {

            planMap.set(
                String(plan.id),
                plan
            );

        });


        const serviceMap = new Map();

        services.forEach(service => {

            serviceMap.set(
                String(service.id),
                service
            );

        });


        // ----------------------------------------------------
        // BUILD HTML
        // ----------------------------------------------------

        let html =
            `
            <div class="membership-list">
            `;


        memberships.forEach(membership => {

            const plan =
                planMap.get(
                    String(membership.plan_id)
                );


            const service =
                serviceMap.get(
                    String(membership.service_id)
                );


            const serviceName =
                service?.name ||
                "Yoga Class";


            const planName =
                plan?.name ||
                "Membership";


            const mode =
                String(
                    membership.booking_mode ||
                    "offline"
                ).toLowerCase();


            const status =
                String(
                    membership.status ||
                    "active"
                ).toLowerCase();


            const amount =
                Number(
                    membership.amount || 0
                );


            let statusHTML;


            if (status === "active") {

                statusHTML =
                    `
                    <span class="active-status">
                        Active
                    </span>
                    `;

            }
            else {

                statusHTML =
                    escapeHTML(
                        status
                    );

            }


            html +=
                `
                <div class="membership-item">

                    <h3>
                        ${escapeHTML(
                            serviceName
                        )}
                    </h3>


                    <div class="membership-grid">

                        <div class="membership-detail">

                            <strong>
                                Plan:
                            </strong>

                            ${escapeHTML(
                                planName
                            )}

                        </div>


                        <div class="membership-detail">

                            <strong>
                                Mode:
                            </strong>

                            ${
                                mode === "online"
                                    ? "Online"
                                    : "Offline"
                            }

                        </div>


                        <div class="membership-detail">

                            <strong>
                                Start:
                            </strong>

                            ${formatDate(
                                membership.start_date
                            )}

                        </div>


                        <div class="membership-detail">

                            <strong>
                                End:
                            </strong>

                            ${formatDate(
                                membership.end_date
                            )}

                        </div>


                        <div class="membership-detail">

                            <strong>
                                Status:
                            </strong>

                            ${statusHTML}

                        </div>


                        <div class="membership-detail">

                            <strong>
                                Amount:
                            </strong>

                            ₹${amount.toFixed(2)}

                        </div>

                    </div>

                </div>
                `;

        });


        html +=
            `
            </div>
            `;


        container.innerHTML =
            html;


        console.log(
            `Displayed ${memberships.length} membership(s).`
        );

    }

    catch (error) {

        console.error(
            "MEMBERSHIP LOAD ERROR:",
            error
        );


        container.innerHTML =
            `
            <div class="empty">
                Unable to load memberships.
            </div>
            `;

    }

}


// ============================================================
// LOAD ONE-DAY BOOKINGS
// ============================================================

async function loadOneDayBookings(customerId) {

    const container =
        document.getElementById(
            "bookingsContainer"
        );


    if (!container) {

        console.warn(
            "bookingsContainer not found."
        );

        return;

    }


    try {

        // ----------------------------------------------------
        // GET BOOKINGS
        // ----------------------------------------------------

        const {
            data: bookings,
            error
        } = await db
            .from("bookings")
            .select(`
                id,
                customer_id,
                booking_status,
                payment_status,
                amount,
                created_at,
                plan_id,
                class_slot_id
            `)
            .eq(
                "customer_id",
                customerId
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (error) {

            throw error;

        }


        console.log(
            "ALL CUSTOMER BOOKINGS:",
            bookings
        );


        if (
            !bookings ||
            bookings.length === 0
        ) {

            container.innerHTML =
                `
                <div class="empty">
                    No One-Day bookings yet.
                </div>
                `;

            return;

        }


        // ----------------------------------------------------
        // GET PLANS
        // ----------------------------------------------------

        const planIds = [
            ...new Set(
                bookings
                    .map(b => b.plan_id)
                    .filter(Boolean)
            )
        ];


        let plans = [];


        if (planIds.length > 0) {

            const {
                data,
                error: planError
            } = await db
                .from("plans")
                .select(
                    "id, name"
                )
                .in(
                    "id",
                    planIds
                );


            if (!planError) {

                plans = data || [];

            }

        }


        const planMap = new Map();


        plans.forEach(plan => {

            planMap.set(
                String(plan.id),
                plan
            );

        });


        // ----------------------------------------------------
        // ONLY ONE DAY
        // ----------------------------------------------------

        const oneDayBookings =
            bookings.filter(booking => {

                const plan =
                    planMap.get(
                        String(booking.plan_id)
                    );


                const planName =
                    String(
                        plan?.name || ""
                    ).toLowerCase();


                return (
                    planName.includes("one day")
                );

            });


        console.log(
            "ONE-DAY BOOKINGS:",
            oneDayBookings
        );


        // ----------------------------------------------------
        // CLASS SLOT IDs
        // ----------------------------------------------------

        const slotIds = [
            ...new Set(
                oneDayBookings
                    .map(b => b.class_slot_id)
                    .filter(Boolean)
            )
        ];


        let slots = [];


        if (slotIds.length > 0) {

            const {
                data,
                error: slotError
            } = await db
                .from("class_slots")
                .select(`
                    id,
                    service_id,
                    start_time,
                    end_time,
                    mode,
                    online_link
                `)
                .in(
                    "id",
                    slotIds
                );


            if (slotError) {

                console.error(
                    "Slot loading error:",
                    slotError
                );

            }
            else {

                slots = data || [];

            }

        }


        // ----------------------------------------------------
        // SERVICE IDs
        // ----------------------------------------------------

        const serviceIds = [
            ...new Set(
                slots
                    .map(s => s.service_id)
                    .filter(Boolean)
            )
        ];


        let services = [];


        if (serviceIds.length > 0) {

            const {
                data,
                error: serviceError
            } = await db
                .from("services")
                .select(
                    "id, name"
                )
                .in(
                    "id",
                    serviceIds
                );


            if (!serviceError) {

                services = data || [];

            }

        }


        const slotMap = new Map();


        slots.forEach(slot => {

            slotMap.set(
                String(slot.id),
                slot
            );

        });


        const serviceMap = new Map();


        services.forEach(service => {

            serviceMap.set(
                String(service.id),
                service
            );

        });


        // ----------------------------------------------------
        // NO ONE DAY BOOKINGS
        // ----------------------------------------------------

        if (
            oneDayBookings.length === 0
        ) {

            container.innerHTML =
                `
                <div class="empty">
                    No One-Day bookings yet.
                </div>
                `;

            return;

        }


        // ----------------------------------------------------
        // TABLE
        // ----------------------------------------------------

        let html =
            `
            <div class="booking-table-wrapper">

                <table class="booking-table">

                    <thead>

                        <tr>

                            <th>ID</th>
                            <th>Service</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Mode</th>
                            <th>Status</th>
                            <th>Payment</th>
                            <th>Amount</th>

                        </tr>

                    </thead>

                    <tbody>
            `;


        oneDayBookings.forEach(booking => {

            const slot =
                slotMap.get(
                    String(
                        booking.class_slot_id
                    )
                );


            const service =
                serviceMap.get(
                    String(
                        slot?.service_id
                    )
                );


            const serviceName =
                service?.name ||
                "Yoga Class";


            const date =
                slot?.start_time
                    ? formatDate(slot.start_time)
                    : formatDate(booking.created_at);


            let time = "—";


            if (slot?.start_time) {

                time =
                    formatTime(
                        slot.start_time
                    );


                if (slot.end_time) {

                    time +=
                        " - " +
                        formatTime(
                            slot.end_time
                        );

                }

            }


            const mode =
                String(
                    slot?.mode ||
                    "offline"
                ).toLowerCase();


            const status =
                booking.booking_status ||
                "pending";


            const payment =
                booking.payment_status ||
                "pending";


            const amount =
                Number(
                    booking.amount || 0
                );


            html +=
                `
                <tr>

                    <td>
                        #${booking.id}
                    </td>

                    <td>
                        ${escapeHTML(
                            serviceName
                        )}
                    </td>

                    <td>
                        ${date}
                    </td>

                    <td>
                        ${time}
                    </td>

                    <td>
                        ${
                            mode === "online"
                                ? "Online"
                                : "Offline"
                        }
                    </td>

                    <td class="status">
                        ${escapeHTML(
                            status
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            payment
                        )}
                    </td>

                    <td>
                        ₹${amount.toFixed(2)}
                    </td>

                </tr>
                `;

        });


        html +=
            `
                    </tbody>

                </table>

            </div>
            `;


        container.innerHTML =
            html;

    }

    catch (error) {

        console.error(
            "ONE-DAY BOOKING ERROR:",
            error
        );


        container.innerHTML =
            `
            <div class="empty">
                Unable to load One-Day bookings.
            </div>
            `;

    }

}


// ============================================================
// TOMORROW MEMBERSHIP SLOTS
// ============================================================

// ============================================================
// TODAY + TOMORROW MEMBERSHIP CLASSES
// ============================================================

async function loadTomorrowMembershipSlots(customerId) {

    const section =
        document.getElementById("dailyMembershipSection");

    if (!section) return;

    try {

        // ====================================================
        // LOAD ACTIVE MEMBERSHIPS
        // ====================================================

        const {
            data: memberships,
            error: membershipError
        } = await db
            .from("memberships")
            .select(`
                id,
                customer_id,
                service_id,
                plan_id,
                start_date,
                end_date,
                booking_mode,
                status,

                plans (
                    id,
                    name
                ),

                services (
                    id,
                    name,
                    slug
                )
            `)
            .eq("customer_id", customerId)
            .eq("status", "active");

        if (membershipError) {
            throw membershipError;
        }


        // ====================================================
        // ONLY REAL MEMBERSHIPS
        // ====================================================

        const validMemberships =
            (memberships || []).filter(membership => {

                const planName =
                    String(
                        membership.plans?.name || ""
                    ).toLowerCase();

                return (
                    planName.includes("one month") ||
                    planName.includes("three month") ||
                    planName.includes("three months") ||
                    planName.includes("3 month")
                );

            });


        if (validMemberships.length === 0) {

            section.style.display = "none";

            return;

        }


        // ====================================================
        // CREATE TODAY + TOMORROW UI
        // ====================================================

        section.style.display = "block";

        section.innerHTML = `

            <div class="membership-day-section">

                <h2>Today's Class</h2>

                <p id="todayMembershipMessage">
                    Checking today's classes...
                </p>

                <div id="todayMembershipSlots"></div>

            </div>


            <div
                class="membership-day-section"
                style="
                    margin-top:30px;
                    padding-top:30px;
                    border-top:1px solid #e5e0d5;
                "
            >

                <h2>Tomorrow's Class</h2>

                <p id="tomorrowMembershipMessage">
                    Checking tomorrow's classes...
                </p>

                <div id="tomorrowMembershipSlots"></div>

            </div>

        `;


        // ====================================================
        // LOAD BOTH DAYS
        // ====================================================

        await loadMembershipClassesForDate(
            validMemberships,
            getTodayIndiaDate(),
            "todayMembershipMessage",
            "todayMembershipSlots",
            true
        );


        await loadMembershipClassesForDate(
            validMemberships,
            getTomorrowIndiaDate(),
            "tomorrowMembershipMessage",
            "tomorrowMembershipSlots",
            false
        );


    }
    catch (error) {

        console.error(
            "Membership classes error:",
            error
        );

        section.style.display = "block";

        section.innerHTML = `
            <div class="empty">
                Unable to load membership classes.
                Please refresh the page.
            </div>
        `;

    }

}


// ============================================================
// LOAD CLASSES FOR A PARTICULAR DATE
// ============================================================

async function loadMembershipClassesForDate(
    memberships,
    date,
    messageId,
    containerId,
    isToday
) {

    const message =
        document.getElementById(messageId);

    const container =
        document.getElementById(containerId);


    if (!message || !container) return;


    try {

        // ====================================================
        // CHECK MEMBERSHIP DATE
        // ====================================================

        const validForDate =
            memberships.filter(membership => {

                if (
                    membership.start_date &&
                    date < membership.start_date
                ) {
                    return false;
                }

                if (
                    membership.end_date &&
                    date > membership.end_date
                ) {
                    return false;
                }

                return true;

            });


        if (validForDate.length === 0) {

            message.textContent =
                "You do not have an active membership for this date.";

            container.innerHTML = "";

            return;

        }


        // ====================================================
        // SERVICE IDS
        // ====================================================

        const serviceIds = [
            ...new Set(
                validForDate
                    .map(m => m.service_id)
                    .filter(Boolean)
            )
        ];


        if (serviceIds.length === 0) {

            message.textContent =
                "No service is connected to your membership.";

            container.innerHTML = "";

            return;

        }


        // ====================================================
        // DATE RANGE
        // ====================================================

        const dateStart =
            `${date}T00:00:00+05:30`;

        const nextDate =
            getNextIndiaDate(date);

        const dateEnd =
            `${nextDate}T00:00:00+05:30`;


        // ====================================================
        // LOAD CLASS SLOTS
        // ====================================================

        let query =
            db
                .from("class_slots")
                .select(`
                    id,
                    service_id,
                    start_time,
                    end_time,
                    capacity,
                    mode,
                    online_link,
                    is_active,

                    services (
                        id,
                        name,
                        slug
                    )
                `)
                .in("service_id", serviceIds)
                .gte("start_time", dateStart)
                .lt("start_time", dateEnd)
                .eq("is_active", true)
                .order("start_time", {
                    ascending: true
                });


        // ====================================================
        // TODAY:
        // ONLY CLASSES THAT HAVE NOT STARTED
        // ====================================================

        if (isToday) {

            query =
                query.gte(
                    "start_time",
                    new Date().toISOString()
                );

        }


        const {
            data: slots,
            error: slotError
        } = await query;


        if (slotError) {
            throw slotError;
        }


        // ====================================================
        // CHECK EXISTING MEMBERSHIP SESSIONS
        // ====================================================

        const membershipIds =
            validForDate.map(
                membership => membership.id
            );


        const {
            data: existingSessions,
            error: sessionError
        } = await db
            .from("membership_sessions")
            .select(`
                id,
                membership_id,
                class_slot_id,
                session_date,
                attendance_status,
                selected_at,

                class_slots (
                    id,
                    service_id,
                    start_time,
                    end_time,
                    capacity,
                    mode,
                    online_link,

                    services (
                        id,
                        name,
                        slug
                    )
                )
            `)
            .in(
                "membership_id",
                membershipIds
            )
            .eq(
                "session_date",
                date
            );


        if (sessionError) {
            throw sessionError;
        }


        // ====================================================
        // ALREADY SELECTED
        // ====================================================

        if (
            existingSessions &&
            existingSessions.length > 0
        ) {

            const session =
                existingSessions[0];

            const slot =
                session.class_slots;


            if (slot) {

                message.textContent =
                    isToday
                        ? "Your class for today is selected."
                        : "Your class for tomorrow is selected.";


                container.innerHTML =
                    createSelectedSessionHTML(
                        session,
                        slot
                    );

                return;

            }

        }


        // ====================================================
        // NO UPCOMING SLOTS
        // ====================================================

        if (
            !slots ||
            slots.length === 0
        ) {

            message.textContent =
                isToday
                    ? "No upcoming classes available for today."
                    : "No available classes for tomorrow.";


            container.innerHTML = `
                <div class="empty">
                    ${
                        isToday
                            ? "There are no remaining membership classes today."
                            : "The studio has not published available slots for tomorrow yet."
                    }
                </div>
            `;

            return;

        }


        // ====================================================
        // CHECK CAPACITY
        // ====================================================

        const availableSlots = [];


        for (const slot of slots) {

            const {
                count,
                error: countError
            } = await db
                .from("membership_sessions")
                .select(
                    "id",
                    {
                        count: "exact",
                        head: true
                    }
                )
                .eq(
                    "class_slot_id",
                    slot.id
                )
                .eq(
                    "session_date",
                    date
                );


            if (countError) {

                console.error(
                    "Capacity error:",
                    countError
                );

                continue;

            }


            const used =
                Number(count || 0);

            const capacity =
                Number(slot.capacity || 0);


            if (used < capacity) {

                availableSlots.push(slot);

            }

        }


        // ====================================================
        // NO AVAILABLE CAPACITY
        // ====================================================

        if (
            availableSlots.length === 0
        ) {

            message.textContent =
                isToday
                    ? "No available classes for today."
                    : "No available classes for tomorrow.";

            container.innerHTML = `
                <div class="empty">
                    All published slots are currently full.
                </div>
            `;

            return;

        }


        // ====================================================
        // SHOW AVAILABLE SLOTS
        // ====================================================

        message.textContent =
            isToday
                ? "Available classes for today:"
                : "Available classes for tomorrow:";


        container.innerHTML = "";


        availableSlots.forEach(slot => {

            const card =
                document.createElement("div");


            card.className =
                "daily-slot";


            const serviceName =
                slot.services?.name ||
                "Yoga Class";


            const mode =
                String(
                    slot.mode || "offline"
                ).toLowerCase();


            card.innerHTML = `

                <div class="daily-slot-info">

                    <strong>
                        ${escapeHTML(serviceName)}
                    </strong>

                    <span class="daily-slot-time">

                        ${formatTime(
                            slot.start_time
                        )}

                        -

                        ${formatTime(
                            slot.end_time
                        )}

                    </span>

                    <span class="daily-slot-mode">

                        ${
                            mode === "online"
                                ? "Online"
                                : "Offline"
                        }

                    </span>

                </div>


                <button
                    type="button"
                    class="select-slot-btn"
                >
                    Select
                </button>

            `;


            const button =
                card.querySelector(
                    ".select-slot-btn"
                );


            button.addEventListener(
                "click",
                async () => {

                    button.disabled = true;

                    button.textContent =
                        "Selecting...";


                    // Find membership matching
                    // this class service

                    const membership =
                        validForDate.find(
                            m =>
                                String(
                                    m.service_id
                                ) ===
                                String(
                                    slot.service_id
                                )
                        );


                    if (!membership) {

                        alert(
                            "No matching membership found for this class."
                        );

                        button.disabled = false;

                        button.textContent =
                            "Select";

                        return;

                    }


                    await selectMembershipSlot(
                        membership,
                        slot,
                        date
                    );


                    button.disabled = false;

                    button.textContent =
                        "Select";

                }
            );


            container.appendChild(card);

        });

    }
    catch (error) {

        console.error(
            `Membership slots error (${date}):`,
            error
        );


        message.textContent =
            "Unable to load classes.";


        container.innerHTML = `
            <div class="empty">
                Please refresh the page and try again.
            </div>
        `;

    }

}


// ============================================================
// SELECT MEMBERSHIP SLOT
// ============================================================

async function selectMembershipSlot(
    membership,
    slot,
    sessionDate
) {

    try {

        // ====================================================
        // SAFETY CHECK:
        // DON'T ALLOW A CLASS THAT ALREADY STARTED
        // ====================================================

        const now =
            new Date();

        const classStart =
            new Date(
                slot.start_time
            );


        if (
            classStart <= now
        ) {

            alert(
                "This class has already started or is no longer available."
            );

            await loadTomorrowMembershipSlots(
                membership.customer_id
            );

            return;

        }


        // ====================================================
        // CONFIRM
        // ====================================================

        const time =
            `${formatTime(
                slot.start_time
            )} - ${formatTime(
                slot.end_time
            )}`;


        const selectedDate =
            formatDate(
                slot.start_time
            );


        const confirmed =
            confirm(
                `Select ${selectedDate}, ${time} for your class?`
            );


        if (!confirmed) {

            return;

        }


        // ====================================================
        // CHECK EXISTING SESSION
        // ====================================================

        const {
            data: existing,
            error: existingError
        } = await db
            .from("membership_sessions")
            .select("id")
            .eq(
                "membership_id",
                membership.id
            )
            .eq(
                "session_date",
                sessionDate
            )
            .maybeSingle();


        if (existingError) {

            throw existingError;

        }


        if (existing) {

            alert(
                "You already selected a class for this day."
            );


            await loadTomorrowMembershipSlots(
                membership.customer_id
            );

            return;

        }


        // ====================================================
        // CAPACITY CHECK AGAIN
        // ====================================================

        const {
            count,
            error: capacityError
        } = await db
            .from("membership_sessions")
            .select(
                "id",
                {
                    count: "exact",
                    head: true
                }
            )
            .eq(
                "class_slot_id",
                slot.id
            )
            .eq(
                "session_date",
                sessionDate
            );


        if (capacityError) {

            throw capacityError;

        }


        if (
            Number(count || 0) >=
            Number(slot.capacity || 0)
        ) {

            alert(
                "Sorry, this class is now full."
            );


            await loadTomorrowMembershipSlots(
                membership.customer_id
            );

            return;

        }


        // ====================================================
        // INSERT SESSION
        // ====================================================

        const {
            data,
            error
        } = await db
            .from("membership_sessions")
            .insert({

                membership_id:
                    membership.id,

                class_slot_id:
                    slot.id,

                session_date:
                    sessionDate,

                attendance_status:
                    "pending",

                selected_at:
                    new Date().toISOString()

            })
            .select()
            .single();


        if (error) {

            console.error(
                "Membership session insert error:",
                error
            );


            if (
                error.code === "23505"
            ) {

                alert(
                    "You already selected a class for this day."
                );

            }
            else {

                alert(
                    error.message ||
                    "Unable to select this class."
                );

            }

            return;

        }


        console.log(
            "Membership session created:",
            data
        );


        alert(
            `Your ${
                slot.mode === "online"
                    ? "online"
                    : "offline"
            } class is confirmed for ${selectedDate}, ${time}.`
        );


        // ====================================================
        // REFRESH BOTH TODAY + TOMORROW
        // ====================================================

        await loadTomorrowMembershipSlots(
            membership.customer_id
        );

    }
    catch (error) {

        console.error(
            "Slot selection error:",
            error
        );


        alert(
            error.message ||
            "Something went wrong while selecting the class."
        );

    }

}


// ============================================================
// SELECTED SESSION HTML
// ============================================================

function createSelectedSessionHTML(
    session,
    slot,
    serviceName
) {

    const mode =
        String(
            slot.mode ||
            "offline"
        ).toLowerCase();


    let html =
        `
        <div class="selected-session">

            <h3>
                ${escapeHTML(
                    serviceName ||
                    "Yoga Class"
                )}
            </h3>


            <p>

                <strong>
                    Date:
                </strong>

                ${formatDate(
                    slot.start_time
                )}

            </p>


            <p>

                <strong>
                    Time:
                </strong>

                ${formatTime(
                    slot.start_time
                )}

                -

                ${formatTime(
                    slot.end_time
                )}

            </p>


            <p>

                <strong>
                    Mode:
                </strong>

                ${
                    mode === "online"
                        ? "Online"
                        : "Offline"
                }

            </p>
        `;


    if (
        mode === "online" &&
        slot.online_link
    ) {

        html +=
            `
            <a
                href="${escapeAttribute(
                    slot.online_link
                )}"
                target="_blank"
                rel="noopener noreferrer"
                class="join-class-btn"
            >
                Join Online Class
            </a>
            `;

    }
    else {

        html +=
            `
            <p class="offline-note">

                Please come to the studio
                at your selected time.

            </p>
            `;

    }


    html +=
        `
        </div>
        `;


    return html;

}


// ============================================================
// LOGOUT
// ============================================================

async function logoutCustomer() {

    const button =
        document.getElementById(
            "logoutBtn"
        );


    if (button) {

        button.disabled =
            true;

        button.textContent =
            "Logging out...";

    }


    try {

        const {
            error
        } = await db.auth.signOut();


        if (error) {

            throw error;

        }


        // Clear customer cache ONLY on logout.

        localStorage.removeItem(
            CUSTOMER_CACHE_KEY
        );


        localStorage.removeItem(
            CUSTOMER_EMAIL_KEY
        );


    }

    catch (error) {

        console.error(
            "Logout error:",
            error
        );

    }


    window.location.replace(
        "index.html"
    );

}


// ============================================================
// TODAY - INDIA
// ============================================================

function getTodayIndiaDate() {

    const parts =
        new Intl.DateTimeFormat(
            "en-CA",
            {
                timeZone:
                    "Asia/Kolkata",

                year:
                    "numeric",

                month:
                    "2-digit",

                day:
                    "2-digit"
            }
        ).formatToParts(
            new Date()
        );


    const year =
        parts.find(
            p =>
                p.type === "year"
        )?.value;


    const month =
        parts.find(
            p =>
                p.type === "month"
        )?.value;


    const day =
        parts.find(
            p =>
                p.type === "day"
        )?.value;


    return `${year}-${month}-${day}`;

}


// ============================================================
// TOMORROW
// ============================================================

function getTomorrowIndiaDate() {

    return getNextIndiaDate(
        getTodayIndiaDate()
    );

}


// ============================================================
// NEXT INDIA DATE
// ============================================================

function getNextIndiaDate(
    dateString
) {

    const date =
        new Date(
            `${dateString}T12:00:00+05:30`
        );


    date.setUTCDate(
        date.getUTCDate() + 1
    );


    const parts =
        new Intl.DateTimeFormat(
            "en-CA",
            {
                timeZone:
                    "Asia/Kolkata",

                year:
                    "numeric",

                month:
                    "2-digit",

                day:
                    "2-digit"
            }
        ).formatToParts(
            date
        );


    const year =
        parts.find(
            p =>
                p.type === "year"
        )?.value;


    const month =
        parts.find(
            p =>
                p.type === "month"
        )?.value;


    const day =
        parts.find(
            p =>
                p.type === "day"
        )?.value;


    return `${year}-${month}-${day}`;

}


// ============================================================
// DATE FORMAT
// ============================================================

function formatDate(value) {

    if (!value) {

        return "—";

    }


    // PostgreSQL DATE:
    // Don't unnecessarily convert it through UTC.

    if (
        typeof value === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {

        const [
            year,
            month,
            day
        ] = value.split("-");


        return `${day} ${getMonthName(month)} ${year}`;

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "—";

    }


    return new Intl.DateTimeFormat(
        "en-IN",
        {
            timeZone:
                "Asia/Kolkata",

            day:
                "2-digit",

            month:
                "short",

            year:
                "numeric"
        }
    ).format(date);

}


// ============================================================
// MONTH NAME
// ============================================================

function getMonthName(month) {

    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
    ];


    return months[
        Number(month) - 1
    ] || "";

}


// ============================================================
// TIME FORMAT
// ============================================================

function formatTime(value) {

    if (!value) {

        return "—";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "—";

    }


    return new Intl.DateTimeFormat(
        "en-IN",
        {
            timeZone:
                "Asia/Kolkata",

            hour:
                "2-digit",

            minute:
                "2-digit",

            hour12:
                true
        }
    ).format(date);

}


// ============================================================
// SET TEXT
// ============================================================

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;

    }

}


// ============================================================
// SET HTML
// ============================================================

function setHTML(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.innerHTML =
            value;

    }

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(value) {

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

function escapeAttribute(value) {

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
// CUSTOMER REVIEWS
// ============================================================


// ============================================================
// LOAD SERVICES FOR REVIEW DROPDOWN
// ============================================================

async function loadReviewServices() {

    const serviceSelect =
        document.getElementById(
            "reviewService"
        );

    if (!serviceSelect || !db) {
        return;
    }


    try {

        const {
            data,
            error
        } = await db
            .from("services")
            .select(`
                id,
                name
            `)
            .eq(
                "is_active",
                true
            )
            .order(
                "display_order",
                {
                    ascending: true,
                    nullsFirst: false
                }
            );


        if (error) {

            console.error(
                "Review services loading error:",
                error
            );

            showReviewStatus(
                error.message ||
                "Unable to load services.",
                "error"
            );

            return;
        }


        serviceSelect.innerHTML = `
            <option value="">
                Select a service
            </option>
        `;


        (data || []).forEach(
            service => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    service.id;

                option.textContent =
                    service.name;

                serviceSelect.appendChild(
                    option
                );

            }
        );


        console.log(
            "Review services loaded successfully."
        );

    }

    catch (error) {

        console.error(
            "Unexpected review services error:",
            error
        );

        showReviewStatus(
            "Unable to load services.",
            "error"
        );

    }

}


// ============================================================
// SUBMIT CUSTOMER REVIEW
// ============================================================

async function submitCustomerReview(
    event
) {

    event.preventDefault();


    if (!db) {

        showReviewStatus(
            "Supabase connection is not available.",
            "error"
        );

        return;
    }


    const submitButton =
        document.getElementById(
            "submitReviewBtn"
        );


    const serviceId =
        document.getElementById(
            "reviewService"
        ).value;


    const rating =
        Number(
            document.getElementById(
                "reviewRating"
            ).value
        );


    const reviewText =
        document.getElementById(
            "reviewText"
        ).value.trim();


    // ========================================================
    // VALIDATION
    // ========================================================

    if (!serviceId) {

        showReviewStatus(
            "Please select a service.",
            "error"
        );

        return;
    }


    if (
        !Number.isInteger(rating) ||
        rating < 1 ||
        rating > 5
    ) {

        showReviewStatus(
            "Please select a rating from 1 to 5.",
            "error"
        );

        return;
    }


    if (!reviewText) {

        showReviewStatus(
            "Please write your review.",
            "error"
        );

        return;
    }


    if (reviewText.length < 5) {

        showReviewStatus(
            "Review must contain at least 5 characters.",
            "error"
        );

        return;
    }


    if (reviewText.length > 1000) {

        showReviewStatus(
            "Review must be 1000 characters or less.",
            "error"
        );

        return;
    }


    submitButton.disabled =
        true;

    submitButton.textContent =
        "Submitting...";


    try {

        // ====================================================
        // GET AUTHENTICATED USER
        // ====================================================

        const {
            data: {
                user
            },
            error: authError
        } = await db.auth.getUser();


        if (
            authError ||
            !user
        ) {

            window.location.href =
                "customer-login.html";

            return;
        }


        // ====================================================
        // GET CUSTOMER RECORD
        // ====================================================

        const {
            data: customer,
            error: customerError
        } = await db
            .from("customers")
            .select(
                "id"
            )
            .eq(
                "email",
                user.email
            )
            .maybeSingle();


        if (customerError) {
            throw customerError;
        }


        if (!customer) {

            showReviewStatus(
                "Your customer profile could not be found.",
                "error"
            );

            return;
        }


        // ====================================================
        // INSERT REVIEW
        // ====================================================

        const {
            error: reviewError
        } = await db
            .from("reviews")
            .insert({

                customer_id:
                    customer.id,

                service_id:
                    Number(serviceId),

                rating,

                review_text:
                    reviewText,

                status:
                    "pending"

            });


        if (reviewError) {

            console.error(
                "Review submission error:",
                reviewError
            );

            throw reviewError;
        }


        // ====================================================
        // SUCCESS
        // ====================================================

        document
            .getElementById(
                "customerReviewForm"
            )
            .reset();


        showReviewStatus(
            "Thank you! Your review has been submitted and is waiting for admin approval.",
            "success"
        );


        console.log(
            "Customer review submitted successfully."
        );

    }

    catch (error) {

        console.error(
            "Unexpected review submission error:",
            error
        );

        showReviewStatus(
            error.message ||
            "Unable to submit your review.",
            "error"
        );

    }

    finally {

        submitButton.disabled =
            false;

        submitButton.textContent =
            "Submit Review";

    }

}


// ============================================================
// REVIEW STATUS MESSAGE
// ============================================================

function showReviewStatus(
    message,
    type
) {

    const element =
        document.getElementById(
            "reviewStatusMessage"
        );


    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.className =
        `review-status-message ${type}`;


    window.clearTimeout(
        showReviewStatus.timeout
    );


    showReviewStatus.timeout =
        window.setTimeout(
            () => {

                element.textContent =
                    "";

                element.className =
                    "review-status-message";

            },
            6000
        );

}


// ============================================================
// REVIEW EVENT LISTENERS
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const reviewForm =
            document.getElementById(
                "customerReviewForm"
            );


        if (!reviewForm) {
            return;
        }


        reviewForm.addEventListener(
            "submit",
            submitCustomerReview
        );


        await loadReviewServices();

    }
);