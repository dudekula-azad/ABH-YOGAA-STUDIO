// ============================================================
// ABH YOGAA STUDIO
// MAIN JAVASCRIPT
// ============================================================


// ============================================================
// GLOBAL BOOKING STATE
// ============================================================

let selectedSlotId = null;

let paymentProcessing = false;

let completedBookingId = null;

let completedMembershipId = null;


// ============================================================
// HERO ZOOM EFFECT
// ============================================================

const hero =
    document.querySelector(".hero");

if (hero) {

    window.addEventListener(
        "scroll",
        () => {

            const scroll =
                window.scrollY;

            hero.style.backgroundSize =
                `${100 + scroll * 0.03}%`;

        }
    );

}


// ============================================================
// BOOKING SYSTEM
// ============================================================

const bookingForm =
    document.getElementById(
        "bookingForm"
    );


if (bookingForm) {

    // ========================================================
    // REMOVE OLD BATCH FIELD
    // ========================================================

    const oldBatchField =
        document.getElementById(
            "batch"
        );

    if (oldBatchField) {

        const oldBatchGroup =
            oldBatchField.closest(
                ".input-group"
            );

        if (oldBatchGroup) {

            oldBatchGroup.remove();

        }

    }


    // ========================================================
    // GET PLAN FIELD
    // ========================================================

    let planSelect =
        document.getElementById(
            "plan"
        );


    // ========================================================
    // CREATE PLAN FIELD IF MISSING
    // ========================================================

    function createPlanField() {

        const existingPlan =
            document.getElementById(
                "plan"
            );

        if (existingPlan) {

            return existingPlan;

        }


        const oldBatch =
            document.getElementById(
                "batch"
            );

        if (!oldBatch) {

            console.error(
                "Plan field and old batch field are both missing."
            );

            return null;

        }


        const oldGroup =
            oldBatch.closest(
                ".input-group"
            );

        if (!oldGroup) {

            console.error(
                "Could not find old batch group."
            );

            return null;

        }


        oldGroup.outerHTML = `

            <div
                class="input-group"
                id="planGroup"
            >

                <label for="plan">
                    Choose Plan
                </label>

                <select id="plan">

                    <option value="">
                        Select Plan
                    </option>

                    <option value="one_day">
                        One Day
                    </option>

                    <option value="one_month">
                        One Month
                    </option>

                    <option value="three_months">
                        Three Months
                    </option>

                </select>

            </div>

        `;


        return document.getElementById(
            "plan"
        );

    }


    // ========================================================
    // MAKE SURE PLAN EXISTS
    // ========================================================

    if (!planSelect) {

        planSelect =
            createPlanField();

    }


    if (!planSelect) {

        console.error(
            "Booking system stopped: plan field not found."
        );

    }

    else {

        // ====================================================
        // GET BASIC ELEMENTS
        // ====================================================

        const planGroup =
            document.getElementById(
                "planGroup"
            );


        let oneDayDateGroup =
            document.getElementById(
                "oneDayDateGroup"
            );


        let startDateGroup =
            document.getElementById(
                "startDateGroup"
            );


        let endDateGroup =
            document.getElementById(
                "endDateGroup"
            );


        let oneDayDate =
            document.getElementById(
                "oneDayDate"
            );


        let startDate =
            document.getElementById(
                "startDate"
            );


        let endDate =
            document.getElementById(
                "endDate"
            );


        // ====================================================
        // CREATE DATE FIELDS IF MISSING
        // ====================================================

        function createMissingField(
            id,
            html,
            beforeId
        ) {

            if (
                document.getElementById(id)
            ) {

                return;

            }


            const target =
                document.getElementById(
                    beforeId
                );

            if (target) {

                target.insertAdjacentHTML(
                    "beforebegin",
                    html
                );

            }

        }


        createMissingField(

            "oneDayDateGroup",

            `

                <div
                    class="input-group"
                    id="oneDayDateGroup"
                    style="display:none;"
                >

                    <label for="oneDayDate">
                        Choose Class Date
                    </label>

                    <select id="oneDayDate">

                        <option value="">
                            Select Date
                        </option>

                        <option value="today">
                            Today
                        </option>

                        <option value="tomorrow">
                            Tomorrow
                        </option>

                    </select>

                </div>

            `,

            "planGroup"

        );


        createMissingField(

            "startDateGroup",

            `

                <div
                    class="input-group"
                    id="startDateGroup"
                    style="display:none;"
                >

                    <label for="startDate">
                        Start Date
                    </label>

                    <input
                        type="date"
                        id="startDate"
                    >

                </div>

            `,

            "planGroup"

        );


        createMissingField(

            "endDateGroup",

            `

                <div
                    class="input-group"
                    id="endDateGroup"
                    style="display:none;"
                >

                    <label for="endDate">
                        End Date
                    </label>

                    <input
                        type="date"
                        id="endDate"
                        readonly
                    >

                </div>

            `,

            "planGroup"

        );


        // ====================================================
        // GET ELEMENTS AGAIN
        // ====================================================

        oneDayDateGroup =
            document.getElementById(
                "oneDayDateGroup"
            );


        startDateGroup =
            document.getElementById(
                "startDateGroup"
            );


        endDateGroup =
            document.getElementById(
                "endDateGroup"
            );


        oneDayDate =
            document.getElementById(
                "oneDayDate"
            );


        startDate =
            document.getElementById(
                "startDate"
            );


        endDate =
            document.getElementById(
                "endDate"
            );


        // ====================================================
        // AVAILABLE SLOT AREA
        // ====================================================

        let availableSlotsGroup =
            document.getElementById(
                "availableSlotsGroup"
            );


        let availableSlots =
            document.getElementById(
                "availableSlots"
            );


        if (
            !availableSlotsGroup &&
            oneDayDateGroup
        ) {

            oneDayDateGroup.insertAdjacentHTML(

                "afterend",

                `

                    <div
                        class="input-group"
                        id="availableSlotsGroup"
                        style="display:none;"
                    >

                        <label>
                            Available Class Slots
                        </label>

                        <div
                            id="availableSlots"
                        ></div>

                    </div>

                `

            );

        }


        availableSlotsGroup =
            document.getElementById(
                "availableSlotsGroup"
            );


        availableSlots =
            document.getElementById(
                "availableSlots"
            );


        // ====================================================
        // DATE HELPERS
        // ====================================================

        function formatDate(date) {

            const year =
                date.getFullYear();

            const month =
                String(
                    date.getMonth() + 1
                ).padStart(
                    2,
                    "0"
                );

            const day =
                String(
                    date.getDate()
                ).padStart(
                    2,
                    "0"
                );

            return (
                `${year}-${month}-${day}`
            );

        }


        function getToday() {

            return new Date();

        }


        function getTodayString() {

            return formatDate(
                getToday()
            );

        }


        function getTomorrowString() {

            const tomorrow =
                getToday();

            tomorrow.setDate(
                tomorrow.getDate() + 1
            );

            return formatDate(
                tomorrow
            );

        }


        // ====================================================
        // TODAY / TOMORROW
        // ====================================================

        const todayString =
            getTodayString();


        const tomorrowString =
            getTomorrowString();


        // ====================================================
        // START DATE MINIMUM
        // ====================================================

        if (startDate) {

            startDate.min =
                todayString;

        }


        // ====================================================
        // SERVICE SLUG
        // ====================================================

        function getCurrentServiceSlug() {

            const bookingSection =
                document.querySelector(
                    ".booking[data-service-slug]"
                );


            if (!bookingSection) {

                console.error(
                    "Booking section does not have data-service-slug."
                );

                return null;

            }


            const slug =
                bookingSection.dataset.serviceSlug;


            console.log(
                "Current service slug:",
                slug
            );


            return slug;

        }


        // ====================================================
        // GET CURRENT SERVICE
        // ====================================================

        async function getCurrentService() {

            if (
                !window.supabaseClient
            ) {

                console.error(
                    "Supabase client is not available."
                );

                return null;

            }


            const serviceSlug =
                getCurrentServiceSlug();


            if (!serviceSlug) {

                return null;

            }


            const {
                data,
                error
            } =
                await window.supabaseClient
                    .from("services")
                    .select(
                        "id,name,slug"
                    )
                    .eq(
                        "slug",
                        serviceSlug
                    )
                    .eq(
                        "is_active",
                        true
                    )
                    .maybeSingle();


            if (error) {

                console.error(
                    "Service query error:",
                    error
                );

                return null;

            }


            if (!data) {

                console.error(
                    "Service not found:",
                    serviceSlug
                );

                return null;

            }


            return data;

        }


        // ====================================================
        // GET BOOKING MODE
        // ====================================================

// ====================================================
// GET BOOKING MODE
// ====================================================

        function getBookingMode() {

            const modeElement =
                document.getElementById("mode");

            let mode =
                modeElement
                    ? modeElement.value
                    : "offline";

            mode =
                String(mode)
                    .toLowerCase()
                    .trim();

            // OFFLINE
            if (
                mode === "offline" ||
                mode === "offline (studio)" ||
                mode === "offline_studio" ||
                mode === "studio"
            ) {
                mode = "offline";
            }

            // ONLINE
            if (
                mode === "online" ||
                mode === "online (studio)" ||
                mode === "online (live classes)" ||
                mode === "online_live_classes" ||
                mode === "live classes" ||
                mode === "live"
            ) {
                mode = "online";
            }

            console.log(
                "BOOKING MODE:",
                mode
            );

            return mode;
        }


        // ====================================================
        // GET PLAN
        // ====================================================

        async function getSelectedPlan() {

            const slug =
                planSelect.value;


            if (!slug) {

                return null;

            }


            const {
                data,
                error
            } =
                await window.supabaseClient
                    .from("plans")
                    .select(
                        "id,name,slug"
                    )
                    .eq(
                        "slug",
                        slug
                    )
                    .eq(
                        "is_active",
                        true
                    )
                    .maybeSingle();


            if (error) {

                console.error(
                    "Plan query error:",
                    error
                );

                return null;

            }


            return data;

        }


        // ====================================================
        // GET PLAN NAME
        // ====================================================

        function getPlanName(
            plan
        ) {

            switch (plan) {

                case "one_day":

                    return "One Day";


                case "one_month":

                    return "One Month";


                case "three_months":

                    return "Three Months";


                default:

                    return "";

            }

        }


        // ====================================================
        // GET PLAN PRICE
        // ====================================================

        window.getPlanPrice =
            async function () {

                try {

                    if (
                        !window.supabaseClient
                    ) {

                        console.error(
                            "Supabase client is not available."
                        );

                        return null;

                    }


                    const service =
                        await getCurrentService();


                    if (!service) {

                        return null;

                    }


                    const plan =
                        await getSelectedPlan();


                    if (!plan) {

                        console.error(
                            "Selected plan not found."
                        );

                        return null;

                    }


                    const bookingMode =
                        getBookingMode();


                    console.log(
                        "PRICE LOOKUP:",
                        {
                            service_id:
                                service.id,

                            plan_id:
                                plan.id,

                            booking_mode:
                                bookingMode
                        }
                    );


                    const {
                        data,
                        error
                    } =
                        await window.supabaseClient
                            .from("plan_prices")
                            .select(`
                                id,
                                service_id,
                                plan_id,
                                booking_mode,
                                price
                            `)
                            .eq(
                                "service_id",
                                service.id
                            )
                            .eq(
                                "plan_id",
                                plan.id
                            )
                            .eq(
                                "booking_mode",
                                bookingMode
                            )
                            .eq(
                                "is_active",
                                true
                            )
                            .maybeSingle();


                    if (error) {

                        console.error(
                            "Price query error:",
                            error
                        );

                        return null;

                    }


                    if (!data) {

                        console.error(
                            "No price found.",
                            {
                                service_id:
                                    service.id,

                                plan_id:
                                    plan.id,

                                booking_mode:
                                    bookingMode
                            }
                        );

                        return null;

                    }


                    console.log(
                        "PRICE FOUND:",
                        data
                    );


                    return Number(
                        data.price
                    );

                }

                catch (error) {

                    console.error(
                        "Unexpected price error:",
                        error
                    );

                    return null;

                }

            };


        // ====================================================
        // GET UTC RANGE FOR LOCAL DATE
        // ====================================================

        function getUtcRangeForLocalDate(
            dateString
        ) {

            const localStart =
                new Date(
                    `${dateString}T00:00:00`
                );


            const localEnd =
                new Date(
                    `${dateString}T23:59:59.999`
                );


            return {

                start:
                    localStart.toISOString(),

                end:
                    localEnd.toISOString()

            };

        }


        // ====================================================
        // LOAD AVAILABLE SLOTS
        // ====================================================

        async function loadAvailableSlots() {

            selectedSlotId =
                null;


            if (
                !availableSlotsGroup ||
                !availableSlots
            ) {

                return;

            }


            if (
                !oneDayDate ||
                !oneDayDate.value
            ) {

                availableSlotsGroup.style.display =
                    "none";

                availableSlots.innerHTML =
                    "";

                return;

            }


            let selectedDate =
                "";


            if (
                oneDayDate.value ===
                "today"
            ) {

                selectedDate =
                    getTodayString();

            }


            else if (
                oneDayDate.value ===
                "tomorrow"
            ) {

                selectedDate =
                    getTomorrowString();

            }


            if (!selectedDate) {

                return;

            }


            availableSlotsGroup.style.display =
                "block";


            availableSlots.innerHTML = `

                <div class="slot-loading">
                    Loading available slots...
                </div>

            `;


            if (
                !window.supabaseClient
            ) {

                availableSlots.innerHTML = `

                    <div class="slot-error">
                        Unable to connect to the booking system.
                    </div>

                `;

                return;

            }


            const service =
                await getCurrentService();


            if (!service) {

                availableSlots.innerHTML = `

                    <div class="slot-error">
                        Service could not be identified.
                    </div>

                `;

                return;

            }


            const range =
                getUtcRangeForLocalDate(
                    selectedDate
                );


            console.log(
                "Loading availability:",
                {
                    serviceId:
                        service.id,

                    selectedDate:
                        selectedDate,

                    range:
                        range
                }
            );


            // =================================================
            // IMPORTANT:
            // READ FROM THE AVAILABILITY VIEW
            // =================================================

            const {
                data: slots,
                error
            } =
                await window.supabaseClient
                    .from(
                        "class_slot_availability"
                    )
                    .select(`
                        class_slot_id,
                        service_id,
                        batch_id,
                        start_time,
                        end_time,
                        capacity,
                        booked_seats,
                        available_seats,
                        is_full,
                        is_active
                    `)
                    .eq(
                        "service_id",
                        service.id
                    )
                    .eq(
                        "is_active",
                        true
                    )
                    .gt(
                        "available_seats",
                        0
                    )
                    .eq(
                        "is_full",
                        false
                    )
                    .gte(
                        "start_time",
                        range.start
                    )
                    .lte(
                        "start_time",
                        range.end
                    )
                    .order(
                        "start_time",
                        {
                            ascending:
                                true
                        }
                    );


            if (error) {

                console.error(
                    "Availability query error:",
                    error
                );


                availableSlots.innerHTML = `

                    <div class="slot-error">
                        Could not load available slots.
                    </div>

                `;


                return;

            }

            // =================================================
            // REMOVE EXPIRED TODAY'S SLOTS
            // =================================================

            if (selectedDate === getTodayString()) {

                const now = Date.now();

                const validSlots = (slots || []).filter(
                    slot =>
                        new Date(
                            slot.end_time
                        ).getTime() > now
                );

                slots.splice(
                    0,
                    slots.length,
                    ...validSlots
                );

            }
            console.log(
                "Available slots returned:",
                slots
            );


            if (
                !slots ||
                slots.length === 0
            ) {

                availableSlots.innerHTML = `

                    <div class="no-slots">
                        No class slots are available
                        for ${selectedDate}.
                    </div>

                `;


                return;

            }


            availableSlots.innerHTML =
                "";


            // =================================================
            // DISPLAY SLOTS
            // =================================================

            slots.forEach(
                slot => {

                    const start =
                        new Date(
                            slot.start_time
                        );


                    const end =
                        new Date(
                            slot.end_time
                        );


                    const startText =
                        start.toLocaleTimeString(
                            [],
                            {
                                hour:
                                    "2-digit",

                                minute:
                                    "2-digit"
                            }
                        );


                    const endText =
                        end.toLocaleTimeString(
                            [],
                            {
                                hour:
                                    "2-digit",

                                minute:
                                    "2-digit"
                            }
                        );


                    const slotCard =
                        document.createElement(
                            "div"
                        );


                    slotCard.className =
                        "available-slot-card";


                    slotCard.dataset.slotId =
                        slot.class_slot_id;


                    slotCard.innerHTML = `

                        <div class="slot-information">

                            <strong>
                                ${startText}
                                –
                                ${endText}
                            </strong>

                            <span>
                                ${Number(
                                    slot.available_seats
                                )}
                                seat${
                                    Number(
                                        slot.available_seats
                                    ) === 1
                                        ? ""
                                        : "s"
                                }
                                available
                            </span>

                        </div>

                        <button
                            type="button"
                            class="select-slot-btn"
                        >
                            Select
                        </button>

                    `;


                    const selectButton =
                        slotCard.querySelector(
                            ".select-slot-btn"
                        );


                    selectButton.addEventListener(
                        "click",
                        () => {

                            document
                                .querySelectorAll(
                                    ".available-slot-card"
                                )
                                .forEach(
                                    card => {

                                        card.classList.remove(
                                            "selected"
                                        );

                                    }
                                );


                            document
                                .querySelectorAll(
                                    ".select-slot-btn"
                                )
                                .forEach(
                                    button => {

                                        button.innerText =
                                            "Select";

                                    }
                                );


                            slotCard.classList.add(
                                "selected"
                            );


                            selectButton.innerText =
                                "Selected ✓";


                            selectedSlotId =
                                Number(
                                    slot.class_slot_id
                                );


                            console.log(
                                "Selected slot:",
                                selectedSlotId
                            );

                        }
                    );


                    availableSlots.appendChild(
                        slotCard
                    );

                }
            );

        }


        // ====================================================
        // UPDATE PLAN UI
        // ====================================================

        function updatePlanUI() {

            const plan =
                planSelect.value;


            if (oneDayDateGroup) {

                oneDayDateGroup.style.display =
                    "none";

            }


            if (startDateGroup) {

                startDateGroup.style.display =
                    "none";

            }


            if (endDateGroup) {

                endDateGroup.style.display =
                    "none";

            }


            if (availableSlotsGroup) {

                availableSlotsGroup.style.display =
                    "none";

            }


            if (availableSlots) {

                availableSlots.innerHTML =
                    "";

            }


            selectedSlotId =
                null;


            // =================================================
            // ONE DAY
            // =================================================

            if (
                plan === "one_day"
            ) {

                if (oneDayDateGroup) {

                    oneDayDateGroup.style.display =
                        "block";

                }


                if (oneDayDate) {

                    oneDayDate.innerHTML = `

                        <option value="">
                            Select Date
                        </option>

                        <option value="today">
                            Today
                        </option>

                        <option value="tomorrow">
                            Tomorrow
                        </option>

                    `;

                    oneDayDate.value =
                        "";

                }


                if (startDate) {

                    startDate.value =
                        "";

                }


                if (endDate) {

                    endDate.value =
                        "";

                }

            }


            // =================================================
            // ONE MONTH
            // =================================================

            else if (
                plan === "one_month"
            ) {

                if (startDateGroup) {

                    startDateGroup.style.display =
                        "block";

                }


                if (endDateGroup) {

                    endDateGroup.style.display =
                        "block";

                }


                if (oneDayDate) {

                    oneDayDate.value =
                        "";

                }


                calculateEndDate();

            }


            // =================================================
            // THREE MONTHS
            // =================================================

            else if (
                plan === "three_months"
            ) {

                if (startDateGroup) {

                    startDateGroup.style.display =
                        "block";

                }


                if (endDateGroup) {

                    endDateGroup.style.display =
                        "block";

                }


                if (oneDayDate) {

                    oneDayDate.value =
                        "";

                }


                calculateEndDate();

            }

        }


        // ====================================================
        // CALCULATE END DATE
        // ====================================================

        function calculateEndDate() {

            if (
                !startDate ||
                !endDate
            ) {

                return;

            }


            if (
                !startDate.value
            ) {

                endDate.value =
                    "";

                return;

            }


            const plan =
                planSelect.value;


            let days =
                0;


            if (
                plan === "one_month"
            ) {

                days =
                    30;

            }


            else if (
                plan === "three_months"
            ) {

                days =
                    90;

            }


            else {

                endDate.value =
                    "";

                return;

            }


            const date =
                new Date(
                    `${startDate.value}T00:00:00`
                );


            date.setDate(
                date.getDate() +
                days
            );


            endDate.value =
                formatDate(
                    date
                );

        }


        // ====================================================
        // SUMMARY HELPER
        // ====================================================

        function setSummaryValue(
            id,
            value
        ) {

            const element =
                document.getElementById(
                    id
                );


            if (element) {

                element.innerText =
                    value || "";

            }

        }


        // ====================================================
        // PLAN FROM URL
        // ====================================================

        const urlParams =
            new URLSearchParams(
                window.location.search
            );


        const urlPlan =
            urlParams.get(
                "plan"
            );


        if (
            urlPlan === "one_day" ||
            urlPlan === "one_month" ||
            urlPlan === "three_months"
        ) {

            planSelect.value =
                urlPlan;


            planSelect.disabled =
                true;

        }

        else {

            planSelect.disabled =
                false;

        }


        updatePlanUI();


        // ====================================================
        // PLAN CHANGE
        // ====================================================

        planSelect.addEventListener(
            "change",
            () => {

                updatePlanUI();

            }
        );


        // ====================================================
        // DATE CHANGE
        // ====================================================

        if (oneDayDate) {

            oneDayDate.addEventListener(
                "change",
                loadAvailableSlots
            );

        }


        // ====================================================
        // START DATE CHANGE
        // ====================================================

        if (startDate) {

            startDate.addEventListener(
                "change",
                calculateEndDate
            );

        }


        // ====================================================
        // FORM SUBMIT
        // ====================================================

bookingForm.addEventListener(
    "submit",
    async function (e) {

        e.preventDefault();


        // ====================================================
        // CUSTOMER LOGIN REQUIRED
        // ====================================================

        if (
            !window.supabaseClient
        ) {

            alert(
                "Unable to connect to the customer account system."
            );

            return;
        }


        const {
            data: {
                user
            },
            error: authError
        } =
            await window.supabaseClient
                .auth
                .getUser();


        if (
            authError ||
            !user
        ) {

            alert(
                "Please login or create a customer account before booking."
            );


            const currentPage =
                window.location.href;


            window.location.href =
                "customer-login.html?redirect=" +
                encodeURIComponent(
                    currentPage
                );


            return;
        }


        // ====================================================
        // EXISTING BOOKING LOGIC
        // ====================================================

        const plan =
            planSelect.value;


                // --------------------------------------------
                // PLAN
                // --------------------------------------------

                if (!plan) {

                    alert(
                        "Please select a plan."
                    );

                    return;

                }


                // --------------------------------------------
                // ONE DAY DATE
                // --------------------------------------------

                if (
                    plan === "one_day" &&
                    (
                        !oneDayDate ||
                        !oneDayDate.value
                    )
                ) {

                    alert(
                        "Please select Today or Tomorrow."
                    );

                    return;

                }


                // --------------------------------------------
                // ONE DAY SLOT
                // --------------------------------------------

                if (
                    plan === "one_day" &&
                    !selectedSlotId
                ) {

                    alert(
                        "Please select an available class slot."
                    );

                    return;

                }


                // --------------------------------------------
                // MEMBERSHIP START DATE
                // --------------------------------------------

                if (
                    (
                        plan === "one_month" ||
                        plan === "three_months"
                    ) &&
                    (
                        !startDate ||
                        !startDate.value
                    )
                ) {

                    alert(
                        "Please select a start date."
                    );

                    return;

                }


                // --------------------------------------------
                // GET PRICE
                // --------------------------------------------

                const planPrice =
                    await window.getPlanPrice();


                if (
                    planPrice === null ||
                    isNaN(
                        Number(planPrice)
                    )
                ) {

                    alert(
                        "Unable to load the selected plan price."
                    );

                    return;

                }


                // --------------------------------------------
                // CUSTOMER ELEMENTS
                // --------------------------------------------

                const name =
                    document.getElementById(
                        "name"
                    );


                const phone =
                    document.getElementById(
                        "phone"
                    );


                const email =
                    document.getElementById(
                        "email"
                    );


                const age =
                    document.getElementById(
                        "age"
                    );


                const gender =
                    document.getElementById(
                        "gender"
                    );


                const mode =
                    document.getElementById(
                        "mode"
                    );


                const medical =
                    document.getElementById(
                        "medical"
                    );


                // --------------------------------------------
                // SUMMARY
                // --------------------------------------------

                setSummaryValue(
                    "summaryName",
                    name
                        ? name.value
                        : ""
                );


                setSummaryValue(
                    "summaryPhone",
                    phone
                        ? phone.value
                        : ""
                );


                setSummaryValue(
                    "summaryEmail",
                    email
                        ? email.value
                        : ""
                );


                setSummaryValue(
                    "summaryAge",
                    age
                        ? age.value
                        : ""
                );


                setSummaryValue(
                    "summaryGender",
                    gender
                        ? gender.value
                        : ""
                );


                setSummaryValue(
                    "summaryPlan",
                    getPlanName(
                        plan
                    )
                );


                // --------------------------------------------
                // CLASS DATE
                // --------------------------------------------

                if (
                    plan === "one_day"
                ) {

                    let dateText =
                        "";


                    if (
                        oneDayDate.value ===
                        "today"
                    ) {

                        dateText =
                            `Today (${getTodayString()})`;

                    }

                    else {

                        dateText =
                            `Tomorrow (${getTomorrowString()})`;

                    }


                    setSummaryValue(
                        "summaryClassDate",
                        dateText
                    );

                }

                else {

                    setSummaryValue(
                        "summaryClassDate",
                        "—"
                    );

                }


                // --------------------------------------------
                // START DATE
                // --------------------------------------------

                setSummaryValue(
                    "summaryStartDate",
                    plan === "one_day"
                        ? "—"
                        : startDate.value
                );


                // --------------------------------------------
                // END DATE
                // --------------------------------------------

                setSummaryValue(
                    "summaryEndDate",
                    plan === "one_day"
                        ? "—"
                        : endDate.value
                );


                // --------------------------------------------
                // MODE
                // --------------------------------------------

                setSummaryValue(
                    "summaryMode",
                    mode
                        ? mode.value
                        : ""
                );


                // --------------------------------------------
                // MEDICAL
                // --------------------------------------------

                setSummaryValue(
                    "summaryMedical",
                    medical &&
                    medical.value
                        ? medical.value
                        : "None"
                );


                // --------------------------------------------
                // AMOUNT
                // --------------------------------------------

                setSummaryValue(
                    "summaryAmount",
                    `₹${Number(
                        planPrice
                    ).toFixed(2)}`
                );


                // --------------------------------------------
                // SLOT SUMMARY
                // --------------------------------------------

                if (
                    plan === "one_day"
                ) {

                    const selectedCard =
                        document.querySelector(
                            `.available-slot-card[data-slot-id="${selectedSlotId}"]`
                        );


                    if (selectedCard) {

                        const time =
                            selectedCard.querySelector(
                                "strong"
                            );


                        setSummaryValue(
                            "summarySlot",
                            time
                                ? time.innerText
                                : ""
                        );

                    }

                }

                else {

                    setSummaryValue(
                        "summarySlot",
                        "—"
                    );

                }


                // --------------------------------------------
                // SHOW SUMMARY
                // --------------------------------------------

                const bookingSummary =
                    document.getElementById(
                        "bookingSummary"
                    );


                if (bookingSummary) {

                    bookingSummary.style.display =
                        "block";


                    bookingSummary.scrollIntoView({
                        behavior:
                            "smooth"
                    });

                }

            }
        );

    }

}


