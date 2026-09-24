// ============================================================
// ABH YOGAA STUDIO
// ADMIN CLASS SLOT MANAGEMENT + MEMBERSHIP ATTENDANCE
// ============================================================

console.log("ABH Admin Slots loaded.");

// ============================================================
// SUPABASE
// ============================================================

const db = window.supabaseClient;

if (!db) {
    console.error("Supabase client is missing.");
}

// ============================================================
// CONSTANTS
// ============================================================

const INDIA_TIMEZONE = "Asia/Kolkata";

// ============================================================
// DOM ELEMENTS
// ============================================================

const slotForm =
    document.getElementById("slotForm");

const serviceSelect =
    document.getElementById("serviceSelect");

const slotDate =
    document.getElementById("slotDate");

const startTime =
    document.getElementById("startTime");

const endTime =
    document.getElementById("endTime");

const capacity =
    document.getElementById("capacity");

const createSlotBtn =
    document.getElementById("createSlotBtn");

const slotsTableBody =
    document.getElementById("slotsTableBody");

const statusMessage =
    document.getElementById("statusMessage");

// ============================================================
// PAGE INITIALIZATION
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log("==============================");
        console.log("ADMIN CLASS SLOTS STARTING");
        console.log("==============================");

        try {

            await checkAdmin();

            initializeDate();

            createModeFields();

            addAttendanceColumnHeader();

            await loadServices();

            await loadUpcomingSlots();

        }

        catch (error) {

            console.error(
                "Admin slots initialization error:",
                error
            );

        }

    }
);

// ============================================================
// CHECK ADMIN AUTHENTICATION
// ============================================================

async function checkAdmin() {

    if (!db) {

        throw new Error(
            "Supabase is unavailable."
        );

    }

    const {
        data: {
            user
        },
        error
    } =
        await db.auth.getUser();

    if (error || !user) {

        window.location.replace(
            "admin-login.html"
        );

        return;

    }

    console.log(
        "Admin authenticated:",
        user.email
    );

    const {
        data: isAdmin,
        error: adminError
    } =
        await db.rpc("is_admin");

    if (
        adminError ||
        isAdmin !== true
    ) {

        console.error(
            "Admin authorization failed:",
            adminError
        );

        await db.auth.signOut();

        window.location.replace(
            "admin-login.html"
        );

        return;

    }

}

// ============================================================
// INDIA TODAY
// ============================================================

function getTodayIndia() {

    const parts =
        new Intl.DateTimeFormat(
            "en-CA",
            {
                timeZone: INDIA_TIMEZONE,
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            }
        ).formatToParts(new Date());

    const year =
        parts.find(
            p => p.type === "year"
        )?.value;

    const month =
        parts.find(
            p => p.type === "month"
        )?.value;

    const day =
        parts.find(
            p => p.type === "day"
        )?.value;

    return `${year}-${month}-${day}`;
}

// ============================================================
// INITIALIZE DATE
// ============================================================

function initializeDate() {

    if (!slotDate) {
        return;
    }

    const today =
        getTodayIndia();

    slotDate.min =
        today;

    slotDate.value =
        today;
}

// ============================================================
// CREATE MODE FIELDS
// ============================================================

