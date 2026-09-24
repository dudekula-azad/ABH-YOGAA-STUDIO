// ============================================================
// ABH YOGAA STUDIO
// ADMIN DASHBOARD
// ============================================================

const db = window.supabaseClient;

const INDIA_TIMEZONE = "Asia/Kolkata";

// ============================================================
// PAGE LOAD
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log(
            "Admin Dashboard loaded."
        );

        if (!db) {

            console.error(
                "Supabase client is not available."
            );

            return;
        }

        // ----------------------------------------------------
        // CHECK LOGIN
        // ----------------------------------------------------

        const {
            data: {
                user
            },
            error: userError
        } =
            await db
                .auth
                .getUser();

        if (
            userError ||
            !user
        ) {

            window.location.replace =
                "admin-login.html";

            return;
        }

        console.log(
            "Logged in admin:",
            user.email
        );

        // ----------------------------------------------------
        // CHECK ADMIN
        // ----------------------------------------------------

        const {
            data: isAdmin,
            error: adminError
        } =
            await db
                .rpc("is_admin");

        if (
            adminError ||
            isAdmin !== true
        ) {

            console.error(
                "Admin authorization failed:",
                adminError
            );

            await db
                .auth
                .signOut();

            window.location.href =
                "admin-login.html";

            return;
        }

        // ----------------------------------------------------
        // SHOW EMAIL
        // ----------------------------------------------------

        const adminEmail =
            document.getElementById(
                "adminEmail"
            );

        if (adminEmail) {

            adminEmail.innerText =
                user.email;

        }

        // ----------------------------------------------------
        // LOAD DASHBOARD
        // ----------------------------------------------------

        await Promise.all([
            loadBookingStatistics(),
            loadSlotStatistics(),
            loadRecentBookings(),
            loadTodayAttendance()
        ]);

        // ----------------------------------------------------
        // LOGOUT
        // ----------------------------------------------------

        const logoutBtn =
            document.getElementById(
                "logoutBtn"
            );

        if (logoutBtn) {

            logoutBtn.addEventListener(
                "click",
                logoutAdmin
            );

        }

    }
);

// ============================================================
// BOOKING STATISTICS
// ============================================================