// ============================================================
// CUSTOMER
// ============================================================

async function getOrCreateCustomer() {

    if (
        !window.supabaseClient
    ) {

        throw new Error(
            "Supabase connection is not available."
        );

    }


    const name =
        document.getElementById(
            "name"
        )?.value.trim();


    const phone =
        document.getElementById(
            "phone"
        )?.value.trim();


    const email =
        document.getElementById(
            "email"
        )?.value.trim();


    if (!name) {

        throw new Error(
            "Please enter your full name."
        );

    }


    if (!email) {

        throw new Error(
            "Please enter your email address."
        );

    }


    // ========================================================
    // FIND EXISTING CUSTOMER
    // ========================================================

    const {
        data: existing,
        error: findError
    } =
        await window.supabaseClient
            .from("customers")
            .select(
                "id"
            )
            .eq(
                "email",
                email
            )
            .limit(1)
            .maybeSingle();


    if (findError) {

        throw findError;

    }


    if (existing) {

        return existing.id;

    }


    // ========================================================
    // CREATE CUSTOMER
    // ========================================================

    const {
        data: customer,
        error
    } =
        await window.supabaseClient
            .from("customers")
            .insert({
                full_name:
                    name,

                phone:
                    phone || null,

                email:
                    email
            })
            .select(
                "id"
            )
            .single();


    if (error) {

        throw error;

    }


    return customer.id;

}