function createModeFields() {

    if (!slotForm) {
        return;
    }

    if (
        document.getElementById(
            "slotMode"
        )
    ) {
        return;
    }

    const modeWrapper =
        document.createElement("div");

    modeWrapper.id =
        "modeWrapper";

    modeWrapper.style.cssText = `
        margin-top:18px;
    `;

    modeWrapper.innerHTML = `
        <label
            for="slotMode"
            style="
                display:block;
                margin-bottom:8px;
                font-weight:600;
            "
        >
            Class Mode
        </label>

        <select
            id="slotMode"
            style="
                width:100%;
                padding:12px;
                border:1px solid #ddd;
                border-radius:8px;
                background:white;
                box-sizing:border-box;
            "
        >
            <option value="offline">
                Offline (Studio)
            </option>

            <option value="online">
                Online
            </option>
        </select>
    `;

    const linkWrapper =
        document.createElement("div");

    linkWrapper.id =
        "onlineLinkWrapper";

    linkWrapper.style.cssText = `
        display:none;
        margin-top:18px;
    `;

    linkWrapper.innerHTML = `
        <label
            for="onlineLink"
            style="
                display:block;
                margin-bottom:8px;
                font-weight:600;
            "
        >
            Online Class Link
        </label>

        <input
            type="url"
            id="onlineLink"
            placeholder="https://meet.google.com/..."
            style="
                width:100%;
                padding:12px;
                border:1px solid #ddd;
                border-radius:8px;
                box-sizing:border-box;
            "
        >

        <small>
            Required for online classes.
        </small>
    `;

    const capacityElement =
        capacity?.closest(
            ".input-group"
        );

    if (capacityElement) {

        capacityElement
            .insertAdjacentElement(
                "afterend",
                modeWrapper
            );

        modeWrapper
            .insertAdjacentElement(
                "afterend",
                linkWrapper
            );

    }

    else {

        slotForm.appendChild(
            modeWrapper
        );

        slotForm.appendChild(
            linkWrapper
        );

    }

    const slotMode =
        document.getElementById(
            "slotMode"
        );

    const onlineLink =
        document.getElementById(
            "onlineLink"
        );

    const onlineLinkWrapper =
        document.getElementById(
            "onlineLinkWrapper"
        );

    slotMode.addEventListener(
        "change",
        () => {

            if (
                slotMode.value ===
                "online"
            ) {

                onlineLinkWrapper
                    .style.display =
                    "block";

                onlineLink.required =
                    true;

            }

            else {

                onlineLinkWrapper
                    .style.display =
                    "none";

                onlineLink.required =
                    false;

                onlineLink.value =
                    "";

            }

        }
    );
}

// ============================================================
// LOAD SERVICES
// ============================================================