async function loadBookingStatistics() {

    try {

        // ----------------------------------------------------
        // TOTAL ONE DAY BOOKINGS
        // ----------------------------------------------------

        const {
            count: oneDayTotal,
            error: oneDayTotalError
        } =
            await db
                .from("bookings")
                .select(
                    "id",
                    {
                        count: "exact",
                        head: true
                    }
                );

        if (oneDayTotalError) {
            throw oneDayTotalError;
        }


        // ----------------------------------------------------
        // TOTAL MEMBERSHIPS
        // ----------------------------------------------------

        const {
            count: membershipTotal,
            error: membershipTotalError
        } =
            await db
                .from("memberships")
                .select(
                    "id",
                    {
                        count: "exact",
                        head: true
                    }
                );

        if (membershipTotalError) {
            throw membershipTotalError;
        }


        // ----------------------------------------------------
        // COMBINED TOTAL
        // ----------------------------------------------------

        const totalBookings =
            (oneDayTotal || 0) +
            (membershipTotal || 0);


        const totalElement =
            document.getElementById(
                "totalBookings"
            );

        if (totalElement) {

            totalElement.innerText =
                totalBookings;

        }


        // ----------------------------------------------------
        // TODAY
        // ----------------------------------------------------

        const today =
            getTodayIndia();

        const tomorrow =
            getNextIndiaDate(
                today
            );


        // ----------------------------------------------------
        // TODAY'S ONE DAY BOOKINGS
        // ----------------------------------------------------

        const {
            count: todayOneDay,
            error: todayOneDayError
        } =
            await db
                .from("bookings")
                .select(
                    "id",
                    {
                        count: "exact",
                        head: true
                    }
                )
                .gte(
                    "created_at",
                    `${today}T00:00:00+05:30`
                )
                .lt(
                    "created_at",
                    `${tomorrow}T00:00:00+05:30`
                );

        if (todayOneDayError) {
            throw todayOneDayError;
        }


        // ----------------------------------------------------
        // TODAY'S MEMBERSHIPS
        // ----------------------------------------------------

        const {
            count: todayMemberships,
            error: todayMembershipError
        } =
            await db
                .from("memberships")
                .select(
                    "id",
                    {
                        count: "exact",
                        head: true
                    }
                )
                .gte(
                    "created_at",
                    `${today}T00:00:00+05:30`
                )
                .lt(
                    "created_at",
                    `${tomorrow}T00:00:00+05:30`
                );

        if (todayMembershipError) {
            throw todayMembershipError;
        }


        // ----------------------------------------------------
        // COMBINED TODAY
        // ----------------------------------------------------

        const todayBookings =
            (todayOneDay || 0) +
            (todayMemberships || 0);


        const todayElement =
            document.getElementById(
                "todayBookings"
            );

        if (todayElement) {

            todayElement.innerText =
                todayBookings;

        }


        // ----------------------------------------------------
        // ONE DAY REVENUE
        // ----------------------------------------------------

        const {
            data: bookingPayments,
            error: bookingRevenueError
        } =
            await db
                .from("bookings")
                .select(
                    "amount,payment_status"
                )
                .eq(
                    "payment_status",
                    "paid"
                );

        if (bookingRevenueError) {
            throw bookingRevenueError;
        }


        const oneDayRevenue =
            (bookingPayments || [])
                .reduce(
                    (
                        total,
                        booking
                    ) => {

                        return total +
                            Number(
                                booking.amount ||
                                0
                            );

                    },
                    0
                );


        // ----------------------------------------------------
        // MEMBERSHIP REVENUE
        // ----------------------------------------------------

        const {
            data: membershipPayments,
            error: membershipRevenueError
        } =
            await db
                .from("memberships")
                .select(
                    "amount,payment_status"
                )
                .eq(
                    "payment_status",
                    "paid"
                );

        if (membershipRevenueError) {
            throw membershipRevenueError;
        }


        const membershipRevenue =
            (membershipPayments || [])
                .reduce(
                    (
                        total,
                        membership
                    ) => {

                        return total +
                            Number(
                                membership.amount ||
                                0
                            );

                    },
                    0
                );


        // ----------------------------------------------------
        // COMBINED REVENUE
        // ----------------------------------------------------

        const revenue =
            oneDayRevenue +
            membershipRevenue;


        const revenueElement =
            document.getElementById(
                "totalRevenue"
            );

        if (revenueElement) {

            revenueElement.innerText =
                "₹" +
                revenue.toFixed(2);

        }

    }

    catch (error) {

        console.error(
            "Booking statistics error:",
            error
        );

    }

}

// ============================================================
// SLOT STATISTICS
// ============================================================

async function loadSlotStatistics() {

    try {

        const {
            count,
            error
        } =
            await db
                .from("class_slots")
                .select(
                    "id",
                    {
                        count: "exact",
                        head: true
                    }
                )
                .eq(
                    "is_active",
                    true
                );

        if (error) {
            throw error;
        }

        const element =
            document.getElementById(
                "activeSlots"
            );

        if (element) {

            element.innerText =
                count || 0;

        }

    }

    catch (error) {

        console.error(
            "Slot statistics error:",
            error
        );

    }

}

// ============================================================
// TODAY'S ATTENDANCE DASHBOARD
// ============================================================