// ============================================================
// GET PLAN OBJECT
// ============================================================

async function getPlanForBooking() {

    const planSelect =
        document.getElementById(
            "plan"
        );


    if (!planSelect) {

        throw new Error(
            "Plan field not found."
        );

    }


    const slug =
        planSelect.value;


    if (!slug) {

        throw new Error(
            "Please select a plan."
        );

    }


    const {
        data: plan,
        error
    } =
        await window.supabaseClient
            .from("plans")
            .select(
                "id,name,slug"
            )
            .eq(
                "slug",
                slug
            )
            .eq(
                "is_active",
                true
            )
            .maybeSingle();


    if (error) {

        throw error;

    }


    if (!plan) {

        throw new Error(
            "Selected plan was not found."
        );

    }


    return plan;

}


// ============================================================
// GET CURRENT SERVICE FOR PAYMENT
// ============================================================

async function getBookingService() {

    const section =
        document.querySelector(
            ".booking[data-service-slug]"
        );


    if (!section) {

        throw new Error(
            "Service could not be identified."
        );

    }


    const slug =
        section.dataset.serviceSlug;


    const {
        data: service,
        error
    } =
        await window.supabaseClient
            .from("services")
            .select(
                "id,name,slug"
            )
            .eq(
                "slug",
                slug
            )
            .eq(
                "is_active",
                true
            )
            .maybeSingle();


    if (error) {

        throw error;

    }


    if (!service) {

        throw new Error(
            "Service was not found."
        );

    }


    return service;

}