async function loadServices() {

    try {

        const {
            data,
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

        serviceSelect.innerHTML = `
            <option value="">
                Select Service
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
            "Services loaded:",
            data
        );

    }

    catch (error) {

        console.error(
            "Service loading error:",
            error
        );

        showStatus(
            "Unable to load services.",
            "error"
        );

    }
}

// ============================================================
// CREATE INDIA TIMESTAMP
// ============================================================

function createIndiaTimestamp(
    date,
    time
) {

    return `${date}T${time}:00+05:30`;

}

// ============================================================
// CREATE SLOT FORM
// ============================================================

if (slotForm) {

    slotForm.addEventListener(
        "submit",
        createSlot
    );

}

// ============================================================
// CREATE CLASS SLOT
// ============================================================

async function createSlot(event) {

    event.preventDefault();

    const serviceId =
        Number(
            serviceSelect.value
        );

    const date =
        slotDate.value.trim();

    const start =
        startTime.value.trim();

    const end =
        endTime.value.trim();

    const capacityValue =
        Number(
            capacity.value
        );

    const slotMode =
        document.getElementById(
            "slotMode"
        );

    const onlineLink =
        document.getElementById(
            "onlineLink"
        );

    const mode =
        slotMode
            ? slotMode.value
            : "offline";

    const meetingLink =
        mode === "online" &&
        onlineLink
            ? onlineLink.value.trim()
            : null;

    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (!serviceId) {

        showStatus(
            "Please select a service.",
            "error"
        );

        return;
    }

    if (!date) {

        showStatus(
            "Please select a class date.",
            "error"
        );

        return;
    }

    if (!start || !end) {

        showStatus(
            "Please enter both start and end time.",
            "error"
        );

        return;
    }

    if (
        Number.isNaN(
            capacityValue
        ) ||
        capacityValue <= 0
    ) {

        showStatus(
            "Capacity must be greater than 0.",
            "error"
        );

        return;
    }

    if (
        mode === "online" &&
        !meetingLink
    ) {

        showStatus(
            "Please enter the online class link.",
            "error"
        );

        return;
    }

    if (
        mode === "online"
    ) {

        try {

            const url =
                new URL(
                    meetingLink
                );

            if (
                url.protocol !==
                    "http:" &&
                url.protocol !==
                    "https:"
            ) {

                throw new Error();

            }

        }

        catch {

            showStatus(
                "Please enter a valid online meeting URL.",
                "error"
            );

            return;
        }
    }

    const today =
        getTodayIndia();

    if (date < today) {

        showStatus(
            "You cannot create a slot for a past date.",
            "error"
        );

        return;
    }

    if (start >= end) {

        showStatus(
            "End time must be later than start time.",
            "error"
        );

        return;
    }

    const startTimestamp =
        createIndiaTimestamp(
            date,
            start
        );

    const endTimestamp =
        createIndiaTimestamp(
            date,
            end
        );

    createSlotBtn.disabled =
        true;

    createSlotBtn.innerText =
        "Creating...";

    try {

        // ----------------------------------------------------
        // CHECK DUPLICATE
        // ----------------------------------------------------

        const {
            data: existingSlot,
            error: duplicateError
        } =
            await db
                .from("class_slots")
                .select("id")
                .eq(
                    "service_id",
                    serviceId
                )
                .eq(
                    "start_time",
                    startTimestamp
                )
                .limit(1);

        if (duplicateError) {
            throw duplicateError;
        }

        if (
            existingSlot &&
            existingSlot.length > 0
        ) {

            showStatus(
                "A slot for this service at this time already exists.",
                "error"
            );

            return;
        }

        // ----------------------------------------------------
        // INSERT SLOT
        // ----------------------------------------------------

        const {
            data,
            error
        } =
            await db
                .from("class_slots")
                .insert({
                    service_id:
                        serviceId,

                    start_time:
                        startTimestamp,

                    end_time:
                        endTimestamp,

                    capacity:
                        capacityValue,

                    mode:
                        mode,

                    online_link:
                        meetingLink,

                    is_active:
                        true
                })
                .select()
                .single();

        if (error) {
            throw error;
        }

        console.log(
            "Slot created successfully:",
            data
        );

        showStatus(
            "Class slot created successfully.",
            "success"
        );

        startTime.value =
            "";

        endTime.value =
            "";

        capacity.value =
            "10";

        if (onlineLink) {
            onlineLink.value =
                "";
        }

        if (slotMode) {
            slotMode.value =
                "offline";
        }

        const wrapper =
            document.getElementById(
                "onlineLinkWrapper"
            );

        if (wrapper) {
            wrapper.style.display =
                "none";
        }

        if (onlineLink) {
            onlineLink.required =
                false;
        }

        await loadUpcomingSlots();

    }

    catch (error) {

        console.error(
            "Slot creation error:",
            error
        );

        showStatus(
            error.message ||
            "Unable to create class slot.",
            "error"
        );

    }

    finally {

        createSlotBtn.disabled =
            false;

        createSlotBtn.innerText =
            "Create Class Slot";

    }

}

// ============================================================
// ADD MEMBERS HEADER
// ============================================================

function addAttendanceColumnHeader() {

    const table =
        slotsTableBody?.closest(
            "table"
        );

    if (!table) {
        return;
    }

    const headerRow =
        table.querySelector(
            "thead tr"
        );

    if (!headerRow) {
        return;
    }

    if (
        headerRow.querySelector(
            ".members-column"
        )
    ) {
        return;
    }

    const th =
        document.createElement(
            "th"
        );

    th.className =
        "members-column";

    th.textContent =
        "Members";

    headerRow.appendChild(
        th
    );
}

// ============================================================
// LOAD UPCOMING SLOTS
// ============================================================

async function loadUpcomingSlots() {

    try {

        slotsTableBody.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="empty-slots"
                >
                    Loading slots...
                </td>
            </tr>
        `;

        const today =
            getTodayIndia();

        const {
            data,
            error
        } =
            await db
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
                        name
                    )
                `)
                .gte(
                    "start_time",
                    `${today}T00:00:00+05:30`
                )
                .order(
                    "start_time",
                    {
                        ascending: true
                    }
                );

        if (error) {
            throw error;
        }

        await renderSlots(
            data || []
        );

    }

    catch (error) {

        console.error(
            "Slot loading error:",
            error
        );

        slotsTableBody.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="empty-slots"
                >
                    Unable to load slots.
                </td>
            </tr>
        `;

        showStatus(
            error.message ||
            "Unable to load class slots.",
            "error"
        );

    }
}

// ============================================================
// RENDER SLOTS
// ============================================================