async function loadTodayAttendance() {

    const container =
        document.getElementById(
            "attendanceDashboard"
        );

    if (!container) {

        console.log(
            "Attendance dashboard container not found."
        );

        return;
    }


    container.innerHTML = `
        <div class="loading">
            Loading today's attendance...
        </div>
    `;


    try {

        const today =
            getTodayIndia();

        const tomorrow =
            getNextIndiaDate(
                today
            );


        // ----------------------------------------------------
        // TODAY'S CLASS SLOTS
        // ----------------------------------------------------

        const {
            data: slots,
            error: slotError
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
                    is_active,

                    services (
                        id,
                        name
                    )
                `)
                .gte(
                    "start_time",
                    `${today}T00:00:00+05:30`
                )
                .lt(
                    "start_time",
                    `${tomorrow}T00:00:00+05:30`
                )
                .eq(
                    "is_active",
                    true
                )
                .order(
                    "start_time",
                    {
                        ascending: true
                    }
                );


        if (slotError) {
            throw slotError;
        }


        if (
            !slots ||
            slots.length === 0
        ) {

            container.innerHTML = `
                <div class="empty">
                    No classes scheduled for today.
                </div>
            `;

            return;
        }


        // ----------------------------------------------------
        // LOAD ATTENDANCE FOR EVERY SLOT
        // ----------------------------------------------------

        const attendanceData = [];


        for (
            const slot of slots
        ) {


            // =================================================
            // MEMBERSHIP SESSIONS
            // =================================================

            const {
                data: sessions,
                error: sessionError
            } =
                await db
                    .from(
                        "membership_sessions"
                    )
                    .select(
                        "id,attendance_status"
                    )
                    .eq(
                        "class_slot_id",
                        slot.id
                    )
                    .eq(
                        "session_date",
                        today
                    );


            if (sessionError) {

                console.error(
                    "Membership attendance error:",
                    sessionError
                );

            }


            const sessionList =
                sessions || [];


            const membershipPresent =
                sessionList.filter(
                    session =>
                        session.attendance_status ===
                        "yes"
                ).length;


            const membershipAbsent =
                sessionList.filter(
                    session =>
                        session.attendance_status ===
                        "no"
                ).length;


            const membershipPending =
                sessionList.filter(
                    session =>
                        !session.attendance_status ||
                        session.attendance_status ===
                        "pending"
                ).length;

                // =================================================
                // ONE DAY BOOKINGS
                // =================================================

                const {
                    data: oneDayBookings,
                    error: bookingError
                } =
                    await db
                        .from("bookings")
                        .select(
                            "id,booking_status,attendance_status"
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


                if (bookingError) {

                    console.error(
                        "One Day attendance error:",
                        bookingError
                    );

                }


                const oneDayList =
                    oneDayBookings || [];


                // =================================================
                // ONE DAY ATTENDANCE COUNTS
                // =================================================

                const oneDayPresent =
                    oneDayList.filter(
                        booking =>
                            booking.attendance_status ===
                            "yes"
                    ).length;


                const oneDayAbsent =
                    oneDayList.filter(
                        booking =>
                            booking.attendance_status ===
                            "no"
                    ).length;


                const oneDayPending =
                    oneDayList.filter(
                        booking =>
                            !booking.attendance_status ||
                            booking.attendance_status ===
                            "pending"
                    ).length;


                // =================================================
                // COMBINED COUNTS
                // =================================================

                const total =
                    sessionList.length +
                    oneDayList.length;


                const present =
                    membershipPresent +
                    oneDayPresent;


                const absent =
                    membershipAbsent +
                    oneDayAbsent;


                const pending =
                    membershipPending +
                    oneDayPending;


                attendanceData.push({

                    slot,

                    total,

                    present,

                    absent,

                    pending

                });

        }


        renderAttendanceDashboard(
            attendanceData
        );

    }

    catch (error) {

        console.error(
            "Attendance dashboard error:",
            error
        );

        container.innerHTML = `
            <div class="error">
                Unable to load today's attendance.
            </div>
        `;

    }

}
// ============================================================
// RENDER ATTENDANCE
// ============================================================

function renderAttendanceDashboard(
    attendanceData
) {

    const container =
        document.getElementById(
            "attendanceDashboard"
        );

    if (!container) {
        return;
    }

    if (
        !attendanceData ||
        attendanceData.length === 0
    ) {

        container.innerHTML = `
            <div class="empty">
                No attendance records for today's classes.
            </div>
        `;

        return;
    }

    let html = "";

    attendanceData.forEach(
        item => {

            const slot =
                item.slot;

            const serviceName =
                slot.services?.name ||
                "Yoga Class";

            const mode =
                String(
                    slot.mode ||
                    "offline"
                ).toLowerCase();

            const total =
                item.total;

            const capacity =
                Number(
                    slot.capacity ||
                    0
                );

            html += `

                <div
                    class="attendance-card"
                    style="
                        border:1px solid #e5e0d5;
                        border-radius:12px;
                        padding:20px;
                        margin-bottom:15px;
                        background:#fff;
                    "
                >

                    <div
                        style="
                            display:flex;
                            justify-content:space-between;
                            align-items:flex-start;
                            gap:15px;
                            flex-wrap:wrap;
                        "
                    >

                        <div>

                            <h3
                                style="
                                    margin:0 0 7px;
                                    font-family:Georgia,serif;
                                    font-weight:500;
                                    color:#71663a;
                                "
                            >
                                ${escapeHtml(
                                    serviceName
                                )}
                            </h3>

                            <div
                                style="
                                    color:#666;
                                    font-size:13px;
                                "
                            >
                                ${formatTime(
                                    slot.start_time
                                )}
                                -
                                ${formatTime(
                                    slot.end_time
                                )}
                                ·
                                ${
                                    mode ===
                                    "online"
                                        ? "Online"
                                        : "Offline"
                                }
                            </div>

                        </div>

                        <div
                            style="
                                font-size:13px;
                                color:#777;
                            "
                        >
                            Booked:
                            <strong>
                                ${total}
                            </strong>
                            /
                            ${capacity}
                        </div>

                    </div>


                    <div
                        style="
                            display:grid;
                            grid-template-columns:
                                repeat(
                                    3,
                                    minmax(
                                        0,
                                        1fr
                                    )
                                );
                            gap:10px;
                            margin-top:18px;
                        "
                    >

                        <div
                            style="
                                padding:12px;
                                border-radius:9px;
                                background:#edf7ef;
                            "
                        >

                            <div
                                style="
                                    font-size:11px;
                                    color:#777;
                                "
                            >
                                PRESENT
                            </div>

                            <strong
                                style="
                                    font-size:22px;
                                "
                            >
                                ${item.present}
                            </strong>

                        </div>


                        <div
                            style="
                                padding:12px;
                                border-radius:9px;
                                background:#f9eaea;
                            "
                        >

                            <div
                                style="
                                    font-size:11px;
                                    color:#777;
                                "
                            >
                                ABSENT
                            </div>

                            <strong
                                style="
                                    font-size:22px;
                                "
                            >
                                ${item.absent}
                            </strong>

                        </div>


                        <div
                            style="
                                padding:12px;
                                border-radius:9px;
                                background:#fff7df;
                            "
                        >

                            <div
                                style="
                                    font-size:11px;
                                    color:#777;
                                "
                            >
                                PENDING
                            </div>

                            <strong
                                style="
                                    font-size:22px;
                                "
                            >
                                ${item.pending}
                            </strong>

                        </div>

                    </div>


                    <div
                        style="
                            margin-top:16px;
                        "
                    >

                        <button
                            type="button"
                            class="attendance-view-btn"
                            data-slot-id="${slot.id}"
                            style="
                                border:0;
                                background:#71663a;
                                color:white;
                                padding:10px 16px;
                                border-radius:8px;
                                cursor:pointer;
                            "
                        >
                            View Members
                        </button>

                    </div>

                </div>

            `;

        }
    );

    container.innerHTML =
        html;

    // --------------------------------------------------------
    // VIEW MEMBER BUTTONS
    // --------------------------------------------------------

    container
        .querySelectorAll(
            ".attendance-view-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const slotId =
                            button.dataset.slotId;

                        window.location.href =
                            `admin-slots.html?slot=${encodeURIComponent(
                                slotId
                            )}`;

                    }
                );

            }
        );

}

// ============================================================
// RECENT BOOKINGS
// ============================================================

async function loadRecentBookings() {

    const loading =
        document.getElementById(
            "bookingsLoading"
        );

    const tableWrapper =
        document.getElementById(
            "bookingsTableWrapper"
        );

    const tbody =
        document.getElementById(
            "recentBookings"
        );

    const errorElement =
        document.getElementById(
            "bookingsError"
        );

    try {

        const {
            data: bookings,
            error
        } =
            await db
                .from("bookings")
                .select(
                    `
                    id,
                    customer_id,
                    class_slot_id,
                    booking_status,
                    payment_status,
                    amount,
                    created_at
                    `
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                )
                .limit(5);

        if (error) {
            throw error;
        }

        if (loading) {
            loading.style.display =
                "none";
        }

        if (tableWrapper) {
            tableWrapper.style.display =
                "block";
        }

        if (!tbody) {
            return;
        }

        tbody.innerHTML =
            "";

        if (
            !bookings ||
            bookings.length === 0
        ) {

            tbody.innerHTML = `

                <tr>

                    <td
                        colspan="6"
                        class="empty"
                    >
                        No bookings yet.
                    </td>

                </tr>

            `;

            return;
        }

        // ----------------------------------------------------
        // CUSTOMER IDS
        // ----------------------------------------------------

        const customerIds =
            [
                ...new Set(
                    bookings
                        .map(
                            booking =>
                                booking.customer_id
                        )
                        .filter(Boolean)
                )
            ];

        let customers = [];

        if (
            customerIds.length > 0
        ) {

            const {
                data,
                error:
                    customerError
            } =
                await db
                    .from("customers")
                    .select(
                        "id,full_name"
                    )
                    .in(
                        "id",
                        customerIds
                    );

            if (!customerError) {

                customers =
                    data || [];

            }

        }

        // ----------------------------------------------------
        // CUSTOMER MAP
        // ----------------------------------------------------

        const customerMap =
            new Map();

        customers.forEach(
            customer => {

                customerMap.set(
                    customer.id,
                    customer.full_name
                );

            }
        );

        // ----------------------------------------------------
        // CREATE ROWS
        // ----------------------------------------------------

        bookings.forEach(
            booking => {

                const customerName =
                    customerMap.get(
                        booking.customer_id
                    ) ||
                    "Customer";

                const bookingStatus =
                    booking.booking_status ||
                    "pending";

                const paymentStatus =
                    booking.payment_status ||
                    "pending";

                const statusClass =
                    getStatusClass(
                        bookingStatus
                    );

                const date =
                    new Date(
                        booking.created_at
                    );

                const dateText =
                    date.toLocaleDateString(
                        "en-IN",
                        {
                            timeZone:
                                INDIA_TIMEZONE
                        }
                    );

                const row =
                    document.createElement(
                        "tr"
                    );

                row.innerHTML = `

                    <td>
                        #${booking.id}
                    </td>

                    <td>
                        ${escapeHtml(
                            customerName
                        )}
                    </td>

                    <td>

                        <span
                            class="status ${statusClass}"
                        >
                            ${escapeHtml(
                                bookingStatus
                            )}
                        </span>

                    </td>

                    <td>
                        ${escapeHtml(
                            paymentStatus
                        )}
                    </td>

                    <td>
                        ₹${Number(
                            booking.amount ||
                            0
                        ).toFixed(2)}
                    </td>

                    <td>
                        ${dateText}
                    </td>

                `;

                tbody.appendChild(
                    row
                );

            }
        );

    }

    catch (error) {

        console.error(
            "Recent bookings error:",
            error
        );

        if (loading) {
            loading.style.display =
                "none";
        }

        if (tableWrapper) {
            tableWrapper.style.display =
                "none";
        }

        if (errorElement) {

            errorElement.style.display =
                "block";

            errorElement.innerText =
                "Unable to load recent bookings.";

        }

    }

}

// ============================================================
// STATUS CLASS
// ============================================================

function getStatusClass(
    status
) {

    const value =
        String(
            status
        )
            .toLowerCase();

    if (
        value ===
        "confirmed"
    ) {

        return "status-confirmed";

    }

    if (
        value ===
        "cancelled"
    ) {

        return "status-cancelled";

    }

    return "status-pending";

}

// ============================================================
// TODAY INDIA
// ============================================================

function getTodayIndia() {

    const parts =
        new Intl.DateTimeFormat(
            "en-CA",
            {
                timeZone:
                    INDIA_TIMEZONE,

                year:
                    "numeric",

                month:
                    "2-digit",

                day:
                    "2-digit"
            }
        )
            .formatToParts(
                new Date()
            );

    const year =
        parts.find(
            part =>
                part.type ===
                "year"
        )?.value;

    const month =
        parts.find(
            part =>
                part.type ===
                "month"
        )?.value;

    const day =
        parts.find(
            part =>
                part.type ===
                "day"
        )?.value;

    return `${year}-${month}-${day}`;

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
                    INDIA_TIMEZONE,

                year:
                    "numeric",

                month:
                    "2-digit",

                day:
                    "2-digit"
            }
        )
            .formatToParts(
                date
            );

    const year =
        parts.find(
            part =>
                part.type ===
                "year"
        )?.value;

    const month =
        parts.find(
            part =>
                part.type ===
                "month"
        )?.value;

    const day =
        parts.find(
            part =>
                part.type ===
                "day"
        )?.value;

    return `${year}-${month}-${day}`;

}

// ============================================================
// FORMAT TIME
// ============================================================

function formatTime(
    value
) {

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
                INDIA_TIMEZONE,

            hour:
                "2-digit",

            minute:
                "2-digit",

            hour12:
                true
        }
    )
        .format(
            date
        );

}

// ============================================================
// HTML ESCAPE
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
// LOGOUT
// ============================================================

async function logoutAdmin() {

    try {

        await db
            .auth
            .signOut();

    }

    catch (error) {

        console.error(
            "Logout error:",
            error
        );

    }

    window.location.href =
        "admin-login.html";

}