// ============================================================
// GET BOOKING MODE
// ============================================================

// ============================================================
// GET BOOKING MODE
// ============================================================

// ============================================================
// GET BOOKING MODE
// ============================================================

function getBookingMode() {

    const modeElement =
        document.getElementById("mode");

    let mode =
        modeElement
            ? modeElement.value
            : "offline";

    mode =
        String(mode)
            .toLowerCase()
            .trim();

    // OFFLINE
    if (
        mode === "offline" ||
        mode === "offline (studio)" ||
        mode === "offline_studio" ||
        mode === "studio"
    ) {
        mode = "offline";
    }

    // ONLINE
    if (
        mode === "online" ||
        mode === "online (studio)" ||
        mode === "online (live classes)" ||
        mode === "online_live_classes" ||
        mode === "live classes" ||
        mode === "live"
    ) {
        mode = "online";
    }

    console.log(
        "BOOKING MODE:",
        mode
    );

    return mode;
}


// ============================================================
// RECHECK ONE DAY SLOT
// ============================================================

async function verifySlotAvailability(
    slotId
) {

    const {
        data,
        error
    } =
        await window.supabaseClient
            .from(
                "class_slot_availability"
            )
            .select(`
                class_slot_id,
                service_id,
                available_seats,
                is_full,
                is_active,
                start_time,
                end_time
            `)
            .eq(
                "class_slot_id",
                slotId
            )
            .maybeSingle();


    if (error) {

        throw error;

    }


    if (!data) {

        throw new Error(
            "The selected class slot no longer exists."
        );

    }


    if (!data.is_active) {

        throw new Error(
            "This class slot is no longer active."
        );

    }
    if (
        new Date(
            data.end_time
        ).getTime() <= Date.now()
    ) {

        throw new Error(
            "This class slot has already ended. Please select another slot."
        );

    }


    if (
        data.is_full ||
        Number(
            data.available_seats
        ) <= 0
    ) {

        throw new Error(
            "Sorry, this class slot is now full. Please select another slot."
        );

    }


    return data;

}


