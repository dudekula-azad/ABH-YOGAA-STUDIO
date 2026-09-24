// ============================================================
// ABH YOGAA STUDIO
// ADMIN BOOKINGS MANAGEMENT
// ============================================================

let allBookings = [];
let allMemberships = [];


// ============================================================
// PAGE LOAD
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log(
            "Admin Bookings JavaScript loaded."
        );

        // ====================================================
        // CHECK ADMIN SESSION
        // ====================================================

        if (!window.supabaseClient) {

            console.error(
                "Supabase client is not available."
            );

            window.location.replace(
                "admin-login.html"
            );

            return;
        }

        try {

            const {
                data: {
                    user
                },
                error: userError
            } =
                await window.supabaseClient
                    .auth
                    .getUser();


            // ------------------------------------------------
            // NO LOGIN
            // ------------------------------------------------

            if (
                userError ||
                !user
            ) {

                console.log(
                    "No admin session found."
                );

                window.location.replace(
                    "admin-login.html"
                );

                return;
            }


            // ------------------------------------------------
            // CHECK ADMIN AUTHORIZATION
            // ------------------------------------------------

            const {
                data: isAdmin,
                error: adminError
            } =
                await window.supabaseClient
                    .rpc("is_admin");


            if (
                adminError ||
                isAdmin !== true
            ) {

                console.error(
                    "Admin authorization failed:",
                    adminError
                );

                await window.supabaseClient
                    .auth
                    .signOut();

                window.location.replace(
                    "admin-login.html"
                );

                return;
            }


            // ------------------------------------------------
            // ADMIN VERIFIED
            // ------------------------------------------------

            console.log(
                "Admin session verified:",
                user.email
            );


            // ------------------------------------------------
            // LOAD PAGE
            // ------------------------------------------------

            await loadBookings();

            setupFilters();

        }

        catch (error) {

            console.error(
                "Admin session check failed:",
                error
            );

            window.location.replace(
                "admin-login.html"
            );

        }

    }
);


// ============================================================
// LOAD BOOKINGS
// ============================================================

// ============================================================
// LOAD BOOKINGS + MEMBERSHIPS
// ============================================================