async function renderSlots(
    slots
) {

    slotsTableBody.innerHTML =
        "";

    if (
        !slots ||
        slots.length === 0
    ) {

        slotsTableBody.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="empty-slots"
                >
                    No upcoming class slots.
                </td>
            </tr>
        `;

        return;
    }

    for (
        const slot of slots
    ) {

        const row =
            document.createElement(
                "tr"
            );

        const serviceName =
            slot.services?.name ||
            "Unknown Service";

        const mode =
            String(
                slot.mode ||
                "offline"
            ).toLowerCase();

        row.innerHTML = `
            <td>
                <strong>
                    ${escapeHtml(
                        serviceName
                    )}
                </strong>
            </td>

            <td>
                ${formatDate(
                    slot.start_time
                )}
            </td>

            <td>
                ${formatTime(
                    slot.start_time
                )}
                -
                ${formatTime(
                    slot.end_time
                )}
            </td>

            <td>
                ${slot.capacity}
            </td>

            <td>
                <span class="slot-status">
                    ${
                        slot.is_active
                            ? "Active"
                            : "Inactive"
                    }
                </span>
            </td>

            <td>
                ${
                    mode === "online"
                        ? "Online"
                        : "Offline"
                }
            </td>

            <td>

                <button
                    type="button"
                    class="members-btn"
                    data-slot-id="${slot.id}"
                    style="
                        padding:8px 14px;
                        border:0;
                        border-radius:18px;
                        cursor:pointer;
                        background:#596b3d;
                        color:white;
                        margin-right:6px;
                    "
                >
                    Loading...
                </button>

                <button
                    type="button"
                    class="delete-slot-btn"
                    data-slot-id="${slot.id}"
                >
                    Delete
                </button>

            </td>
        `;

        const membersButton =
            row.querySelector(
                ".members-btn"
            );

        const deleteButton =
            row.querySelector(
                ".delete-slot-btn"
            );

        membersButton.addEventListener(
            "click",
            () => {
                openSlotMembers(
                    slot
                );
            }
        );

        deleteButton.addEventListener(
            "click",
            () => {
                deleteSlot(
                    slot.id
                );
            }
        );

        slotsTableBody.appendChild(
            row
        );

        // ----------------------------------------------------
        // MEMBER COUNT
        // ----------------------------------------------------
        // Count BOTH:
        // 1. Membership customers
        // 2. One Day customers
        // ----------------------------------------------------

        const {
            count: membershipCount,
            error: membershipCountError
        } =
            await db
                .from(
                    "membership_sessions"
                )
                .select(
                    "id",
                    {
                        count:
                            "exact",
                        head:
                            true
                    }
                )
                .eq(
                    "class_slot_id",
                    slot.id
                );

        if (membershipCountError) {

            console.error(
                "Membership member count error:",
                membershipCountError
            );

            membersButton.textContent =
                "Members";

            continue;
        }


        // ----------------------------------------------------
        // ONE DAY BOOKING COUNT
        // ----------------------------------------------------

        const {
            count: oneDayCount,
            error: oneDayCountError
        } =
            await db
                .from(
                    "bookings"
                )
                .select(
                    "id",
                    {
                        count:
                            "exact",
                        head:
                            true
                    }
                )
                .eq(
                    "class_slot_id",
                    slot.id
                )
                .is(
                    "membership_id",
                    null
                )
                .eq(
                    "booking_status",
                    "confirmed"
                );

        if (oneDayCountError) {

            console.error(
                "One Day member count error:",
                oneDayCountError
            );

            membersButton.textContent =
                `Members (${membershipCount || 0})`;

            continue;
        }


        // ----------------------------------------------------
        // TOTAL MEMBERS
        // ----------------------------------------------------

        const totalMembers =
            (membershipCount || 0) +
            (oneDayCount || 0);

        membersButton.textContent =
            `Members (${totalMembers})`;

            }
        }

// ============================================================
// OPEN SLOT MEMBERS
// ============================================================

// ============================================================
// OPEN SLOT MEMBERS
// ============================================================

async function openSlotMembers(
    slot
) {

    try {

        showMembersModal(
            slot,
            "Loading members..."
        );


        // ====================================================
        // LOAD MEMBERSHIP SESSIONS
        // ====================================================

        const {
            data: sessions,
            error: sessionError
        } =
            await db
                .from(
                    "membership_sessions"
                )
                .select(`
                    id,
                    membership_id,
                    class_slot_id,
                    session_date,
                    attendance_status,
                    selected_at
                `)
                .eq(
                    "class_slot_id",
                    slot.id
                )
                .order(
                    "selected_at",
                    {
                        ascending: true
                    }
                );

        if (sessionError) {
            throw sessionError;
        }


        // ====================================================
        // LOAD ONE DAY BOOKINGS
        // ====================================================

        const {
            data: oneDayBookings,
            error: bookingError
        } =
            await db
                .from(
                    "bookings"
                )
                .select(`
                    id,
                    customer_id,
                    class_slot_id,
                    booking_status,
                    payment_status,
                    amount,
                    attendance_status,
                    created_at
                `)
                .eq(
                    "class_slot_id",
                    slot.id
                )
                .is(
                    "membership_id",
                    null
                )
                .eq(
                    "booking_status",
                    "confirmed"
                )
                .order(
                    "created_at",
                    {
                        ascending: true
                    }
                );

        if (bookingError) {
            throw bookingError;
        }


        // ====================================================
        // MEMBERSHIP IDS
        // ====================================================

        const membershipIds =
            [
                ...new Set(
                    (sessions || [])
                        .map(
                            session =>
                                session.membership_id
                        )
                        .filter(Boolean)
                )
            ];


        // ====================================================
        // LOAD MEMBERSHIPS
        // ====================================================

        let memberships = [];

        if (
            membershipIds.length > 0
        ) {

            const {
                data,
                error
            } =
                await db
                    .from(
                        "memberships"
                    )
                    .select(`
                        id,
                        customer_id,
                        plan_id,
                        booking_mode,
                        status,
                        start_date,
                        end_date
                    `)
                    .in(
                        "id",
                        membershipIds
                    );

            if (error) {
                throw error;
            }

            memberships =
                data || [];
        }


        // ====================================================
        // CUSTOMER IDS
        // ====================================================

        const membershipCustomerIds =
            (memberships || [])
                .map(
                    membership =>
                        membership.customer_id
                )
                .filter(Boolean);

        const oneDayCustomerIds =
            (oneDayBookings || [])
                .map(
                    booking =>
                        booking.customer_id
                )
                .filter(Boolean);

        const customerIds =
            [
                ...new Set(
                    [
                        ...membershipCustomerIds,
                        ...oneDayCustomerIds
                    ]
                )
            ];


        // ====================================================
        // LOAD CUSTOMERS
        // ====================================================

        let customers = [];

        if (
            customerIds.length > 0
        ) {

            const {
                data,
                error
            } =
                await db
                    .from(
                        "customers"
                    )
                    .select(`
                        id,
                        full_name,
                        email,
                        phone
                    `)
                    .in(
                        "id",
                        customerIds
                    );

            if (error) {
                throw error;
            }

            customers =
                data || [];
        }


        // ====================================================
        // LOAD PLAN NAMES
        // ====================================================

        const planIds =
            [
                ...new Set(
                    (memberships || [])
                        .map(
                            membership =>
                                membership.plan_id
                        )
                        .filter(Boolean)
                )
            ];

        let plans = [];

        if (
            planIds.length > 0
        ) {

            const {
                data,
                error
            } =
                await db
                    .from(
                        "plans"
                    )
                    .select(
                        "id,name"
                    )
                    .in(
                        "id",
                        planIds
                    );

            if (error) {
                throw error;
            }

            plans =
                data || [];
        }


        // ====================================================
        // MAP DATA
        // ====================================================

        const membershipMap =
            new Map();

        (memberships || [])
            .forEach(
                membership => {

                    membershipMap.set(
                        String(
                            membership.id
                        ),
                        membership
                    );

                }
            );


        const customerMap =
            new Map();

        (customers || [])
            .forEach(
                customer => {

                    customerMap.set(
                        String(
                            customer.id
                        ),
                        customer
                    );

                }
            );


        const planMap =
            new Map();

        (plans || [])
            .forEach(
                plan => {

                    planMap.set(
                        String(
                            plan.id
                        ),
                        plan
                    );

                }
            );


        // ====================================================
        // COMBINED MEMBER LIST
        // ====================================================

        const combinedMembers = [];


        // ====================================================
        // MEMBERSHIP CUSTOMERS
        // ====================================================

        (sessions || [])
            .forEach(
                session => {

                    const membership =
                        membershipMap.get(
                            String(
                                session.membership_id
                            )
                        );

                    const customer =
                        membership
                            ? customerMap.get(
                                String(
                                    membership.customer_id
                                )
                            )
                            : null;

                    const plan =
                        membership
                            ? planMap.get(
                                String(
                                    membership.plan_id
                                )
                            )
                            : null;

                    combinedMembers.push({

                        type:
                            "Membership",

                        customer:
                            customer,

                        plan:
                            plan?.name ||
                            "Membership",

                        mode:
                            String(
                                membership?.booking_mode ||
                                slot.mode ||
                                "offline"
                            ).toLowerCase(),

                        bookedAt:
                            session.selected_at,

                        attendance:
                            String(
                                session.attendance_status ||
                                "pending"
                            ).toLowerCase(),

                        recordId:
                            session.id

                    });

                }
            );


        // ====================================================
        // ONE DAY CUSTOMERS
        // ====================================================

        (oneDayBookings || [])
            .forEach(
                booking => {

                    const customer =
                        customerMap.get(
                            String(
                                booking.customer_id
                            )
                        );

                    combinedMembers.push({

                        type:
                            "One Day",

                        customer:
                            customer,

                        plan:
                            "One Day",

                        mode:
                            String(
                                slot.mode ||
                                "offline"
                            ).toLowerCase(),

                        bookedAt:
                            booking.created_at,

                        attendance:
                            String(
                                booking.attendance_status ||
                                "pending"
                            ).toLowerCase(),

                        recordId:
                            booking.id

                    });

                }
            );


        // ====================================================
        // NO MEMBERS
        // ====================================================

        if (
            combinedMembers.length === 0
        ) {

            showMembersModal(
                slot,
                `
                    <div
                        style="
                            text-align:center;
                            padding:30px;
                            color:#777;
                        "
                    >
                        No customers have booked
                        this class yet.
                    </div>
                `
            );

            return;
        }


        // ====================================================
        // BUILD TABLE
        // ====================================================

        let html = `

            <div
                style="
                    overflow-x:auto;
                "
            >

                <table
                    style="
                        width:100%;
                        border-collapse:collapse;
                        min-width:1000px;
                    "
                >

                    <thead>

                        <tr>

                            <th style="
                                padding:12px;
                                text-align:left;
                                border-bottom:1px solid #ddd;
                            ">
                                Customer
                            </th>

                            <th style="
                                padding:12px;
                                text-align:left;
                                border-bottom:1px solid #ddd;
                            ">
                                Phone
                            </th>

                            <th style="
                                padding:12px;
                                text-align:left;
                                border-bottom:1px solid #ddd;
                            ">
                                Type
                            </th>

                            <th style="
                                padding:12px;
                                text-align:left;
                                border-bottom:1px solid #ddd;
                            ">
                                Plan
                            </th>

                            <th style="
                                padding:12px;
                                text-align:left;
                                border-bottom:1px solid #ddd;
                            ">
                                Mode
                            </th>

                            <th style="
                                padding:12px;
                                text-align:left;
                                border-bottom:1px solid #ddd;
                            ">
                                Booked
                            </th>

                            <th style="
                                padding:12px;
                                text-align:left;
                                border-bottom:1px solid #ddd;
                            ">
                                Attendance
                            </th>

                            <th style="
                                padding:12px;
                                text-align:left;
                                border-bottom:1px solid #ddd;
                            ">
                                Action
                            </th>

                        </tr>

                    </thead>

                    <tbody>
        `;


        // ====================================================
        // MEMBER ROWS
        // ====================================================

        combinedMembers.forEach(
            member => {

                const attendance =
                    member.attendance;

                const attendanceText =
                    attendance === "yes"
                        ? "Present"
                        : attendance === "no"
                            ? "Absent"
                            : "Pending";

                const modeText =
                    member.mode === "online"
                        ? "Online"
                        : "Offline";


                html += `

                    <tr>

                        <td style="
                            padding:12px;
                            border-bottom:1px solid #eee;
                        ">

                            <strong>
                                ${escapeHtml(
                                    member.customer?.full_name ||
                                    "Customer"
                                )}
                            </strong>

                            <br>

                            <small>
                                ${escapeHtml(
                                    member.customer?.email ||
                                    ""
                                )}
                            </small>

                        </td>


                        <td style="
                            padding:12px;
                            border-bottom:1px solid #eee;
                        ">
                            ${escapeHtml(
                                member.customer?.phone ||
                                "—"
                            )}
                        </td>


                        <td style="
                            padding:12px;
                            border-bottom:1px solid #eee;
                        ">

                            <strong>
                                ${escapeHtml(
                                    member.type
                                )}
                            </strong>

                        </td>


                        <td style="
                            padding:12px;
                            border-bottom:1px solid #eee;
                        ">
                            ${escapeHtml(
                                member.plan
                            )}
                        </td>


                        <td style="
                            padding:12px;
                            border-bottom:1px solid #eee;
                        ">
                            ${modeText}
                        </td>


                        <td style="
                            padding:12px;
                            border-bottom:1px solid #eee;
                        ">
                            ${formatDateTime(
                                member.bookedAt
                            )}
                        </td>


                        <td style="
                            padding:12px;
                            border-bottom:1px solid #eee;
                        ">

                            <span
                                style="
                                    font-weight:600;
                                "
                            >
                                ${escapeHtml(
                                    attendanceText
                                )}
                            </span>

                        </td>


                        <td style="
                            padding:12px;
                            border-bottom:1px solid #eee;
                        ">

                            <button
                                type="button"
                                class="attendance-btn"
                                data-record-id="${member.recordId}"
                                data-record-type="${member.type}"
                                data-status="yes"
                                style="
                                    border:0;
                                    padding:6px 10px;
                                    border-radius:15px;
                                    cursor:pointer;
                                    margin:2px;
                                "
                            >
                                Present
                            </button>

                            <button
                                type="button"
                                class="attendance-btn"
                                data-record-id="${member.recordId}"
                                data-record-type="${member.type}"
                                data-status="no"
                                style="
                                    border:0;
                                    padding:6px 10px;
                                    border-radius:15px;
                                    cursor:pointer;
                                    margin:2px;
                                "
                            >
                                Absent
                            </button>

                        </td>

                    </tr>

                `;

            }
        );


        html += `

                    </tbody>

                </table>

            </div>

        `;


        showMembersModal(
            slot,
            html
        );


        // ====================================================
        // ATTENDANCE BUTTON EVENTS
        // ====================================================

        document
            .querySelectorAll(
                ".attendance-btn"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        async () => {

                            button.disabled =
                                true;

                            await updateAttendance(
                                button.dataset.recordId,
                                button.dataset.status,
                                button.dataset.recordType,
                                slot
                            );

                            button.disabled =
                                false;

                        }
                    );

                }
            );

    }

    catch (error) {

        console.error(
            "Member loading error:",
            error
        );

        showMembersModal(
            slot,
            `
                <div
                    style="
                        padding:30px;
                        text-align:center;
                        color:#a33;
                    "
                >

                    Unable to load members.

                    <br><br>

                    ${escapeHtml(
                        error.message ||
                        ""
                    )}

                </div>
            `
        );

    }

}

// ============================================================
// FIXED ATTENDANCE UPDATE
// ============================================================
//
// DATABASE CHECK CONSTRAINT:
//
// pending
// yes
// no
//
// Therefore DO NOT send:
// present
// absent
// completed
//
// ============================================================

// ============================================================
// UPDATE ATTENDANCE
// ============================================================

async function updateAttendance(
    recordId,
    status,
    recordType,
    slot
) {

    try {

        const validStatuses = [
            "pending",
            "yes",
            "no"
        ];


        if (
            !validStatuses.includes(
                status
            )
        ) {

            console.error(
                "Invalid attendance status:",
                status
            );

            return;
        }


        // ====================================================
        // MEMBERSHIP ATTENDANCE
        // ====================================================

        if (
            recordType ===
            "Membership"
        ) {

            const {
                error
            } =
                await db
                    .from(
                        "membership_sessions"
                    )
                    .update({
                        attendance_status:
                            status
                    })
                    .eq(
                        "id",
                        recordId
                    );

            if (error) {
                throw error;
            }

        }


        // ====================================================
        // ONE DAY ATTENDANCE
        // ====================================================

        else if (
            recordType ===
            "One Day"
        ) {

            const {
                error
            } =
                await db
                    .from(
                        "bookings"
                    )
                    .update({
                        attendance_status:
                            status
                    })
                    .eq(
                        "id",
                        recordId
                    );

            if (error) {
                throw error;
            }

        }


        // ====================================================
        // UNKNOWN TYPE
        // ====================================================

        else {

            throw new Error(
                "Unknown booking type."
            );

        }


        const statusText =
            status === "yes"
                ? "Present"
                : status === "no"
                    ? "Absent"
                    : "Pending";


        showStatus(
            `Attendance marked ${statusText}.`,
            "success"
        );


        await openSlotMembers(
            slot
        );

    }

    catch (error) {

        console.error(
            "Attendance update error:",
            error
        );

        showStatus(
            error.message ||
            "Unable to update attendance.",
            "error"
        );

    }

}
// ============================================================
// MEMBERS MODAL
// ============================================================

function showMembersModal(
    slot,
    content
) {

    const oldModal =
        document.getElementById(
            "membersModal"
        );

    if (oldModal) {
        oldModal.remove();
    }

    const modal =
        document.createElement(
            "div"
        );

    modal.id =
        "membersModal";

    modal.style.cssText = `
        position:fixed;
        inset:0;
        background:rgba(0,0,0,.55);
        z-index:99999;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:20px;
        box-sizing:border-box;
    `;

    const box =
        document.createElement(
            "div"
        );

    box.style.cssText = `
        width:min(1100px,96vw);
        max-height:90vh;
        overflow:auto;
        background:white;
        border-radius:18px;
        padding:25px;
        box-sizing:border-box;
        box-shadow:0 20px 60px rgba(0,0,0,.25);
    `;

    box.innerHTML = `

        <div
            style="
                display:flex;
                justify-content:space-between;
                align-items:center;
                gap:15px;
                margin-bottom:20px;
            "
        >

            <div>

                <h2
                    style="
                        margin:0;
                        color:#596b3d;
                        font-family:Georgia,serif;
                    "
                >
                    Class Members
                </h2>

                <p
                    style="
                        margin:6px 0 0;
                        color:#777;
                    "
                >

                    ${escapeHtml(
                        slot.services?.name ||
                        "Yoga Class"
                    )}

                    ·

                    ${formatDate(
                        slot.start_time
                    )}

                    ·

                    ${formatTime(
                        slot.start_time
                    )}

                    -

                    ${formatTime(
                        slot.end_time
                    )}

                </p>

            </div>

            <button
                type="button"
                id="closeMembersModal"
                style="
                    border:0;
                    background:#eee;
                    width:38px;
                    height:38px;
                    border-radius:50%;
                    cursor:pointer;
                    font-size:20px;
                "
            >
                ×
            </button>

        </div>

        <div id="membersModalContent">
            ${content}
        </div>

    `;

    modal.appendChild(
        box
    );

    document.body.appendChild(
        modal
    );

    document
        .getElementById(
            "closeMembersModal"
        )
        .addEventListener(
            "click",
            () => modal.remove()
        );

    modal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                modal
            ) {

                modal.remove();

            }

        }
    );

}

// ============================================================
// DELETE SLOT
// ============================================================

async function deleteSlot(
    slotId
) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this class slot?"
        );

    if (!confirmed) {
        return;
    }

    try {

        // ----------------------------------------------------
        // CHECK MEMBERS
        // ----------------------------------------------------

        const {
            count,
            error:
                countError
        } =
            await db
                .from(
                    "membership_sessions"
                )
                .select(
                    "id",
                    {
                        count:
                            "exact",
                        head:
                            true
                    }
                )
                .eq(
                    "class_slot_id",
                    slotId
                );

        if (countError) {
            throw countError;
        }

        if (
            Number(
                count || 0
            ) > 0
        ) {

            showStatus(
                "This slot has customers. Do not delete it; manage the attendance instead.",
                "error"
            );

            return;
        }

        // ----------------------------------------------------
        // DELETE
        // ----------------------------------------------------

        const {
            error
        } =
            await db
                .from(
                    "class_slots"
                )
                .delete()
                .eq(
                    "id",
                    slotId
                );

        if (error) {
            throw error;
        }

        showStatus(
            "Class slot deleted successfully.",
            "success"
        );

        await loadUpcomingSlots();

    }

    catch (error) {

        console.error(
            "Delete slot error:",
            error
        );

        showStatus(
            error.message ||
            "Unable to delete slot.",
            "error"
        );

    }

}

// ============================================================
// FORMAT DATE
// ============================================================

function formatDate(
    timestamp
) {

    if (!timestamp) {
        return "—";
    }

    const date =
        new Date(timestamp);

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
                INDIA_TIMEZONE,

            day:
                "2-digit",

            month:
                "short",

            year:
                "numeric"
        }
    ).format(
        date
    );

}

// ============================================================
// FORMAT TIME
// ============================================================

function formatTime(
    timestamp
) {

    if (!timestamp) {
        return "—";
    }

    const date =
        new Date(timestamp);

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
                INDIA_TIMEZONE,

            hour:
                "2-digit",

            minute:
                "2-digit",

            hour12:
                true
        }
    ).format(
        date
    );

}

// ============================================================
// FORMAT DATE + TIME
// ============================================================

function formatDateTime(
    timestamp
) {

    if (!timestamp) {
        return "—";
    }

    const date =
        new Date(timestamp);

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
                INDIA_TIMEZONE,

            day:
                "2-digit",

            month:
                "short",

            year:
                "numeric",

            hour:
                "2-digit",

            minute:
                "2-digit",

            hour12:
                true
        }
    ).format(
        date
    );

}

// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHtml(
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
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}

// ============================================================
// STATUS MESSAGE
// ============================================================

function showStatus(
    message,
    type
) {

    if (!statusMessage) {
        return;
    }

    statusMessage.innerText =
        message;

    statusMessage.className =
        "status-message " +
        type;

    setTimeout(
        () => {

            statusMessage.className =
                "status-message";

        },
        4000
    );

}