// ============================================================
// CREATE ONE DAY CONFIRMED BOOKING
// ============================================================

async function createOneDayBooking() {

    const slotId =
        selectedSlotId;


    if (!slotId) {

        throw new Error(
            "Please select a class slot."
        );

    }


    // ========================================================
    // RECHECK AVAILABILITY
    // ========================================================

    const slot =
        await verifySlotAvailability(
            slotId
        );


    // ========================================================
    // SERVICE
    // ========================================================

    const service =
        await getBookingService();


    // ========================================================
    // PLAN
    // ========================================================

    const plan =
        await getPlanForBooking();


    // ========================================================
    // CUSTOMER
    // ========================================================

    const customerId =
        await getOrCreateCustomer();


    // ========================================================
    // PRICE
    // ========================================================

    const price =
        await window.getPlanPrice();


    if (
        price === null ||
        isNaN(
            Number(price)
        )
    ) {

        throw new Error(
            "Unable to determine the selected plan price."
        );

    }


    // ========================================================
    // CONFIRMED BOOKING
    // ========================================================

    const {
        data: booking,
        error
    } =
        await window.supabaseClient
            .from("bookings")
            .insert({

                customer_id:
                    customerId,

                class_slot_id:
                    Number(
                        slot.class_slot_id
                    ),

                booking_status:
                    "confirmed",

                payment_status:
                    "paid",

                amount:
                    Number(price),

                plan_id:
                    plan.id,

                membership_id:
                    null

            })
            .select(
                "id"
            )
            .single();


    if (error) {

        throw error;

    }


    completedBookingId =
        booking.id;


    console.log(
        "ONE DAY BOOKING CREATED:",
        booking
    );


    return booking;

}