async function loadBookings() {

    const loading =
        document.getElementById(
            "loadingMessage"
        );

    const errorBox =
        document.getElementById(
            "errorMessage"
        );

    try {

        if (!window.supabaseClient) {
            throw new Error(
                "Supabase client is not available."
            );
        }


        loading.style.display =
            "block";

        errorBox.style.display =
            "none";


        // ====================================================
        // LOAD NORMAL BOOKINGS
        // ====================================================

        const {
            data: bookings,
            error: bookingError
        } =
            await window.supabaseClient
                .from("bookings")
                .select(`
                    id,
                    customer_id,
                    class_slot_id,
                    booking_status,
                    payment_status,
                    amount,
                    plan_id,
                    membership_id,
                    created_at,

                    customers (
                        full_name,
                        phone,
                        email
                    ),

                    class_slots (
                        start_time,
                        end_time,
                        capacity,

                        services (
                            name
                        )
                    ),

                    plans (
                        name
                    )
                `)
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (bookingError) {
            throw bookingError;
        }


        // ====================================================
        // LOAD MEMBERSHIPS
        // ====================================================

        const {
            data: memberships,
            error: membershipError
        } =
            await window.supabaseClient
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
                    payment_status,
                    amount,
                    created_at,

                    customers (
                        full_name,
                        phone,
                        email
                    ),

                    services (
                        name
                    ),

                    plans (
                        name
                    )
                `)
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (membershipError) {
            throw membershipError;
        }


        // ====================================================
        // NORMALIZE MEMBERSHIPS
        // ====================================================

        const membershipRows =
            (memberships || [])
                .map(
                    membership => {

                        return {

                            // Keep membership separate
                            record_type:
                                "membership",

                            id:
                                membership.id,

                            membership_id:
                                membership.id,

                            customer_id:
                                membership.customer_id,

                            class_slot_id:
                                null,

                            booking_status:
                                membership.status ===
                                "active"
                                    ? "active"
                                    : membership.status,

                            payment_status:
                                membership.payment_status ||
                                "paid",

                            amount:
                                Number(
                                    membership.amount || 0
                                ),

                            plan_id:
                                membership.plan_id,

                            created_at:
                                membership.created_at,

                            customers:
                                membership.customers,

                            services:
                                membership.services,

                            plans:
                                membership.plans,

                            start_date:
                                membership.start_date,

                            end_date:
                                membership.end_date,

                            booking_mode:
                                membership.booking_mode
                        };

                    }
                );


        // ====================================================
        // MARK NORMAL BOOKINGS
        // ====================================================

        const bookingRows =
            (bookings || [])
                .map(
                    booking => {

                        return {

                            ...booking,

                            record_type:
                                "booking"
                        };

                    }
                );


        // ====================================================
        // COMBINE
        // ====================================================

        allMemberships =
            membershipRows;

        allBookings =
            [
                ...bookingRows,
                ...membershipRows
            ];


        // ====================================================
        // SORT NEWEST FIRST
        // ====================================================

        allBookings.sort(
            (
                a,
                b
            ) => {

                const dateA =
                    new Date(
                        a.created_at || 0
                    ).getTime();

                const dateB =
                    new Date(
                        b.created_at || 0
                    ).getTime();

                return dateB - dateA;
            }
        );


        console.log(
            "Normal bookings:",
            bookingRows
        );

        console.log(
            "Memberships:",
            membershipRows
        );

        console.log(
            "Admin records:",
            allBookings
        );


        renderBookings(
            allBookings
        );

    }

    catch (error) {

        console.error(
            "Failed to load bookings/memberships:",
            error
        );

        errorBox.innerText =
            error.message ||
            "Unable to load bookings.";

        errorBox.style.display =
            "block";
    }

    finally {

        loading.style.display =
            "none";
    }
}


// ============================================================
// RENDER BOOKINGS
// ============================================================

function renderBookings(
    bookings
) {

    const tbody =
        document.getElementById(
            "bookingsBody"
        );

    const noBookings =
        document.getElementById(
            "noBookings"
        );


    tbody.innerHTML =
        "";


    if (
        !bookings ||
        bookings.length === 0
    ) {

        noBookings.style.display =
            "block";

        return;

    }


    noBookings.style.display =
        "none";


    bookings.forEach(
        booking => {

            const row =
                document.createElement(
                    "tr"
                );


            const customer =
                booking.customers;


            const slot =
                booking.class_slots;
            const isMembership =
                booking.record_type ===
                "membership";


            const customerName =
                customer?.full_name ||
                "Unknown";


            const phone =
                customer?.phone ||
                "—";


            const email =
                customer?.email ||
                "—";


            let serviceName =
                "—";

            let classDate =
                "—";

            let classTime =
                "—";


            // =========================================================
            // MEMBERSHIP RECORD
            // =========================================================

            if (isMembership) {

                serviceName =
                    booking.services?.name ||
                    "—";


                if (
                    booking.start_date &&
                    booking.end_date
                ) {

                    const start =
                        new Date(
                            booking.start_date
                        );

                    const end =
                        new Date(
                            booking.end_date
                        );

                    classDate =
                        start.toLocaleDateString(
                            "en-IN",
                            {
                                day:
                                    "2-digit",

                                month:
                                    "short",

                                year:
                                    "numeric"
                            }
                        ) +
                        " – " +
                        end.toLocaleDateString(
                            "en-IN",
                            {
                                day:
                                    "2-digit",

                                month:
                                    "short",

                                year:
                                    "numeric"
                            }
                        );
                }


                classTime =
                    "Membership • " +
                    (
                        booking.booking_mode ===
                        "online"
                            ? "Online"
                            : "Offline"
                    );
            }


            // =========================================================
            // NORMAL CLASS BOOKING
            // =========================================================

            else if (slot) {

                serviceName =
                    slot.services?.name ||
                    "—";


                if (slot.start_time) {

                    const start =
                        new Date(
                            slot.start_time
                        );

                    classDate =
                        start.toLocaleDateString(
                            "en-IN",
                            {
                                day:
                                    "2-digit",

                                month:
                                    "short",

                                year:
                                    "numeric"
                            }
                        );


                    classTime =
                        formatTime(
                            slot.start_time
                        );
                }


                if (slot.end_time) {

                    classTime +=
                        " – " +
                        formatTime(
                            slot.end_time
                        );
                }
            }

            if (slot) {

                serviceName =
                    slot.services?.name ||
                    "—";


                if (slot.start_time) {

                    const start =
                        new Date(
                            slot.start_time
                        );


                    classDate =
                        start.toLocaleDateString(
                            "en-IN",
                            {
                                day:
                                    "2-digit",

                                month:
                                    "short",

                                year:
                                    "numeric"
                            }
                        );


                    classTime =
                        formatTime(
                            slot.start_time
                        );

                }


                if (slot.end_time) {

                    classTime +=
                        " – " +
                        formatTime(
                            slot.end_time
                        );

                }

            }


            const planName =
                booking.plans?.name ||
                "One Day / Unknown";


            const amount =
                Number(
                    booking.amount || 0
                );


            const createdDate =
                booking.created_at
                    ? new Date(
                        booking.created_at
                    ).toLocaleDateString(
                        "en-IN",
                        {
                            day:
                                "2-digit",

                            month:
                                "short",

                            year:
                                "numeric"
                        }
                    )
                    : "—";


            // =================================================
            // ACTIONS
            // =================================================

            // =========================================================
            // ACTIONS
            // =========================================================

            let actionsHTML = "";


            // =========================================================
            // MEMBERSHIP
            // =========================================================

            if (isMembership) {

                // MEMBERSHIP STATUS
                if (booking.booking_status === "active") {

                    actionsHTML += `
                        <button
                            type="button"
                            class="booking-action cancel-membership"
                            data-id="${booking.membership_id}"
                        >
                            Cancel
                        </button>
                    `;

                }
                else if (booking.booking_status === "cancelled") {

                    actionsHTML += `
                        <button
                            type="button"
                            class="booking-action activate-membership"
                            data-id="${booking.membership_id}"
                        >
                            Activate
                        </button>
                    `;

                }


                // PAYMENT STATUS
                if (booking.payment_status === "paid") {

                    actionsHTML += `
                        <button
                            type="button"
                            class="booking-action pending-membership"
                            data-id="${booking.membership_id}"
                        >
                            Mark Pending
                        </button>
                    `;

                }
                else {

                    actionsHTML += `
                        <button
                            type="button"
                            class="booking-action paid-membership"
                            data-id="${booking.membership_id}"
                        >
                            Mark Paid
                        </button>
                    `;

                }

            }


            // =========================================================
            // NORMAL BOOKING
            // =========================================================

            else {

                if (
                    booking.booking_status ===
                    "confirmed"
                ) {

                    actionsHTML += `
                        <button
                            type="button"
                            class="booking-action cancel-booking"
                            data-id="${booking.id}"
                        >
                            Cancel
                        </button>
                    `;
                }

                else if (
                    booking.booking_status ===
                    "pending"
                ) {

                    actionsHTML += `
                        <button
                            type="button"
                            class="booking-action confirm-booking"
                            data-id="${booking.id}"
                        >
                            Confirm
                        </button>

                        <button
                            type="button"
                            class="booking-action cancel-booking"
                            data-id="${booking.id}"
                        >
                            Cancel
                        </button>
                    `;
                }

                else {

                    actionsHTML += `
                        <button
                            type="button"
                            class="booking-action confirm-booking"
                            data-id="${booking.id}"
                        >
                            Re-confirm
                        </button>
                    `;
                }


                // =====================================================
                // PAYMENT
                // =====================================================

                if (
                    booking.payment_status !==
                    "paid"
                ) {

                    actionsHTML += `
                        <button
                            type="button"
                            class="booking-action paid-payment"
                            data-id="${booking.id}"
                        >
                            Mark Paid
                        </button>
                    `;
                }


                if (
                    booking.payment_status ===
                    "paid"
                ) {

                    actionsHTML += `
                        <button
                            type="button"
                            class="booking-action pending-payment"
                            data-id="${booking.id}"
                        >
                            Mark Pending
                        </button>
                    `;
                }
            }
            row.innerHTML = `

                <td>
                    #${booking.id}
                </td>


                <td>

                    <strong>
                        ${escapeHtml(
                            customerName
                        )}
                    </strong>

                </td>


                <td>

                    <div>
                        ${escapeHtml(phone)}
                    </div>

                    <small>
                        ${escapeHtml(email)}
                    </small>

                </td>


                <td>
                    ${escapeHtml(
                        serviceName
                    )}
                </td>


                <td>
                    ${classDate}
                </td>


                <td>
                    ${classTime}
                </td>


                <td>
                    ${escapeHtml(
                        planName
                    )}
                </td>


                <td>

<span
    class="status-badge booking-${booking.booking_status}"
>
    ${escapeHtml(
        isMembership
            ? (
                booking.booking_status === "cancelled"
                    ? "Cancelled"
                    : booking.booking_status === "expired"
                        ? "Expired"
                        : "Active"
            )
            : booking.booking_status
    )}
</span>

                </td>


                <td>

                    <span
                        class="status-badge payment-${booking.payment_status}"
                    >
                        ${escapeHtml(
                            booking.payment_status
                        )}
                    </span>

                </td>


                <td>
                    ₹${amount.toFixed(2)}
                </td>


                <td>
                    ${createdDate}
                </td>


                <td>

                    <div class="booking-actions">

                        ${actionsHTML}

                    </div>

                </td>

            `;


            tbody.appendChild(
                row
            );

        }
    );


    setupBookingActions();

}


// ============================================================
// FORMAT TIME
// ============================================================

function formatTime(
    timestamp
) {

    return new Date(
        timestamp
    ).toLocaleTimeString(
        "en-IN",
        {
            hour:
                "2-digit",

            minute:
                "2-digit"
        }
    );

}


// ============================================================
// BOOKING ACTIONS
// ============================================================

    // ========================================================
    // MEMBERSHIP ACTIONS
    // ========================================================

    document
        .querySelectorAll(
            ".cancel-membership"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const confirmed =
                            confirm(
                                "Are you sure you want to cancel this membership?"
                            );

                        if (!confirmed) {
                            return;
                        }

                        updateMembership(
                            button.dataset.id,
                            "cancelled",
                            null
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            ".activate-membership"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        updateMembership(
                            button.dataset.id,
                            "active",
                            null
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            ".paid-membership"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        updateMembership(
                            button.dataset.id,
                            null,
                            "paid"
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            ".pending-membership"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        updateMembership(
                            button.dataset.id,
                            null,
                            "pending"
                        );

                    }
                );

            }
        );


// ============================================================
// UPDATE BOOKING
// ============================================================

async function updateBooking(
    bookingId,
    bookingStatus,
    paymentStatus
) {

    try {

        console.log(
            "Updating booking:",
            {
                bookingId,
                bookingStatus,
                paymentStatus
            }
        );


        const {
            data,
            error
        } =
            await window.supabaseClient

                .rpc(
                    "admin_update_booking",
                    {
                        p_booking_id:
                            Number(
                                bookingId
                            ),

                        p_booking_status:
                            bookingStatus,

                        p_payment_status:
                            paymentStatus
                    }
                );


        if (error) {

            console.error(
                "Booking update error:",
                error
            );


            alert(
                error.message ||
                "Could not update booking."
            );


            return;

        }


        console.log(
            "Booking updated:",
            data
        );


        alert(
            "Booking updated successfully."
        );


        await loadBookings();

    }

    catch (error) {

        console.error(
            "Unexpected update error:",
            error
        );


        alert(
            "Something went wrong while updating the booking."
        );

    }

}
// ============================================================
// UPDATE MEMBERSHIP
// ============================================================

async function updateMembership(
    membershipId,
    membershipStatus,
    paymentStatus
) {

    try {

        console.log(
            "Updating membership:",
            {
                membershipId,
                membershipStatus,
                paymentStatus
            }
        );


        const {
            data,
            error
        } =
            await window.supabaseClient
                .rpc(
                    "admin_update_membership",
                    {
                        p_membership_id:
                            Number(
                                membershipId
                            ),

                        p_membership_status:
                            membershipStatus,

                        p_payment_status:
                            paymentStatus
                    }
                );


        if (error) {

            console.error(
                "Membership update error:",
                error
            );

            alert(
                error.message ||
                "Could not update membership."
            );

            return;
        }


        console.log(
            "Membership updated:",
            data
        );


        alert(
            "Membership updated successfully."
        );


        await loadBookings();

    }

    catch (error) {

        console.error(
            "Unexpected membership update error:",
            error
        );

        alert(
            "Something went wrong while updating the membership."
        );
    }
}

// ============================================================
// FILTERS
// ============================================================

function setupFilters() {

    const statusFilter =
        document.getElementById(
            "statusFilter"
        );


    const paymentFilter =
        document.getElementById(
            "paymentFilter"
        );


    const searchInput =
        document.getElementById(
            "searchBooking"
        );


    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            applyFilters
        );

    }


    if (paymentFilter) {

        paymentFilter.addEventListener(
            "change",
            applyFilters
        );

    }


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            applyFilters
        );

    }

}


// ============================================================
// APPLY FILTERS
// ============================================================

function applyFilters() {

    const status =
        document.getElementById(
            "statusFilter"
        ).value;


    const payment =
        document.getElementById(
            "paymentFilter"
        ).value;


    const search =
        document.getElementById(
            "searchBooking"
        ).value
            .toLowerCase()
            .trim();


    const filtered =
        allBookings.filter(
            booking => {

                if (
                    status !== "all" &&
                    booking.booking_status !==
                        status
                ) {

                    return false;

                }


                if (
                    payment !== "all" &&
                    booking.payment_status !==
                        payment
                ) {

                    return false;

                }


                if (search) {

                    const customer =
                        booking.customers;


                    const searchable =
                        (
                            customer?.full_name ||
                            ""
                        ) +
                        " " +
                        (
                            customer?.phone ||
                            ""
                        ) +
                        " " +
                        (
                            customer?.email ||
                            ""
                        );


                    if (
                        !searchable
                            .toLowerCase()
                            .includes(search)
                    ) {

                        return false;

                    }

                }


                return true;

            }
        );


    renderBookings(
        filtered
    );

}


// ============================================================
// HTML ESCAPE
// ============================================================

function escapeHtml(
    value
) {

    return String(
        value
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
// ADMIN BOOKING + MEMBERSHIP ACTIONS
// ============================================================

function setupBookingActions() {

    // --------------------------------------------------------
    // ONE DAY - CONFIRM
    // --------------------------------------------------------

    document
        .querySelectorAll(".confirm-booking")
        .forEach(button => {

            button.onclick = () => {

                updateBooking(
                    button.dataset.id,
                    "confirmed",
                    null
                );

            };

        });


    // --------------------------------------------------------
    // ONE DAY - CANCEL
    // --------------------------------------------------------

    document
        .querySelectorAll(".cancel-booking")
        .forEach(button => {

            button.onclick = () => {

                if (
                    !confirm(
                        "Are you sure you want to cancel this booking?"
                    )
                ) {
                    return;
                }

                updateBooking(
                    button.dataset.id,
                    "cancelled",
                    null
                );

            };

        });


    // --------------------------------------------------------
    // ONE DAY - MARK PAID
    // --------------------------------------------------------

    document
        .querySelectorAll(".paid-payment")
        .forEach(button => {

            button.onclick = () => {

                updateBooking(
                    button.dataset.id,
                    null,
                    "paid"
                );

            };

        });


    // --------------------------------------------------------
    // ONE DAY - MARK PENDING
    // --------------------------------------------------------

    document
        .querySelectorAll(".pending-payment")
        .forEach(button => {

            button.onclick = () => {

                updateBooking(
                    button.dataset.id,
                    null,
                    "pending"
                );

            };

        });


    // ========================================================
    // MEMBERSHIPS
    // ========================================================

    // --------------------------------------------------------
    // MEMBERSHIP - CANCEL
    // --------------------------------------------------------

    document
        .querySelectorAll(".cancel-membership")
        .forEach(button => {

            button.onclick = () => {

                if (
                    !confirm(
                        "Are you sure you want to cancel this membership?"
                    )
                ) {
                    return;
                }

                updateMembership(
                    button.dataset.id,
                    "cancelled",
                    null
                );

            };

        });


    // --------------------------------------------------------
    // MEMBERSHIP - ACTIVATE
    // --------------------------------------------------------

    document
        .querySelectorAll(".activate-membership")
        .forEach(button => {

            button.onclick = () => {

                updateMembership(
                    button.dataset.id,
                    "active",
                    null
                );

            };

        });


    // --------------------------------------------------------
    // MEMBERSHIP - MARK PAID
    // --------------------------------------------------------

    document
        .querySelectorAll(".paid-membership")
        .forEach(button => {

            button.onclick = () => {

                updateMembership(
                    button.dataset.id,
                    null,
                    "paid"
                );

            };

        });


    // --------------------------------------------------------
    // MEMBERSHIP - MARK PENDING
    // --------------------------------------------------------

    document
        .querySelectorAll(".pending-membership")
        .forEach(button => {

            button.onclick = () => {

                updateMembership(
                    button.dataset.id,
                    null,
                    "pending"
                );

            };

        });

}


// ============================================================
// UPDATE MEMBERSHIP
// ============================================================

async function updateMembership(
    membershipId,
    membershipStatus,
    paymentStatus
) {

    try {

        console.log(
            "Updating membership:",
            {
                membershipId,
                membershipStatus,
                paymentStatus
            }
        );


        const {
            data,
            error
        } =
            await window.supabaseClient
                .rpc(
                    "admin_update_membership",
                    {
                        p_membership_id:
                            Number(
                                membershipId
                            ),

                        p_membership_status:
                            membershipStatus,

                        p_payment_status:
                            paymentStatus
                    }
                );


        if (error) {

            console.error(
                "Membership update error:",
                error
            );

            alert(
                error.message ||
                "Could not update membership."
            );

            return;
        }


        console.log(
            "Membership updated:",
            data
        );


        alert(
            "Membership updated successfully."
        );


        await loadBookings();

    }

    catch (error) {

        console.error(
            "Unexpected membership update error:",
            error
        );

        alert(
            error.message ||
            "Something went wrong while updating membership."
        );

    }

}