// ============================================================
// CREATE MEMBERSHIP
// ============================================================

// ============================================================
// CREATE MEMBERSHIP BOOKING
// ============================================================

// ============================================================
// CREATE MEMBERSHIP BOOKING
// ============================================================

// ============================================================
// CREATE MEMBERSHIP
// ============================================================

async function createMembershipBooking() {

    // ========================================================
    // START DATE
    // ========================================================

    const startDate =
        document.getElementById("startDate");

    if (
        !startDate ||
        !startDate.value
    ) {
        throw new Error(
            "Please select a membership start date."
        );
    }


    // ========================================================
    // END DATE
    // ========================================================

    const endDate =
        document.getElementById("endDate");

    if (
        !endDate ||
        !endDate.value
    ) {
        throw new Error(
            "Membership end date could not be calculated."
        );
    }


    // ========================================================
    // SERVICE
    // ========================================================

    const service =
        await getBookingService();

    if (
        !service ||
        !service.id
    ) {
        throw new Error(
            "Unable to determine the selected service."
        );
    }


    // ========================================================
    // PLAN
    // ========================================================

    const plan =
        await getPlanForBooking();

    if (
        !plan ||
        !plan.id
    ) {
        throw new Error(
            "Unable to determine the selected membership plan."
        );
    }


    // ========================================================
    // CUSTOMER
    // ========================================================

    const customerId =
        await getOrCreateCustomer();

    if (!customerId) {
        throw new Error(
            "Customer could not be identified."
        );
    }


    // ========================================================
    // PRICE
    // ========================================================

    const price =
        await window.getPlanPrice();

    if (
        price === null ||
        price === undefined ||
        isNaN(Number(price))
    ) {
        throw new Error(
            "Unable to determine membership price."
        );
    }


    // ========================================================
    // BOOKING MODE
    // ========================================================

    const bookingMode =
        getBookingMode();


    // ========================================================
    // CREATE MEMBERSHIP ONLY
    // ========================================================

    const {
        data: membership,
        error: membershipError
    } =
        await window.supabaseClient
            .from("memberships")
            .insert({
                customer_id:
                    customerId,

                plan_id:
                    plan.id,

                service_id:
                    service.id,

                start_date:
                    startDate.value,

                end_date:
                    endDate.value,

                booking_mode:
                    bookingMode,

                status:
                    "active",
                payment_status:
                    "paid",
                amount:
                    Number(price)
            })
            .select(
                "id"
            )
            .single();


    // ========================================================
    // MEMBERSHIP ERROR
    // ========================================================

    if (membershipError) {

        console.error(
            "Membership creation error:",
            membershipError
        );

        throw membershipError;
    }


    // ========================================================
    // VERIFY MEMBERSHIP
    // ========================================================

    if (
        !membership ||
        !membership.id
    ) {
        throw new Error(
            "Membership was not created."
        );
    }


    // ========================================================
    // SAVE MEMBERSHIP ID
    // ========================================================

    completedMembershipId =
        membership.id;


    // IMPORTANT:
    // A membership does NOT get a class slot
    // or a booking at purchase time.

    completedBookingId =
        null;


    console.log(
        "MEMBERSHIP CREATED SUCCESSFULLY:",
        {
            membershipId:
                completedMembershipId,

            serviceId:
                service.id,

            planId:
                plan.id,

            startDate:
                startDate.value,

            endDate:
                endDate.value,

            bookingMode:
                bookingMode,

            amount:
                Number(price)
        }
    );


    // ========================================================
    // RETURN
    // ========================================================

    return {
        membership:
            membership,

        booking:
            null
    };
}

// ============================================================
// BOOKING ID
// ============================================================

const bookingId =
    "ABH" +
    new Date().getFullYear() +
    Math.floor(
        1000 +
        Math.random() * 9000
    );


const bookingIdElement =
    document.getElementById(
        "bookingId"
    );


if (bookingIdElement) {

    bookingIdElement.innerText =
        "#" + bookingId;

}


// ============================================================
// PROCEED TO PAYMENT
// ============================================================

const proceedBtn =
    document.getElementById(
        "proceedPaymentBtn"
    );


if (proceedBtn) {

    proceedBtn.addEventListener(
        "click",
        async function () {

            if (paymentProcessing) {

                return;

            }


            const paymentSection =
                document.getElementById(
                    "paymentSection"
                );


            if (!paymentSection) {

                console.error(
                    "Payment section not found."
                );

                return;

            }


            const plan =
                document.getElementById(
                    "plan"
                )?.value;


            if (!plan) {

                alert(
                    "Please select a plan."
                );

                return;

            }


            // =================================================
            // ONE DAY VALIDATION
            // =================================================

            if (
                plan === "one_day" &&
                !selectedSlotId
            ) {

                alert(
                    "Please select an available class slot."
                );

                return;

            }


            // =================================================
            // MEMBERSHIP VALIDATION
            // =================================================

            if (
                (
                    plan === "one_month" ||
                    plan === "three_months"
                ) &&
                !document.getElementById(
                    "startDate"
                )?.value
            ) {

                alert(
                    "Please select a start date."
                );

                return;

            }


            // =================================================
            // PRICE
            // =================================================

            const price =
                await window.getPlanPrice();


            if (
                price === null ||
                price === undefined ||
                isNaN(
                    Number(price)
                )
            ) {

                alert(
                    "Unable to load the selected plan price."
                );

                return;

            }


            const amount =
                Number(price);


            // =================================================
            // UPDATE PAYMENT AMOUNT
            // =================================================

            const paymentAmount =
                document.getElementById(
                    "paymentAmount"
                );


            if (paymentAmount) {

                paymentAmount.innerText =
                    "₹" +
                    amount.toFixed(2);

            }


            const payAmount =
                document.getElementById(
                    "payAmount"
                );


            if (payAmount) {

                payAmount.innerText =
                    "₹" +
                    amount.toFixed(2);

            }


            // =================================================
            // SHOW PAYMENT
            // =================================================

            paymentSection.style.display =
                "block";


            paymentSection.scrollIntoView({
                behavior:
                    "smooth"
            });

        }
    );

}


// ============================================================
// PAY NOW - RAZORPAY
// ============================================================

const payNowBtn =
    document.getElementById(
        "payNowBtn"
    );


if (payNowBtn) {

    payNowBtn.addEventListener(
        "click",
        async function () {

            if (paymentProcessing) {

                return;

            }


            paymentProcessing =
                true;


            const originalText =
                payNowBtn.innerText;


            payNowBtn.disabled =
                true;


            payNowBtn.innerText =
                "Processing...";


            try {

                // ====================================================
                // CHECK SUPABASE
                // ====================================================

                if (
                    !window.supabaseClient
                ) {

                    throw new Error(
                        "Supabase connection is not available."
                    );

                }


                // ====================================================
                // CHECK RAZORPAY
                // ====================================================

                if (
                    typeof Razorpay !==
                    "function"
                ) {

                    throw new Error(
                        "Razorpay Checkout is not loaded."
                    );

                }


                // ====================================================
                // GET PLAN
                // ====================================================

                const planElement =
                    document.getElementById(
                        "plan"
                    );


                if (!planElement) {

                    throw new Error(
                        "Plan field not found."
                    );

                }


                const planSlug =
                    planElement.value;


                if (!planSlug) {

                    throw new Error(
                        "Please select a plan."
                    );

                }


                // ====================================================
                // VALIDATE ONE DAY SLOT
                // ====================================================

                if (
                    planSlug ===
                    "one_day"
                ) {

                    if (
                        !selectedSlotId
                    ) {

                        throw new Error(
                            "Please select an available class slot."
                        );

                    }


                    // Recheck availability
                    await verifySlotAvailability(
                        selectedSlotId
                    );

                }


                // ====================================================
                // VALIDATE MEMBERSHIP DATES
                // ====================================================

                if (
                    planSlug ===
                        "one_month" ||
                    planSlug ===
                        "three_months"
                ) {

                    const startDateElement =
                        document.getElementById(
                            "startDate"
                        );

                    const endDateElement =
                        document.getElementById(
                            "endDate"
                        );


                    if (
                        !startDateElement ||
                        !startDateElement.value
                    ) {

                        throw new Error(
                            "Please select a membership start date."
                        );

                    }


                    if (
                        !endDateElement ||
                        !endDateElement.value
                    ) {

                        throw new Error(
                            "Membership end date could not be calculated."
                        );

                    }

                }


                // ====================================================
                // GET SERVICE
                // ====================================================

                const service =
                    await getBookingService();


                if (
                    !service ||
                    !service.id
                ) {

                    throw new Error(
                        "Unable to determine the selected service."
                    );

                }


                // ====================================================
                // GET PLAN
                // ====================================================

                const plan =
                    await getPlanForBooking();


                if (
                    !plan ||
                    !plan.id
                ) {

                    throw new Error(
                        "Unable to determine the selected plan."
                    );

                }


                // ====================================================
                // GET BOOKING MODE
                // ====================================================

                const bookingMode =
                    getBookingMode();


                // ====================================================
                // CUSTOMER
                //
                // This makes sure the customer record exists.
                // The Edge Function independently verifies the
                // authenticated user's email.
                // ====================================================

                await getOrCreateCustomer();


                // ====================================================
                // START / END DATE
                // ====================================================

                const startDateElement =
                    document.getElementById(
                        "startDate"
                    );

                const endDateElement =
                    document.getElementById(
                        "endDate"
                    );


                const startDateValue =
                    startDateElement
                        ? startDateElement.value
                        : null;


                const endDateValue =
                    endDateElement
                        ? endDateElement.value
                        : null;


                // ====================================================
                // CREATE RAZORPAY ORDER
                //
                // IMPORTANT:
                // Amount is NOT sent from the browser.
                // hyper-worker gets the real price from DB.
                // ====================================================

                const {
                    data: orderData,
                    error: orderError
                } =
                    await window.supabaseClient.functions.invoke(
                        "hyper-worker",
                        {
                            body: {

                                service_id:
                                    Number(
                                        service.id
                                    ),

                                plan_id:
                                    Number(
                                        plan.id
                                    ),

                                booking_mode:
                                    bookingMode,

                                class_slot_id:
                                    planSlug ===
                                    "one_day"
                                        ? Number(
                                            selectedSlotId
                                        )
                                        : null,

                                start_date:
                                    (
                                        planSlug ===
                                            "one_month" ||
                                        planSlug ===
                                            "three_months"
                                    )
                                        ? startDateValue
                                        : null,

                                end_date:
                                    (
                                        planSlug ===
                                            "one_month" ||
                                        planSlug ===
                                            "three_months"
                                    )
                                        ? endDateValue
                                        : null,

                                special_session_id:
                                    null

                            }
                        }
                    );


                if (orderError) {

                    console.error(
                        "Razorpay order error:",
                        orderError
                    );

                    throw new Error(
                        orderError.message ||
                        "Unable to create Razorpay order."
                    );

                }


                if (
                    !orderData ||
                    !orderData.success
                ) {

                    throw new Error(
                        orderData?.error ||
                        "Unable to create Razorpay order."
                    );

                }


                // ====================================================
                // VERIFY ORDER RESPONSE
                // ====================================================

                if (
                    !orderData.order_id ||
                    !orderData.payment_intent_id ||
                    !orderData.key_id ||
                    !orderData.amount
                ) {

                    console.error(
                        "Invalid order response:",
                        orderData
                    );

                    throw new Error(
                        "Invalid Razorpay order response."
                    );

                }


                console.log(
                    "RAZORPAY ORDER CREATED:",
                    orderData
                );


                // ====================================================
                // CUSTOMER PREFILL
                // ====================================================

                const customerName =
                    document.getElementById(
                        "name"
                    )?.value.trim() || "";


                const customerPhone =
                    document.getElementById(
                        "phone"
                    )?.value.trim() || "";


                const customerEmail =
                    document.getElementById(
                        "email"
                    )?.value.trim() || "";


                // ====================================================
                // RAZORPAY CHECKOUT OPTIONS
                // ====================================================

                const razorpayOptions = {

                    key:
                        orderData.key_id,

                    amount:
                        Number(
                            orderData.amount
                        ),

                    currency:
                        orderData.currency ||
                        "INR",

                    name:
                        "ABH Yogaa Studio",

                    description:
                        plan.name ||
                        "Yoga Booking",

                    order_id:
                        orderData.order_id,


                    // ==================================================
                    // PAYMENT SUCCESS CALLBACK
                    // ==================================================

                    handler:
                        async function (
                            response
                        ) {

                            try {

                                console.log(
                                    "RAZORPAY PAYMENT RESPONSE:",
                                    response
                                );


                                payNowBtn.innerText =
                                    "Verifying payment...";


                                // ========================================
                                // SERVER-SIDE PAYMENT VERIFICATION
                                // ========================================

                                const {
                                    data:
                                        verificationData,
                                    error:
                                        verificationError
                                } =
                                    await window.supabaseClient
                                        .functions
                                        .invoke(
                                            "hyper-responder",
                                            {
                                                body: {

                                                    payment_intent_id:
                                                        Number(
                                                            orderData.payment_intent_id
                                                        ),

                                                    razorpay_payment_id:
                                                        response.razorpay_payment_id,

                                                    razorpay_signature:
                                                        response.razorpay_signature

                                                }
                                            }
                                        );


                                if (
                                    verificationError
                                ) {

                                    console.error(
                                        "Payment verification error:",
                                        verificationError
                                    );

                                    throw new Error(
                                        verificationError.message ||
                                        "Payment verification failed."
                                    );

                                }


                                if (
                                    !verificationData ||
                                    !verificationData.success
                                ) {

                                    throw new Error(
                                        verificationData?.error ||
                                        "Payment verification failed."
                                    );

                                }


                                // ========================================
                                // PAYMENT + BOOKING SUCCESS
                                // ========================================

                                console.log(
                                    "PAYMENT VERIFIED:",
                                    verificationData
                                );


                                const finalization =
                                    verificationData.finalization ||
                                    {};


                                // Try to get booking ID
                                // from finalization response.
                                if (
                                    finalization.booking_id
                                ) {

                                    completedBookingId =
                                        finalization.booking_id;

                                }


                                // Try to get membership ID
                                // from finalization response.
                                if (
                                    finalization.membership_id
                                ) {

                                    completedMembershipId =
                                        finalization.membership_id;

                                }


                                // ========================================
                                // HIDE PAYMENT SECTION
                                // ========================================

                                const paymentSection =
                                    document.getElementById(
                                        "paymentSection"
                                    );


                                const paymentSuccess =
                                    document.getElementById(
                                        "paymentSuccess"
                                    );


                                if (
                                    paymentSection &&
                                    paymentSuccess
                                ) {

                                    paymentSection.parentNode.insertBefore(
                                        paymentSuccess,
                                        paymentSection.nextSibling
                                    );

                                    paymentSection.style.display =
                                        "none";

                                }


                                // ========================================
                                // SHOW SUCCESS
                                // ========================================

                                if (
                                    paymentSuccess
                                ) {

                                    paymentSuccess.style.display =
                                        "block";


                                    const successMode =
                                        document.getElementById(
                                            "successMode"
                                        );


                                    const summaryMode =
                                        document.getElementById(
                                            "summaryMode"
                                        );


                                    if (
                                        successMode &&
                                        summaryMode
                                    ) {

                                        successMode.innerText =
                                            summaryMode.innerText;

                                    }


                                    paymentSuccess.scrollIntoView({
                                        behavior:
                                            "smooth"
                                    });

                                }


                                // ========================================
                                // LOG FINAL RESULT
                                // ========================================

                                console.log(
                                    "BOOKING PAYMENT COMPLETED",
                                    {

                                        paymentIntentId:
                                            orderData.payment_intent_id,

                                        razorpayOrderId:
                                            orderData.order_id,

                                        razorpayPaymentId:
                                            response.razorpay_payment_id,

                                        bookingId:
                                            completedBookingId,

                                        membershipId:
                                            completedMembershipId

                                    }
                                );


                                alert(
                                    "Payment successful! Your booking has been confirmed."
                                );


                                paymentProcessing =
                                    false;


                                payNowBtn.disabled =
                                    false;


                                payNowBtn.innerText =
                                    originalText;

                            }

                            catch (
                                verificationError
                            ) {

                                console.error(
                                    "Payment verification failed:",
                                    verificationError
                                );


                                alert(
                                    verificationError.message ||
                                    "Payment was received, but verification failed. Please contact the studio before making another payment."
                                );


                                payNowBtn.disabled =
                                    false;


                                payNowBtn.innerText =
                                    originalText;


                                paymentProcessing =
                                    false;

                            }

                        },


                    // ==================================================
                    // PREFILL CUSTOMER
                    // ==================================================

                    prefill: {

                        name:
                            customerName,

                        email:
                            customerEmail,

                        contact:
                            customerPhone

                    },


                    // ==================================================
                    // CHECKOUT THEME
                    // ==================================================

                    theme: {

                        color:
                            "#8B6F47"

                    },


                    // ==================================================
                    // MODAL
                    // ==================================================

                    modal: {

                        ondismiss:
                            function () {

                                console.log(
                                    "Razorpay Checkout dismissed."
                                );


                                paymentProcessing =
                                    false;


                                payNowBtn.disabled =
                                    false;


                                payNowBtn.innerText =
                                    originalText;

                            }

                    }

                };


                // ====================================================
                // OPEN RAZORPAY
                // ====================================================

                const razorpay =
                    new Razorpay(
                        razorpayOptions
                    );


                // ====================================================
                // PAYMENT FAILED
                // ====================================================

                razorpay.on(
                    "payment.failed",
                    function (
                        response
                    ) {

                        console.error(
                            "Razorpay payment failed:",
                            response
                        );


                        alert(
                            response.error?.description ||
                            "Payment failed. Please try again."
                        );


                        paymentProcessing =
                            false;


                        payNowBtn.disabled =
                            false;


                        payNowBtn.innerText =
                            originalText;

                    }
                );


                // ====================================================
                // OPEN CHECKOUT
                // ====================================================

                razorpay.open();

            }

            catch (
                error
            ) {

                console.error(
                    "Booking/payment error:",
                    error
                );


                alert(
                    error.message ||
                    "Unable to start payment."
                );


                payNowBtn.disabled =
                    false;


                payNowBtn.innerText =
                    originalText;


                paymentProcessing =
                    false;

            }

        }
    );

}


// ============================================================
// SCROLL REVEAL
// ============================================================

const reveals =
    document.querySelectorAll(
        ".reveal"
    );


function revealSections() {

    reveals.forEach(
        section => {

            const top =
                section
                    .getBoundingClientRect()
                    .top;


            const windowHeight =
                window.innerHeight;


            if (
                top <
                windowHeight - 120
            ) {

                section.classList.add(
                    "active"
                );

            }

        }
    );

}


window.addEventListener(
    "scroll",
    revealSections
);


revealSections();


// ============================================================
// PAYMENT CARD SELECTION
// ============================================================

const paymentCards =
    document.querySelectorAll(
        ".payment-card"
    );


const paymentRadios =
    document.querySelectorAll(
        'input[name="payment"]'
    );


paymentCards.forEach(
    card => {

        card.addEventListener(
            "click",
            () => {

                paymentCards.forEach(
                    otherCard => {

                        otherCard.classList.remove(
                            "active"
                        );

                    }
                );


                paymentRadios.forEach(
                    radio => {

                        radio.checked =
                            false;

                    }
                );


                card.classList.add(
                    "active"
                );


                const radio =
                    card.querySelector(
                        'input[name="payment"]'
                    );


                if (radio) {

                    radio.checked =
                        true;

                }

            }
        );

    }
);


// ============================================================
// DEBUG
// ============================================================

console.log(
    "ABH Yogaa Studio JavaScript loaded successfully."
);